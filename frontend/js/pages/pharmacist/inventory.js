/**
 * Teryak Platform - Pharmacist Inventory Management Engine
 * Connected with Backend API (/api/inventory) & Bulk Import/Export
 */

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Sidebar & Overlay Handlers
  const menuBtn = document.getElementById('menuBtn') || document.querySelector('.menu-btn');
  const sidebar = document.querySelector('.sidebar') || document.getElementById('sidebar');
  const overlay = document.getElementById('overlay') || document.querySelector('.overlay');

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      if (overlay) overlay.classList.toggle('show');
    });
  }

  if (overlay && sidebar) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('show');
    });
  }

  // 2. DOM Elements
  const inventoryList = document.getElementById('inventoryList');
  const searchInput = document.getElementById('inventorySearchInput');
  const addMedBtn = document.getElementById('addMedBtn');
  const bulkImportBtn = document.getElementById('bulkImportBtn');
  const exportInventoryBtn = document.getElementById('exportInventoryBtn');
  const addNewCardBtn = document.querySelector('.add-new-card');

  let currentInventory = [];
  let catalogMedicines = [];

  // 3. Fallback Mock Data
  const defaultInventory = [
    {
      _id: 'inv_1',
      nameAr: 'باراسيتامول 500 مجم',
      quantity: 45,
      customPrice: 24.50,
      expiryDate: '2027-03-01',
      image: '../../assets/images/1.jpg'
    },
    {
      _id: 'inv_2',
      nameAr: 'أموكسيسيلين 500 مجم',
      quantity: 3,
      customPrice: 78.00,
      expiryDate: '2026-11-01',
      image: '../../assets/images/2.jpg'
    },
    {
      _id: 'inv_3',
      nameAr: 'فيتامين د 1000',
      quantity: 0,
      customPrice: 85.00,
      expiryDate: '2027-06-01',
      image: '../../assets/images/4.jpg'
    },
    {
      _id: 'inv_4',
      nameAr: 'أوميجا 3 بلس',
      quantity: 20,
      customPrice: 120.00,
      expiryDate: '2026-09-01',
      image: '../../assets/images/3.jpg'
    },
    {
      _id: 'inv_5',
      nameAr: 'كونجستال أقراص',
      quantity: 8,
      customPrice: 35.00,
      expiryDate: '2026-12-01',
      image: '../../assets/images/5.jpg'
    }
  ];

  // 4. Load Master Catalog for Quick Autocomplete
  async function loadCatalog() {
    try {
      if (window.API && window.API.medicines) {
        const res = await window.API.medicines.getAll({ limit: 100 });
        if (res && res.data && Array.isArray(res.data)) {
          catalogMedicines = res.data;
        }
      }
    } catch (e) {
      console.warn('[Catalog Preload Warning]:', e.message);
    }
  }
  loadCatalog();

  // 5. Load Inventory from Server / Cache
  async function loadInventory() {
    let items = [];

    try {
      if (window.API && window.API.inventory) {
        const res = await window.API.inventory.getAll();
        if (res && res.data && Array.isArray(res.data)) {
          items = res.data.map(item => ({
            _id: item._id,
            medicineId: item.medicineId?._id || item.medicineId,
            nameAr: item.medicineId?.nameAr || item.medicineName || 'دواء',
            nameEn: item.medicineId?.nameEn || '',
            quantity: Number(item.quantity) || 0,
            customPrice: Number(item.customPrice || item.medicineId?.price || 25),
            costPrice: item.costPrice ? Number(item.costPrice) : undefined,
            shelfLocation: item.shelfLocation || '',
            batchNumber: item.batchNumber || '',
            activeIngredient: item.medicineId?.activeIngredient || '',
            category: item.medicineId?.category || 'أدوية عامة',
            dosageForm: item.medicineId?.dosageForm || 'أقراص',
            expiryDate: item.expiryDate ? String(item.expiryDate).split('T')[0] : '2027-01-01',
            image: item.medicineId?.image || item.image || '../../assets/images/1.jpg'
          }));
        }
      }
    } catch (e) {
      console.warn('[Inventory API Fallback]:', e.message);
    }

    if (!items || items.length === 0) {
      try {
        const local = JSON.parse(localStorage.getItem('pharmacist_inventory'));
        items = local && local.length > 0 ? local : defaultInventory;
      } catch (e) {
        items = defaultInventory;
      }
    }

    currentInventory = items;
    saveLocalInventory();
    renderInventory(currentInventory);
  }

  function saveLocalInventory() {
    try {
      localStorage.setItem('pharmacist_inventory', JSON.stringify(currentInventory));
    } catch (e) {}
  }

  // 6. Render Inventory Grid
  function renderInventory(items) {
    if (!inventoryList) return;

    if (items.length === 0) {
      inventoryList.innerHTML = `
        <div class="col-12 text-center py-5 text-muted bg-white border rounded">
          <i class="fa-solid fa-box-open fs-1 mb-2 text-success"></i>
          <p class="font-bold mb-1 fs-5">لا توجد أدوية مطابقة في المخزون</p>
          <small class="text-muted d-block mb-3">يمكنك إضافة أدوية جديدة للمخزون أو استيراد ملف إكسل دفعة واحدة</small>
          <button class="btn btn-success btn-sm font-bold" onclick="document.getElementById('addMedBtn').click()">
            <i class="fa-solid fa-plus me-1"></i> إضافة دواء الآن
          </button>
        </div>
      `;
      return;
    }

    let html = '';
    items.forEach(item => {
      const qty = Number(item.quantity) || 0;
      let badgeClass = 'available';
      let badgeText = 'متوفر';

      if (qty === 0) {
        badgeClass = 'unavailable';
        badgeText = 'غير متوفر';
      } else if (qty <= 5) {
        badgeClass = 'limited';
        badgeText = 'محدود';
      }

      const price = (Number(item.customPrice) || 25).toFixed(2);
      const expiry = item.expiryDate || '06-2027';
      const img = item.image || '../../assets/images/1.jpg';
      const shelfTag = item.shelfLocation ? `<span class="badge bg-light text-dark border ms-1"><i class="fa-solid fa-location-dot text-success me-1"></i>${item.shelfLocation}</span>` : '';

      html += `
        <div class="medicine-card" data-id="${item._id}">
          <div class="actions">
            <button type="button" class="action-btn btn-edit-item" title="تعديل المخزون" data-id="${item._id}" aria-label="تعديل">
              <i class="fa-regular fa-pen-to-square"></i>
            </button>
            <button type="button" class="action-btn btn-delete-item" title="حذف من المخزون" data-id="${item._id}" aria-label="حذف">
              <i class="fa-regular fa-trash-can"></i>
            </button>
            <span class="badge ${badgeClass}">${badgeText}</span>
          </div>
          <img src="${img}" alt="${item.nameAr}" class="medicine-image" onerror="this.src='../../assets/images/1.jpg'">
          <div class="details">
            <h3>${item.nameAr}</h3>
            <p>المخزون: <b>${qty} علبة</b> | السعر: <b>${price} ج.م</b> | الصلاحية: ${expiry} ${shelfTag}</p>
          </div>
        </div>
      `;
    });

    inventoryList.innerHTML = html;
  }

  // 7. Global Action Listeners (Edit & Delete via Delegation)
  document.addEventListener('click', async (e) => {
    // Edit action
    const editBtn = e.target.closest('.btn-edit-item');
    if (editBtn) {
      e.preventDefault();
      e.stopPropagation();
      const itemId = editBtn.dataset.id || editBtn.closest('.medicine-card')?.dataset.id;
      const item = currentInventory.find(i => String(i._id) === String(itemId));
      if (item) {
        openEditModal(item);
      }
      return;
    }

    // Delete action
    const deleteBtn = e.target.closest('.btn-delete-item');
    if (deleteBtn) {
      e.preventDefault();
      e.stopPropagation();
      const itemId = deleteBtn.dataset.id || deleteBtn.closest('.medicine-card')?.dataset.id;
      const item = currentInventory.find(i => String(i._id) === String(itemId));
      const name = item ? item.nameAr : 'الدواء';

      let confirmed = true;
      if (window.Toast && typeof window.Toast.confirm === 'function') {
        confirmed = await window.Toast.confirm({
          title: 'حذف من المخزون',
          message: `هل أنت متأكد من رغبتك في إزالة (${name}) من مخزون صيدليتك؟`,
          type: 'danger',
          confirmText: 'حذف الدواء',
          cancelText: 'إلغاء'
        });
      } else {
        confirmed = window.confirm(`هل أنت متأكد من رغبتك في حذف (${name}) من المخزون؟`);
      }

      if (confirmed) {
        try {
          if (window.API && window.API.inventory && itemId && itemId.length === 24) {
            await window.API.inventory.delete(itemId);
          }
        } catch (err) {
          console.warn('API delete fallback:', err.message);
        }

        currentInventory = currentInventory.filter(i => String(i._id) !== String(itemId));
        saveLocalInventory();
        renderInventory(currentInventory);

        if (window.Toast) {
          window.Toast.success(`تم حذف (${name}) من المخزون بنجاح.`, 'تم الحذف');
        }
      }
      return;
    }
  });

  // 8. Search Filtering
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      if (!query) {
        renderInventory(currentInventory);
        return;
      }
      const filtered = currentInventory.filter(item => {
        return (
          (item.nameAr && item.nameAr.toLowerCase().includes(query)) ||
          (item.nameEn && item.nameEn.toLowerCase().includes(query)) ||
          (item.activeIngredient && item.activeIngredient.toLowerCase().includes(query)) ||
          (item.shelfLocation && item.shelfLocation.toLowerCase().includes(query))
        );
      });
      renderInventory(filtered);
    });
  }

  // 9. Expert Add & Edit Modal System with Image Uploader, Presets, Profit Calculator & Catalog Lookup
  function ensureInventoryModal() {
    let modalEl = document.getElementById('inventoryActionModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'inventoryActionModal';
      modalEl.className = 'modal fade';
      modalEl.setAttribute('tabindex', '-1');
      modalEl.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content inventory-modal-box">
            <div class="modal-header">
              <div class="d-flex align-items-center gap-2">
                <div class="modal-header-icon"><i class="fa-solid fa-boxes-stacked"></i></div>
                <div>
                  <h5 class="modal-title font-bold m-0" id="invModalTitle">إضافة دواء جديد للمخزون</h5>
                  <span class="modal-subtitle">إدارة المخزون الذكي، التسعير، الصلاحية، والصورة</span>
                </div>
              </div>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <form id="invModalForm">
                <input type="hidden" id="modalItemId" value="">
                <input type="hidden" id="modalMedicineId" value="">
                <input type="hidden" id="modalMedImage" value="../../assets/images/1.jpg">
                
                <!-- Section 1: Medicine Image + Name/Autocomplete -->
                <div class="row g-3 mb-3 align-items-start">
                  <!-- Image Upload / Preview Column -->
                  <div class="col-md-4 col-12 text-center">
                    <label class="form-label font-bold text-dark d-block text-start mb-2">
                      <i class="fa-solid fa-image text-success me-1"></i> صورة الدواء
                    </label>
                    <div class="medicine-image-upload-card">
                      <div class="image-preview-wrapper" id="imagePreviewContainer">
                        <img id="modalMedImagePreview" src="../../assets/images/1.jpg" alt="معاينة صورة الدواء" onerror="this.src='../../assets/images/1.jpg'">
                        <div class="image-overlay-actions">
                          <label for="modalMedImageFile" class="btn-upload-overlay" title="رفع صورة من جهازك">
                            <i class="fa-solid fa-camera"></i>
                          </label>
                          <button type="button" class="btn-clear-image" id="btnClearImage" title="استعادة الصورة الافتراضية">
                            <i class="fa-solid fa-rotate-left"></i>
                          </button>
                        </div>
                      </div>
                      <input type="file" id="modalMedImageFile" class="d-none" accept="image/*">
                      <small class="text-muted d-block mt-2" style="font-size: 11px;">اضغط على الكاميرا للرفع، أو اختر قالباً سريعاً:</small>

                      <!-- Quick Presets -->
                      <div class="image-presets-row mt-2" id="imagePresetsRow">
                        <button type="button" class="preset-btn active" data-img="../../assets/images/1.jpg" title="أقراص">💊 أقراص</button>
                        <button type="button" class="preset-btn" data-img="../../assets/images/2.jpg" title="شراب">🧴 شراب</button>
                        <button type="button" class="preset-btn" data-img="../../assets/images/3.jpg" title="كبسول">💊 كبسول</button>
                        <button type="button" class="preset-btn" data-img="../../assets/images/4.jpg" title="حقن">💉 حقن</button>
                        <button type="button" class="preset-btn" data-img="../../assets/images/5.jpg" title="مرهم">🧴 مرهم</button>
                      </div>
                    </div>
                  </div>

                  <!-- Name & Catalog Autocomplete Column -->
                  <div class="col-md-8 col-12">
                    <div class="mb-3 position-relative">
                      <label class="form-label font-bold text-dark">
                        اسم الدواء أو المادة الفعالة <span class="text-danger">*</span>
                      </label>
                      <div class="input-group">
                        <span class="input-group-text bg-light"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
                        <input type="text" id="modalMedName" class="form-control" placeholder="ابحث في دليل الأدوية الموحد (مثل: بانادول، أوجمنتين...)" autocomplete="off" required>
                      </div>
                      <div id="catalogAutocompleteList" class="list-group position-absolute w-100 shadow-lg d-none" style="z-index: 1060; max-height: 220px; overflow-y: auto; top: 100%;"></div>
                      <small class="text-muted d-block mt-1" style="font-size: 12px;">
                        💡 <span class="text-success font-bold">ميزة ذكية:</span> الاختيار من الدليل الموحد يملأ الصورة، السعر، والمادة الفعالة تلقائياً.
                      </small>
                    </div>

                    <div class="row g-2">
                      <div class="col-6">
                        <label class="form-label font-bold text-dark" style="font-size: 13px;">المادة الفعالة</label>
                        <input type="text" id="modalActiveIngredient" class="form-control form-control-sm" placeholder="مثال: Paracetamol">
                      </div>
                      <div class="col-6">
                        <label class="form-label font-bold text-dark" style="font-size: 13px;">الشكل الدوائي</label>
                        <select id="modalDosageForm" class="form-select form-select-sm">
                          <option value="أقراص">أقراص (Tablets)</option>
                          <option value="كبسولات">كبسولات (Capsules)</option>
                          <option value="شراب">شراب (Syrup)</option>
                          <option value="حقن">حقن / أمبول (Injection)</option>
                          <option value="نقط / قطرة">نقط / قطرة (Drops)</option>
                          <option value="مرهم / كريم">مرهم / كريم (Ointment)</option>
                          <option value="فوار">فوار (Effervescent)</option>
                          <option value="بخاخ">بخاخ (Spray)</option>
                        </select>
                      </div>
                      <div class="col-12 mt-2">
                        <label class="form-label font-bold text-dark" style="font-size: 13px;">التصنيف الدوائي</label>
                        <select id="modalCategory" class="form-select form-select-sm">
                          <option value="مسكنات وخافض حرارة">مسكنات وخافض حرارة</option>
                          <option value="مضادات حيوية">مضادات حيوية</option>
                          <option value="أدوية البرد والإنفلونزا">أدوية البرد والإنفلونزا</option>
                          <option value="فيتامينات ومكملات">فيتامينات ومكملات غذائية</option>
                          <option value="أدوية الضغط والقلب">أدوية الضغط والقلب</option>
                          <option value="أدوية السكري">أدوية السكري</option>
                          <option value="جهاز هضمي ومعدة">جهاز هضمي ومعدة</option>
                          <option value="حساسية وجهاز تنفسي">حساسية وجهاز تنفسي</option>
                          <option value="جلدية وتجميل">جلدية وعناية</option>
                          <option value="أدوية عامة">أدوية عامة أخرى</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <hr class="my-3 opacity-25">

                <!-- Section 2: Pricing & Stock Inventory -->
                <h6 class="font-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i class="fa-solid fa-coins text-warning"></i> التسعير، الأرباح، والكميات المتوفرة
                </h6>
                <div class="row g-3 mb-3">
                  <div class="col-md-3 col-6">
                    <label class="form-label font-bold text-dark">الكمية المتوفرة (علبة) <span class="text-danger">*</span></label>
                    <input type="number" id="modalMedQty" class="form-control" min="0" value="10" required>
                  </div>
                  <div class="col-md-3 col-6">
                    <label class="form-label font-bold text-dark">سعر البيع (ج.م) <span class="text-danger">*</span></label>
                    <input type="number" id="modalMedPrice" class="form-control" min="0.5" step="0.5" value="35.00" required>
                  </div>
                  <div class="col-md-3 col-6">
                    <label class="form-label font-bold text-dark">سعر التكلفة (ج.م)</label>
                    <input type="number" id="modalMedCost" class="form-control" min="0" step="0.5" placeholder="مثال: 25.00">
                  </div>
                  <div class="col-md-3 col-6">
                    <label class="form-label font-bold text-dark">حد النواقص (علبة)</label>
                    <input type="number" id="modalMedThreshold" class="form-control" min="1" value="5">
                  </div>
                </div>

                <!-- Profit Margin Widget -->
                <div id="profitMarginWidget" class="profit-margin-bar d-flex justify-content-between align-items-center py-2 px-3 rounded mb-3 d-none" style="background: #ecfdf5; border: 1px solid #a7f3d0;">
                  <span class="text-success font-bold" style="font-size: 13px;" id="profitMarginText">
                    <i class="fa-solid fa-chart-line me-1"></i> هامش الربح المتوقع: <strong>--</strong>
                  </span>
                  <span class="badge bg-success" id="profitPerUnitBadge">-- ج.م / علبة</span>
                </div>

                <hr class="my-3 opacity-25">

                <!-- Section 3: Storage, Expiry & Batch Details -->
                <h6 class="font-bold text-dark mb-3 d-flex align-items-center gap-2">
                  <i class="fa-solid fa-calendar-check text-primary"></i> الصلاحية وموقع التخزين ورقم التشغيلة
                </h6>
                <div class="row g-3 mb-3">
                  <div class="col-md-4 col-12">
                    <label class="form-label font-bold text-dark">تاريخ انتهاء الصلاحية <span class="text-danger">*</span></label>
                    <input type="date" id="modalMedExpiry" class="form-control" value="2027-06-01" required>
                  </div>
                  <div class="col-md-4 col-6">
                    <label class="form-label font-bold text-dark">رقم التشغيلة (Batch No.)</label>
                    <div class="input-group">
                      <input type="text" id="modalMedBatch" class="form-control" placeholder="BATCH-1234">
                      <button type="button" class="btn btn-outline-secondary" id="btnGenBatch" title="توليد رقم تشغيلة تلقائي">
                        <i class="fa-solid fa-arrows-rotate"></i>
                      </button>
                    </div>
                  </div>
                  <div class="col-md-4 col-6">
                    <label class="form-label font-bold text-dark">موقع الرف / المخزن</label>
                    <input type="text" id="modalMedShelf" class="form-control" placeholder="مثال: رف A3، ثلاجة 1">
                  </div>
                </div>

                <!-- Modal Footer Actions -->
                <div class="d-flex justify-content-between align-items-center pt-3 border-top mt-4 flex-wrap gap-2">
                  <div class="form-check form-switch m-0">
                    <input class="form-check-input" type="checkbox" id="modalMedAvailable" checked>
                    <label class="form-check-label font-bold text-muted" for="modalMedAvailable" style="font-size: 13px;">متاح للطلب والحجز المباشر</label>
                  </div>
                  <div class="d-flex gap-2">
                    <button type="button" class="btn btn-light px-3" data-bs-dismiss="modal">إلغاء</button>
                    <button type="submit" class="btn btn-success px-4 font-bold" id="modalSubmitBtn">
                      <i class="fa-solid fa-check me-1"></i> حفظ الدواء بالمخزون
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);

      // Elements
      const nameInput = modalEl.querySelector('#modalMedName');
      const autoList = modalEl.querySelector('#catalogAutocompleteList');
      const medIdInput = modalEl.querySelector('#modalMedicineId');
      const priceInput = modalEl.querySelector('#modalMedPrice');
      const costInput = modalEl.querySelector('#modalMedCost');
      const activeInput = modalEl.querySelector('#modalActiveIngredient');
      const dosageSelect = modalEl.querySelector('#modalDosageForm');
      const categorySelect = modalEl.querySelector('#modalCategory');
      const imgHidden = modalEl.querySelector('#modalMedImage');
      const imgPreview = modalEl.querySelector('#modalMedImagePreview');
      const fileInput = modalEl.querySelector('#modalMedImageFile');
      const clearImgBtn = modalEl.querySelector('#btnClearImage');
      const presetsRow = modalEl.querySelector('#imagePresetsRow');
      const genBatchBtn = modalEl.querySelector('#btnGenBatch');
      const batchInput = modalEl.querySelector('#modalMedBatch');

      // Profit Calculator Handler
      function updateProfitWidget() {
        const selling = Number(priceInput?.value) || 0;
        const cost = Number(costInput?.value) || 0;
        const profitText = modalEl.querySelector('#profitMarginText');
        const profitBadge = modalEl.querySelector('#profitPerUnitBadge');
        const widget = modalEl.querySelector('#profitMarginWidget');

        if (cost > 0 && selling > 0 && widget) {
          const profit = selling - cost;
          const margin = ((profit / selling) * 100).toFixed(1);
          if (profit >= 0) {
            widget.style.background = '#ecfdf5';
            widget.style.borderColor = '#a7f3d0';
            profitText.className = 'text-success font-bold';
            profitText.innerHTML = `<i class="fa-solid fa-arrow-trend-up me-1"></i> هامش الربح المتوقع: <strong>${margin}%</strong>`;
            profitBadge.className = 'badge bg-success';
            profitBadge.textContent = `+${profit.toFixed(2)} ج.م / علبة`;
          } else {
            widget.style.background = '#fef2f2';
            widget.style.borderColor = '#fecaca';
            profitText.className = 'text-danger font-bold';
            profitText.innerHTML = `<i class="fa-solid fa-arrow-trend-down me-1"></i> تحذير: سعر البيع أقل من التكلفة بنسبة <strong>${Math.abs(margin)}%</strong>`;
            profitBadge.className = 'badge bg-danger';
            profitBadge.textContent = `${profit.toFixed(2)} ج.م خسارة`;
          }
          widget.classList.remove('d-none');
        } else if (widget) {
          widget.classList.add('d-none');
        }
      }

      priceInput?.addEventListener('input', updateProfitWidget);
      costInput?.addEventListener('input', updateProfitWidget);

      // Image Upload from File
      fileInput?.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            const dataUrl = evt.target.result;
            imgPreview.src = dataUrl;
            imgHidden.value = dataUrl;
            presetsRow?.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
          };
          reader.readAsDataURL(file);
        }
      });

      // Clear Image to Default
      clearImgBtn?.addEventListener('click', () => {
        imgPreview.src = '../../assets/images/1.jpg';
        imgHidden.value = '../../assets/images/1.jpg';
        presetsRow?.querySelectorAll('.preset-btn').forEach((b, idx) => {
          if (idx === 0) b.classList.add('active');
          else b.classList.remove('active');
        });
      });

      // Image Quick Presets
      presetsRow?.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const imgPath = btn.dataset.img;
          imgPreview.src = imgPath;
          imgHidden.value = imgPath;
          presetsRow.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
      });

      // Generate Random Batch Number
      genBatchBtn?.addEventListener('click', () => {
        if (batchInput) {
          batchInput.value = `BCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        }
      });

      // Autocomplete Catalog Search
      if (nameInput && autoList) {
        nameInput.addEventListener('input', (e) => {
          const q = e.target.value.toLowerCase().trim();
          if (!q || q.length < 2) {
            autoList.classList.add('d-none');
            return;
          }

          const matches = catalogMedicines.filter(m => 
            (m.nameAr && m.nameAr.toLowerCase().includes(q)) ||
            (m.nameEn && m.nameEn.toLowerCase().includes(q)) ||
            (m.activeIngredient && m.activeIngredient.toLowerCase().includes(q))
          ).slice(0, 6);

          if (matches.length === 0) {
            autoList.classList.add('d-none');
            return;
          }

          autoList.innerHTML = matches.map(m => `
            <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2 px-3" 
              data-id="${m._id}" 
              data-name="${m.nameAr}" 
              data-price="${m.price || 25}"
              data-active="${m.activeIngredient || ''}"
              data-dosage="${m.dosageForm || 'أقراص'}"
              data-category="${m.category || 'أدوية عامة'}"
              data-img="${m.image || '../../assets/images/1.jpg'}">
              <div class="d-flex align-items-center gap-2">
                <img src="${m.image || '../../assets/images/1.jpg'}" style="width: 36px; height: 36px; object-fit: cover; border-radius: 8px;" onerror="this.src='../../assets/images/1.jpg'">
                <div>
                  <strong class="d-block text-dark">${m.nameAr}</strong>
                  <small class="text-muted">${m.nameEn || ''} • ${m.activeIngredient || m.category || 'أدوية'}</small>
                </div>
              </div>
              <span class="badge bg-success">${m.price || 25} ج.م</span>
            </button>
          `).join('');

          autoList.classList.remove('d-none');

          autoList.querySelectorAll('button').forEach(itemBtn => {
            itemBtn.addEventListener('click', () => {
              nameInput.value = itemBtn.dataset.name;
              medIdInput.value = itemBtn.dataset.id;
              if (priceInput) priceInput.value = itemBtn.dataset.price;
              if (activeInput && itemBtn.dataset.active) activeInput.value = itemBtn.dataset.active;
              if (dosageSelect && itemBtn.dataset.dosage) dosageSelect.value = itemBtn.dataset.dosage;
              if (categorySelect && itemBtn.dataset.category) categorySelect.value = itemBtn.dataset.category;

              if (itemBtn.dataset.img) {
                imgHidden.value = itemBtn.dataset.img;
                imgPreview.src = itemBtn.dataset.img;
              }

              updateProfitWidget();
              autoList.classList.add('d-none');
            });
          });
        });

        document.addEventListener('click', (e) => {
          if (!nameInput.contains(e.target) && !autoList.contains(e.target)) {
            autoList.classList.add('d-none');
          }
        });
      }

      // Form Submit Handler
      const form = modalEl.querySelector('#invModalForm');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const itemId = document.getElementById('modalItemId').value;
        const medicineId = document.getElementById('modalMedicineId').value;
        const name = document.getElementById('modalMedName').value.trim();
        const qty = Number(document.getElementById('modalMedQty').value) || 0;
        const price = Number(document.getElementById('modalMedPrice').value) || 25;
        const cost = Number(document.getElementById('modalMedCost').value) || undefined;
        const expiry = document.getElementById('modalMedExpiry').value || '2027-06-01';
        const threshold = Number(document.getElementById('modalMedThreshold')?.value) || 5;
        const batch = document.getElementById('modalMedBatch')?.value || '';
        const shelf = document.getElementById('modalMedShelf')?.value || '';
        const image = document.getElementById('modalMedImage')?.value || '../../assets/images/1.jpg';
        const active = document.getElementById('modalActiveIngredient')?.value || '';
        const dosage = document.getElementById('modalDosageForm')?.value || 'أقراص';
        const category = document.getElementById('modalCategory')?.value || 'أدوية عامة';
        const isAvailable = document.getElementById('modalMedAvailable')?.checked ?? true;

        const modalInstance = bootstrap.Modal.getInstance(modalEl);

        if (itemId) {
          // Update existing
          try {
            if (window.API && window.API.inventory && itemId.length === 24) {
              await window.API.inventory.update(itemId, {
                quantity: qty,
                customPrice: price,
                costPrice: cost,
                shelfLocation: shelf,
                batchNumber: batch,
                expiryDate: expiry,
                lowStockThreshold: threshold,
                image: image,
                isAvailable: isAvailable
              });
            }
          } catch (err) {
            console.warn('API update fallback:', err.message);
          }

          const target = currentInventory.find(i => i._id === itemId);
          if (target) {
            target.nameAr = name;
            target.quantity = qty;
            target.customPrice = price;
            target.costPrice = cost;
            target.shelfLocation = shelf;
            target.batchNumber = batch;
            target.expiryDate = expiry;
            target.image = image;
            target.dosageForm = dosage;
            target.category = category;
            target.activeIngredient = active;
          }
          if (window.Toast) window.Toast.success(`تم تحديث بيانات ومخزون (${name}) بنجاح`, 'تحديث المخزون');
        } else {
          // Add new
          let createdId = `inv_${Date.now()}`;
          try {
            if (window.API && window.API.inventory) {
              const res = await window.API.inventory.add({
                medicineId: medicineId || undefined,
                medicineName: name,
                quantity: qty,
                customPrice: price,
                costPrice: cost,
                shelfLocation: shelf,
                batchNumber: batch,
                expiryDate: expiry,
                lowStockThreshold: threshold,
                image: image,
                activeIngredient: active,
                dosageForm: dosage,
                category: category,
              });
              if (res && res.data && res.data._id) {
                createdId = res.data._id;
              }
            }
          } catch (err) {
            console.warn('API add fallback:', err.message);
          }

          currentInventory.unshift({
            _id: createdId,
            medicineId: medicineId || undefined,
            nameAr: name,
            quantity: qty,
            customPrice: price,
            costPrice: cost,
            shelfLocation: shelf,
            batchNumber: batch,
            expiryDate: expiry,
            image: image,
            dosageForm: dosage,
            category: category,
            activeIngredient: active
          });
          if (window.Toast) window.Toast.success(`تمت إضافة (${name}) بصورته وبياناته إلى المخزون`, 'إضافة دواء');
        }

        saveLocalInventory();
        renderInventory(currentInventory);
        if (modalInstance) modalInstance.hide();
      });
    }
    return modalEl;
  }

  function openAddModal() {
    const modalEl = ensureInventoryModal();
    document.getElementById('invModalTitle').textContent = 'إضافة دواء جديد للمخزون';
    document.getElementById('modalItemId').value = '';
    document.getElementById('modalMedicineId').value = '';
    document.getElementById('modalMedName').value = '';
    document.getElementById('modalActiveIngredient').value = '';
    document.getElementById('modalDosageForm').value = 'أقراص';
    document.getElementById('modalCategory').value = 'مسكنات وخافض حرارة';
    document.getElementById('modalMedQty').value = '10';
    document.getElementById('modalMedPrice').value = '35.00';
    document.getElementById('modalMedCost').value = '25.00';
    document.getElementById('modalMedThreshold').value = '5';
    document.getElementById('modalMedExpiry').value = '2027-06-01';
    document.getElementById('modalMedBatch').value = `BCH-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    document.getElementById('modalMedShelf').value = 'رف A1';
    document.getElementById('modalMedImage').value = '../../assets/images/1.jpg';
    document.getElementById('modalMedImagePreview').src = '../../assets/images/1.jpg';
    document.getElementById('modalSubmitBtn').innerHTML = '<i class="fa-solid fa-plus me-1"></i> إضافة للمخزون';

    // Trigger profit calculation
    const priceInput = modalEl.querySelector('#modalMedPrice');
    priceInput?.dispatchEvent(new Event('input'));

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }

  function openEditModal(item) {
    const modalEl = ensureInventoryModal();
    document.getElementById('invModalTitle').textContent = `تعديل مخزون: ${item.nameAr}`;
    document.getElementById('modalItemId').value = item._id;
    document.getElementById('modalMedicineId').value = item.medicineId || '';
    document.getElementById('modalMedName').value = item.nameAr;
    document.getElementById('modalActiveIngredient').value = item.activeIngredient || '';
    document.getElementById('modalDosageForm').value = item.dosageForm || 'أقراص';
    document.getElementById('modalCategory').value = item.category || 'أدوية عامة';
    document.getElementById('modalMedQty').value = item.quantity;
    document.getElementById('modalMedPrice').value = item.customPrice;
    document.getElementById('modalMedCost').value = item.costPrice || '';
    document.getElementById('modalMedThreshold').value = item.lowStockThreshold || '5';
    document.getElementById('modalMedExpiry').value = item.expiryDate ? item.expiryDate.split('T')[0] : '2027-06-01';
    document.getElementById('modalMedBatch').value = item.batchNumber || `BCH-${new Date().getFullYear()}-1024`;
    document.getElementById('modalMedShelf').value = item.shelfLocation || '';
    
    const imgSrc = item.image || '../../assets/images/1.jpg';
    document.getElementById('modalMedImage').value = imgSrc;
    document.getElementById('modalMedImagePreview').src = imgSrc;
    document.getElementById('modalSubmitBtn').innerHTML = '<i class="fa-solid fa-save me-1"></i> حفظ التعديلات';

    // Trigger profit calculation
    const priceInput = modalEl.querySelector('#modalMedPrice');
    priceInput?.dispatchEvent(new Event('input'));

    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }

  if (addMedBtn) addMedBtn.addEventListener('click', openAddModal);
  if (addNewCardBtn) addNewCardBtn.addEventListener('click', openAddModal);

  // 10. Bulk Import System (CSV & Excel)
  function ensureBulkImportModal() {
    let modalEl = document.getElementById('bulkImportModal');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'bulkImportModal';
      modalEl.className = 'modal fade';
      modalEl.setAttribute('tabindex', '-1');
      modalEl.innerHTML = `
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content" style="border-radius: 14px; overflow: hidden; border: none; box-shadow: 0 20px 40px rgba(0,0,0,0.15);">
            <div class="modal-header bg-primary text-white py-3 px-4">
              <h5 class="modal-title font-bold"><i class="fa-solid fa-file-import me-2"></i> استيراد أدوية مجمعة (Bulk Excel / CSV Import)</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4">
              <div class="alert alert-info py-2 px-3 mb-3 d-flex align-items-center justify-content-between">
                <div>
                  <i class="fa-solid fa-circle-info me-2"></i> يمكنك استيراد آلاف الأدوية بضغطة واحدة من ملف CSV أو نسخ ولصق الجدول مباشرة.
                </div>
                <button type="button" class="btn btn-outline-primary btn-sm font-bold" id="downloadCsvTemplateBtn">
                  <i class="fa-solid fa-download me-1"></i> تحميل قالب فارغ
                </button>
              </div>

              <div class="mb-3">
                <label class="form-label font-bold">1. رفع ملف CSV أو Excel:</label>
                <input type="file" id="csvFileInput" class="form-control" accept=".csv, .txt">
              </div>

              <div class="mb-3">
                <label class="form-label font-bold">2. أو الصق البيانات بتنسيق CSV (اسم الدواء,الكمية,السعر,تاريخ الصلاحية):</label>
                <textarea id="csvTextInput" class="form-control" rows="5" placeholder="اسم الدواء,الكمية,السعر,تاريخ الصلاحية
بانادول إكسترا,50,45.00,2027-12-31
أوجمنتين 1 جم,30,110.00,2026-10-15
أوميجا 3 بلس,25,120.00,2027-08-01"></textarea>
              </div>

              <div id="bulkPreviewArea" class="d-none mb-3">
                <h6 class="font-bold text-dark">معاينة البيانات المستخرجة (<span id="parsedCount">0</span> دواء):</h6>
                <div class="table-responsive border rounded" style="max-height: 180px; overflow-y: auto;">
                  <table class="table table-sm table-striped mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>اسم الدواء</th>
                        <th>الكمية</th>
                        <th>السعر</th>
                        <th>الصلاحية</th>
                      </tr>
                    </thead>
                    <tbody id="bulkPreviewTableBody"></tbody>
                  </table>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mt-4">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">إلغاء</button>
                <button type="button" class="btn btn-primary px-4 font-bold" id="executeBulkImportBtn">
                  <i class="fa-solid fa-cloud-arrow-up me-1"></i> بدء الاستيراد والحفظ
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modalEl);

      // Download CSV Template
      const dlBtn = modalEl.querySelector('#downloadCsvTemplateBtn');
      dlBtn.addEventListener('click', () => {
        const templateContent = 'اسم الدواء,الكمية,السعر,تاريخ الصلاحية\nبانادول إكسترا أقراص,50,45.00,2027-12-31\nأوجمنتين 1 جم أقراص,30,110.00,2026-10-15\nكونجستال أقراص,40,35.00,2027-06-30';
        const blob = new Blob(['\uFEFF' + templateContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'قالب_استيراد_أدوية_ترياق.csv';
        link.click();
      });

      // Parse File Upload
      const fileInput = modalEl.querySelector('#csvFileInput');
      const textInput = modalEl.querySelector('#csvTextInput');
      const previewArea = modalEl.querySelector('#bulkPreviewArea');
      const previewBody = modalEl.querySelector('#bulkPreviewTableBody');
      const countEl = modalEl.querySelector('#parsedCount');
      const execBtn = modalEl.querySelector('#executeBulkImportBtn');

      let parsedItems = [];

      function parseCsvString(csvText) {
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
        const items = [];

        // Skip header if contains 'اسم' or 'name'
        const startIndex = (lines[0] && (lines[0].includes('اسم') || lines[0].toLowerCase().includes('name'))) ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
          const parts = lines[i].split(',').map(p => p.trim());
          if (parts.length >= 1 && parts[0]) {
            items.push({
              medicineName: parts[0],
              quantity: Number(parts[1]) || 10,
              customPrice: Number(parts[2]) || 35.00,
              expiryDate: parts[3] || '2027-12-31'
            });
          }
        }
        return items;
      }

      function updatePreview(items) {
        parsedItems = items;
        if (items.length === 0) {
          previewArea.classList.add('d-none');
          return;
        }

        countEl.textContent = items.length;
        previewBody.innerHTML = items.slice(0, 10).map(item => `
          <tr>
            <td class="font-bold">${item.medicineName}</td>
            <td>${item.quantity}</td>
            <td>${item.customPrice} ج.م</td>
            <td>${item.expiryDate}</td>
          </tr>
        `).join('');

        if (items.length > 10) {
          previewBody.innerHTML += `<tr><td colspan="4" class="text-center text-muted font-bold">+ ${items.length - 10} أدوية أخرى...</td></tr>`;
        }
        previewArea.classList.remove('d-none');
      }

      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            textInput.value = event.target.result;
            const items = parseCsvString(event.target.result);
            updatePreview(items);
          };
          reader.readAsText(file, 'UTF-8');
        }
      });

      textInput.addEventListener('input', () => {
        const items = parseCsvString(textInput.value);
        updatePreview(items);
      });

      // Execute Bulk Import
      execBtn.addEventListener('click', async () => {
        const itemsToImport = parsedItems.length > 0 ? parsedItems : parseCsvString(textInput.value);
        if (itemsToImport.length === 0) {
          if (window.Toast) window.Toast.warning('يرجى اختيار ملف أو إدخال أدوية صالحة للاستيراد', 'لا توجد بيانات');
          return;
        }

        execBtn.disabled = true;
        execBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i> جاري استيراد الأدوية...';

        try {
          if (window.API && window.API.inventory) {
            await window.API.inventory.bulkImport(itemsToImport);
          }
        } catch (err) {
          console.warn('Bulk import API fallback:', err.message);
        }

        // Local merge
        itemsToImport.forEach(item => {
          const existing = currentInventory.find(i => i.nameAr === item.medicineName);
          if (existing) {
            existing.quantity += item.quantity;
            existing.customPrice = item.customPrice;
          } else {
            currentInventory.unshift({
              _id: `inv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
              nameAr: item.medicineName,
              quantity: item.quantity,
              customPrice: item.customPrice,
              expiryDate: item.expiryDate,
              image: '../../assets/images/1.jpg'
            });
          }
        });

        saveLocalInventory();
        renderInventory(currentInventory);

        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) modalInstance.hide();

        if (window.Toast) {
          window.Toast.success(`تم استيراد ${itemsToImport.length} دواء إلى مخزون الصيدلية بنجاح!`, 'تم الاستيراد بنجاح');
        }

        execBtn.disabled = false;
        execBtn.innerHTML = '<i class="fa-solid fa-cloud-arrow-up me-1"></i> بدء الاستيراد والحفظ';
      });
    }
    return modalEl;
  }

  if (bulkImportBtn) {
    bulkImportBtn.addEventListener('click', () => {
      const modalEl = ensureBulkImportModal();
      const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
      modal.show();
    });
  }

  // 11. Export Inventory to CSV
  if (exportInventoryBtn) {
    exportInventoryBtn.addEventListener('click', () => {
      if (!currentInventory || currentInventory.length === 0) {
        if (window.Toast) window.Toast.warning('المخزون فارغ حالياً لتصديره', 'تنبيه');
        return;
      }

      let csv = 'اسم الدواء,الكمية,السعر,تاريخ الصلاحية\n';
      currentInventory.forEach(item => {
        csv += `"${item.nameAr}",${item.quantity},${item.customPrice || 25},"${item.expiryDate || '2027-01-01'}"\n`;
      });

      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `مخزون_صيدلية_ترياق_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      if (window.Toast) window.Toast.success('تم تصدير ملف المخزون بصيغة CSV بنجاح', 'تصدير المخزون');
    });
  }

  // Initial load
  loadInventory();
});