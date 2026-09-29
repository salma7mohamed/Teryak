/**
 * Teryak Platform - Admin Medicines Management Logic
 * Connected with Backend API (/api/medicines) & Bulk Import/Export
 */

document.addEventListener('DOMContentLoaded', async () => {
  const activeNavItem = document.querySelector('.sidebar-nav .nav-item.active');
  if (activeNavItem) {
    activeNavItem.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
  }

  // 1. Mobile Sidebar Toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (sidebarToggle && sidebar && sidebarOverlay) {
    const toggleMenu = () => {
      sidebar.classList.toggle('active');
      sidebarOverlay.classList.toggle('active');
    };
    sidebarToggle.addEventListener('click', toggleMenu);
    sidebarOverlay.addEventListener('click', toggleMenu);
  }

  // 2. DOM Elements
  const medSearchInput = document.getElementById('medicineSearchInput');
  const medList = document.getElementById('medicinesList');
  const openMedModalBtn = document.getElementById('openAddMedicineModalBtn');
  const closeMedModalBtn = document.getElementById('closeAddMedModalBtn');
  const cancelMedModalBtn = document.getElementById('cancelMedModalBtn');
  const medModal = document.getElementById('addMedicineModal');
  const addMedForm = document.getElementById('addMedicineForm');

  const openBulkBtn = document.getElementById('openBulkImportModalBtn');
  const exportBtn = document.getElementById('exportMedicinesBtn');

  let currentMedicines = [];

  // 3. Fallback Initial Catalog
  const defaultMedicines = [
    {
      _id: 'med_1',
      nameAr: 'باراسيتامول 500 مجم',
      nameEn: 'Paracetamol',
      category: 'مسكنات',
      price: 24.50,
      status: 'active',
      pharmaciesCount: 48,
      image: '../../assets/images/parst.jpg',
    },
    {
      _id: 'med_2',
      nameAr: 'أموكسيسيلين 500 مجم',
      nameEn: 'Amoxicillin',
      category: 'مضادات حيوية',
      price: 45.00,
      status: 'active',
      pharmaciesCount: 32,
      image: '../../assets/images/amoc.jpg',
    },
    {
      _id: 'med_3',
      nameAr: 'فيتامين د 1000 وحدة',
      nameEn: 'Vitamin D3',
      category: 'فيتامينات',
      price: 25.00,
      status: 'active',
      pharmaciesCount: 55,
      image: '../../assets/images/vitamine.jpg',
    },
  ];

  // 4. Load Medicines from API
  async function loadMedicines() {
    let items = [];

    try {
      if (window.API && window.API.medicines) {
        const res = await window.API.medicines.getAll({ limit: 100 });
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          items = res.data.map(m => ({
            _id: m._id,
            nameAr: m.nameAr,
            nameEn: m.nameEn || m.nameAr,
            category: m.category || 'أدوية عامة',
            price: m.price || 25,
            status: m.status || 'active',
            pharmaciesCount: m.pharmaciesCount || 12,
            image: m.image || '../../assets/images/parst.jpg',
          }));
        }
      }
    } catch (e) {
      console.warn('[Admin Medicines API Fallback]:', e.message);
    }

    if (items.length === 0) {
      try {
        const local = JSON.parse(localStorage.getItem('admin_medicines_catalog'));
        items = local && local.length > 0 ? local : defaultMedicines;
      } catch (e) {
        items = defaultMedicines;
      }
    }

    currentMedicines = items;
    saveLocalMedicines();
    renderMedicines(currentMedicines);
  }

  function saveLocalMedicines() {
    try {
      localStorage.setItem('admin_medicines_catalog', JSON.stringify(currentMedicines));
    } catch (e) {}
  }

  // 5. Render Medicines List
  function renderMedicines(items) {
    if (!medList) return;

    if (items.length === 0) {
      medList.innerHTML = `
        <div class="text-center py-5 text-muted bg-white border rounded">
          <i class="fa-solid fa-pills fs-2 mb-2 text-muted"></i>
          <p class="font-bold mb-0">لا توجد أدوية مطابقة للبحث</p>
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach(med => {
      const statusText = med.status === 'active' || med.status === 'نشط' ? 'نشط' : 'قيد المراجعة';
      const statusClass = med.status === 'active' || med.status === 'نشط' ? 'status-active' : 'status-pending';
      const img = med.image || '../../assets/images/parst.jpg';

      html += `
        <div class="medicine-card" data-id="${med._id}">
          <div class="medicine-right">
            <div class="medicine-img-box colorful">
              <img src="${img}" alt="${med.nameAr}" class="medicine-image" onerror="this.src='../../assets/images/parst.jpg'">
            </div>
            <div class="medicine-details">
              <h3 class="medicine-name">${med.nameAr}</h3>
              <div class="medicine-subtext">
                <span class="eng-name">${med.nameEn}</span>
                <span class="dot">•</span>
                <span class="category-name">${med.category}</span>
                <span class="dot">•</span>
                <span class="pharmacy-count">${med.pharmaciesCount || 10} صيدلية</span>
                <span class="dot">•</span>
                <span class="fw-bold text-success">${Number(med.price || 25).toFixed(2)} ج.م</span>
              </div>
            </div>
          </div>
          
          <div class="medicine-left">
            <span class="status-badge ${statusClass}">${statusText}</span>
            <div class="actions-group">
              <button class="action-btn delete-btn" title="حذف" data-id="${med._id}" data-name="${med.nameAr}">
                <i class="fa-solid fa-trash-can"></i>
              </button>
              <a href="../public/medicine-detail.html?id=${med._id}" class="action-btn view-btn" title="معاينة الدواء">
                <i class="fa-solid fa-eye"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    });

    medList.innerHTML = html;
    bindDeleteActions();
  }

  // Bind Delete Actions
  function bindDeleteActions() {
    medList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const medId = btn.dataset.id;
        const name = btn.dataset.name || 'الدواء';

        let confirmed = true;
        if (window.Toast && window.Toast.confirm) {
          confirmed = await window.Toast.confirm({
            title: 'حذف الدواء',
            message: `هل أنت متأكد من رغبتك في حذف (${name}) من الكتالوج العام نهائياً؟`,
            type: 'danger',
            confirmText: 'حذف',
            cancelText: 'إلغاء'
          });
        }

        if (confirmed) {
          try {
            if (window.API && window.API.medicines && medId && medId.length === 24) {
              await window.API.medicines.delete(medId);
            }
          } catch (err) {
            console.warn('API delete medicine fallback:', err.message);
          }

          currentMedicines = currentMedicines.filter(m => m._id !== medId);
          saveLocalMedicines();
          renderMedicines(currentMedicines);

          if (window.Toast) {
            window.Toast.success(`تم حذف (${name}) من الكتالوج بنجاح`, 'تم الحذف');
          }
        }
      });
    });
  }

  // 6. Search Filter
  if (medSearchInput) {
    medSearchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderMedicines(currentMedicines);
        return;
      }
      const filtered = currentMedicines.filter(m => {
        return (
          m.nameAr.toLowerCase().includes(query) ||
          m.nameEn.toLowerCase().includes(query) ||
          m.category.toLowerCase().includes(query)
        );
      });
      renderMedicines(filtered);
    });
  }

  // 7. Modal Handlers (Add Medicine)
  if (openMedModalBtn && medModal) {
    const openMedModal = () => {
      medModal.style.display = 'flex';
      medModal.classList.add('active');
    };
    const closeMedModal = () => {
      medModal.style.display = 'none';
      medModal.classList.remove('active');
    };

    openMedModalBtn.addEventListener('click', openMedModal);
    if (closeMedModalBtn) closeMedModalBtn.addEventListener('click', closeMedModal);
    if (cancelMedModalBtn) cancelMedModalBtn.addEventListener('click', closeMedModal);

    if (addMedForm) {
      addMedForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const mName = document.getElementById('newMedName')?.value.trim();
        const engName = document.getElementById('newMedEngName')?.value.trim() || mName;
        const category = document.getElementById('newMedCategory')?.value || 'عام';
        const price = Number(document.getElementById('newMedPrice')?.value) || 35.0;
        const dosageForm = document.getElementById('newMedDosageForm')?.value || 'أقراص';
        const status = document.getElementById('newMedStatus')?.value || 'active';

        if (!mName) {
          if (window.Toast) window.Toast.warning('يرجى كتابة اسم الدواء بالعربية', 'حقل مطلوب');
          return;
        }

        let newId = `med_${Date.now()}`;

        try {
          if (window.API && window.API.medicines) {
            const res = await window.API.medicines.create({
              nameAr: mName,
              nameEn: engName,
              category,
              price: price,
              dosageForm,
              status: status === 'قيد المراجعة' ? 'pending' : 'active',
            });
            if (res && res.data && res.data._id) {
              newId = res.data._id;
            }
          }
        } catch (err) {
          console.warn('API create medicine fallback:', err.message);
        }

        const newMed = {
          _id: newId,
          nameAr: mName,
          nameEn: engName,
          category,
          price: price,
          status: status === 'قيد المراجعة' ? 'pending' : 'active',
          pharmaciesCount: 1,
          image: '../../assets/images/parst.jpg',
        };

        currentMedicines.unshift(newMed);
        saveLocalMedicines();
        renderMedicines(currentMedicines);

        if (window.Toast) {
          window.Toast.success(`تمت إضافة دواء (${mName}) للكتالوج بنجاح`, 'تمت الإضافة');
        }

        addMedForm.reset();
        closeMedModal();
      });
    }
  }

  // 8. Bulk Import System (Admin)
  if (openBulkBtn) {
    openBulkBtn.addEventListener('click', () => {
      const modalEl = document.getElementById('adminBulkImportModal');
      if (modalEl) {
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
      }
    });

    const dlTemplateBtn = document.getElementById('adminDownloadTemplateBtn');
    if (dlTemplateBtn) {
      dlTemplateBtn.addEventListener('click', () => {
        const templateContent = 'الاسم العربي,الاسم الإنجليزي,الفئة,السعر\nبانادول إكسترا أقراص,Panadol Extra,مسكنات,45.00\nأوجمنتين 1 جم أقراص,Augmentin 1g,مضادات حيوية,110.00\nأوميجا 3 بلس كبسول,Omega 3 Plus,مكملات غذائية,120.00';
        const blob = new Blob(['\uFEFF' + templateContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'قالب_كتالوج_أدوية_ترياق.csv';
        link.click();
      });
    }

    const adminFileInput = document.getElementById('adminCsvFileInput');
    const adminTextInput = document.getElementById('adminCsvTextInput');
    const adminExecBtn = document.getElementById('adminExecuteImportBtn');

    if (adminFileInput && adminTextInput) {
      adminFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            adminTextInput.value = event.target.result;
          };
          reader.readAsText(file, 'UTF-8');
        }
      });
    }

    if (adminExecBtn && adminTextInput) {
      adminExecBtn.addEventListener('click', async () => {
        const raw = adminTextInput.value.trim();
        if (!raw) {
          if (window.Toast) window.Toast.warning('يرجى لصق بيانات CSV أو اختيار ملف', 'لا توجد بيانات');
          return;
        }

        const lines = raw.split(/\r?\n/).filter(l => l.trim() !== '');
        const startIndex = (lines[0] && (lines[0].includes('الاسم') || lines[0].toLowerCase().includes('name'))) ? 1 : 0;
        const medsToImport = [];

        for (let i = startIndex; i < lines.length; i++) {
          const p = lines[i].split(',').map(x => x.trim());
          if (p[0]) {
            medsToImport.push({
              nameAr: p[0],
              nameEn: p[1] || p[0],
              category: p[2] || 'أدوية عامة',
              price: Number(p[3]) || 35.0,
            });
          }
        }

        if (medsToImport.length === 0) {
          if (window.Toast) window.Toast.warning('لم يتم العثور على أدوية صالحة بالملف', 'خطأ في التنسيق');
          return;
        }

        adminExecBtn.disabled = true;
        adminExecBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> جاري استيراد الأدوية...';

        try {
          if (window.API && window.API.medicines) {
            await window.API.medicines.bulkImport(medsToImport);
          }
        } catch (err) {
          console.warn('Admin Bulk import API fallback:', err.message);
        }

        medsToImport.forEach(item => {
          const existing = currentMedicines.find(m => m.nameAr === item.nameAr);
          if (existing) {
            existing.price = item.price;
            existing.category = item.category;
          } else {
            currentMedicines.unshift({
              _id: `med_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              nameAr: item.nameAr,
              nameEn: item.nameEn,
              category: item.category,
              price: item.price,
              status: 'active',
              pharmaciesCount: 5,
              image: '../../assets/images/parst.jpg',
            });
          }
        });

        saveLocalMedicines();
        renderMedicines(currentMedicines);

        const modalEl = document.getElementById('adminBulkImportModal');
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        if (window.Toast) {
          window.Toast.success(`تم استيراد ${medsToImport.length} دواء إلى الكتالوج بنجاح!`, 'تم الاستيراد');
        }

        adminExecBtn.disabled = false;
        adminExecBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up me-1"></i> بدء الاستيراد للكتالوج';
      });
    }
  }

  // 9. Export Catalog
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (!currentMedicines || currentMedicines.length === 0) {
        if (window.Toast) window.Toast.warning('الكتالوج فارغ حالياً لتصديره', 'تنبيه');
        return;
      }

      let csv = 'الاسم العربي,الاسم الإنجليزي,الفئة,السعر,الحالة\n';
      currentMedicines.forEach(m => {
        csv += `"${m.nameAr}","${m.nameEn || ''}","${m.category || ''}",${m.price || 25},"${m.status || 'active'}"\n`;
      });

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `كتالوج_أدوية_ترياق_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      if (window.Toast) window.Toast.success('تم تصدير كتالوج الأدوية بصيغة CSV بنجاح', 'تصدير الكتالوج');
    });
  }

  // Load initial data
  loadMedicines();
});