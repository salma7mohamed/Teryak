/**
 * Teryak Platform - Dynamic Medicines Catalog Engine
 * Fetches Live Data from Backend API (MongoDB Atlas) & Supports Multi-Criteria Filtering
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  const sortSelect = document.getElementById('sortSelect');
  const filterBtn = document.getElementById('filterBtn');
  const filterDrawer = document.getElementById('filter');
  const arrowIcon = document.getElementById('arrow');
  const activeFilterBadge = document.getElementById('activeFilterBadge');
  const quickCategoryButtons = document.querySelectorAll('.cat-pill');
  const statusButtons = document.querySelectorAll('#statusFilterGroup .filter-pill');
  const priceButtons = document.querySelectorAll('#priceFilterGroup .filter-pill');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  const emptyResetBtn = document.getElementById('emptyResetBtn');
  const resultsCountEl = document.getElementById('resultsCount');
  const totalCountEl = document.getElementById('totalCount');
  const activeChipsContainer = document.getElementById('activeChipsContainer');
  const noResultsState = document.getElementById('noResultsState');
  const grid = document.getElementById('medicinesGrid');

  // Fallback Catalog Preset
  const DEFAULT_CATALOG = [
    {
      id: 'panadol',
      nameAr: 'بانادول إكسترا',
      nameEn: 'Panadol Extra',
      category: 'مسكنات',
      activeIngredient: 'باراسيتامول + كافيين',
      price: 35.0,
      rating: 4.9,
      status: 'available',
      pharmaciesCount: 48,
      image: '../../assets/images/1.jpg',
      slug: 'paracetamol',
    },
    {
      id: 'paramol',
      nameAr: 'بارامول 500 مجم',
      nameEn: 'Paramol 500mg',
      category: 'مسكنات',
      activeIngredient: 'باراسيتامول',
      price: 18.0,
      rating: 4.7,
      status: 'available',
      pharmaciesCount: 32,
      image: '../../assets/images/1.jpg',
      slug: 'paracetamol',
    },
    {
      id: 'cataflam',
      nameAr: 'كاتافلام 50 مجم',
      nameEn: 'Cataflam 50mg',
      category: 'مسكنات',
      activeIngredient: 'ديكلوفيناك بوتاسيوم',
      price: 45.0,
      rating: 4.8,
      status: 'available',
      pharmaciesCount: 26,
      image: '../../assets/images/6.jpg',
      slug: 'cataflam',
    },
    {
      id: 'augmentin',
      nameAr: 'أوجمنتين 1 جم أقراص',
      nameEn: 'Augmentin 1g',
      category: 'مضادات حيوية',
      activeIngredient: 'أموكسيسيلين + كلافولانات',
      price: 130.0,
      rating: 4.9,
      status: 'available',
      pharmaciesCount: 30,
      image: '../../assets/images/8.jpg',
      slug: 'amoxicillin',
    },
    {
      id: 'amoxil',
      nameAr: 'أموكسيل 500 مجم',
      nameEn: 'Amoxil 500mg',
      category: 'مضادات حيوية',
      activeIngredient: 'أموكسيسيلين',
      price: 45.0,
      rating: 4.5,
      status: 'limited',
      pharmaciesCount: 12,
      image: '../../assets/images/2.jpg',
      slug: 'amoxicillin',
    },
    {
      id: 'curam',
      nameAr: 'كيورام 1 جم',
      nameEn: 'Curam 1g',
      category: 'مضادات حيوية',
      activeIngredient: 'أموكسيسيلين + كلافولانات',
      price: 105.0,
      rating: 4.6,
      status: 'available',
      pharmaciesCount: 18,
      image: '../../assets/images/8.jpg',
      slug: 'amoxicillin',
    },
    {
      id: 'aspirin',
      nameAr: 'أسبيرين بروتكت 100 مجم',
      nameEn: 'Aspirin Protect 100mg',
      category: 'مسكنات',
      activeIngredient: 'حمض أسيتيل ساليسيليك',
      price: 28.0,
      rating: 4.8,
      status: 'available',
      pharmaciesCount: 42,
      image: '../../assets/images/6.jpg',
      slug: 'aspirin',
    },
    {
      id: 'ecosprin',
      nameAr: 'إيكوسبرين 75 مجم',
      nameEn: 'Ecosprin 75mg',
      category: 'مسكنات',
      activeIngredient: 'حمض أسيتيل ساليسيليك',
      price: 22.0,
      rating: 4.7,
      status: 'available',
      pharmaciesCount: 25,
      image: '../../assets/images/6.jpg',
      slug: 'aspirin',
    },
    {
      id: 'aspocid',
      nameAr: 'أسبوسيد أطفال 75 مجم',
      nameEn: 'Aspocid 75mg Chewable',
      category: 'مسكنات',
      activeIngredient: 'حمض أسيتيل ساليسيليك',
      price: 18.0,
      rating: 4.6,
      status: 'available',
      pharmaciesCount: 38,
      image: '../../assets/images/6.jpg',
      slug: 'aspirin',
    },
    {
      id: 'omega3',
      nameAr: 'أوميجا 3 بلس كبسولات',
      nameEn: 'Omega 3 Plus',
      category: 'مكملات غذائية',
      activeIngredient: 'زيت السمك + جنين القمح',
      price: 65.0,
      rating: 4.9,
      status: 'available',
      pharmaciesCount: 35,
      image: '../../assets/images/3.jpg',
      slug: 'omega3',
    },
    {
      id: 'vitamind',
      nameAr: 'ديفارول إس فيتامين د3',
      nameEn: 'Devarol S Vitamin D3',
      category: 'فيتامينات',
      activeIngredient: 'كوليكالسيفيرول',
      price: 25.0,
      rating: 4.7,
      status: 'available',
      pharmaciesCount: 40,
      image: '../../assets/images/4.jpg',
      slug: 'vitamind',
    },
    {
      id: 'congestal',
      nameAr: 'كونجستال أقراص للبرد',
      nameEn: 'Congestal',
      category: 'نزلات برد',
      activeIngredient: 'باراسيتامول + سودوإيفيدرين + كلورفينيرامين',
      price: 31.0,
      rating: 4.6,
      status: 'available',
      pharmaciesCount: 60,
      image: '../../assets/images/5.jpg',
      slug: 'congestal',
    },
    {
      id: 'antinal',
      nameAr: 'أنتينال 200 مجم',
      nameEn: 'Antinal 200mg',
      category: 'هضمي',
      activeIngredient: 'نيفوروكسازيد',
      price: 32.0,
      rating: 4.8,
      status: 'available',
      pharmaciesCount: 50,
      image: '../../assets/images/7.jpg',
      slug: 'antinal',
    },
  ];

  let rawMedicinesList = [...DEFAULT_CATALOG];

  // Helper Image mapper
  function getMedicineImage(nameEn, category) {
    const lower = (nameEn || '').toLowerCase();
    if (lower.includes('panadol') || lower.includes('paramol') || lower.includes('paracetamol')) return '../../assets/images/1.jpg';
    if (lower.includes('amox')) return '../../assets/images/2.jpg';
    if (lower.includes('omega')) return '../../assets/images/3.jpg';
    if (lower.includes('devarol') || lower.includes('vitamin')) return '../../assets/images/4.jpg';
    if (lower.includes('congestal') || lower.includes('cold')) return '../../assets/images/5.jpg';
    if (lower.includes('aspirin') || lower.includes('ecosprin') || lower.includes('aspocid') || lower.includes('cataflam')) return '../../assets/images/6.jpg';
    if (lower.includes('antinal') || lower.includes('digest') || lower.includes('eno')) return '../../assets/images/7.jpg';
    if (lower.includes('augmentin') || lower.includes('curam')) return '../../assets/images/8.jpg';
    return '../../assets/images/1.jpg';
  }

  // Fetch Live Data from Backend API
  async function loadMedicinesFromAPI() {
    if (window.API && window.API.medicines) {
      try {
        const res = await window.API.medicines.getAll({ limit: 50 });
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          rawMedicinesList = res.data.map((m) => {
            let cat = 'مسكنات';
            const cLower = (m.category || '').toLowerCase();
            if (cLower.includes('مضاد') || cLower.includes('antibiotic')) cat = 'مضادات حيوية';
            else if (cLower.includes('فيتامين') || cLower.includes('vitamin')) cat = 'فيتامينات';
            else if (cLower.includes('مكمل') || cLower.includes('omega')) cat = 'مكملات غذائية';
            else if (cLower.includes('برد') || cLower.includes('cold')) cat = 'نزلات برد';
            else if (cLower.includes('هضم') || cLower.includes('معدة')) cat = 'هضمي';
            else if (cLower.includes('مسكن') || cLower.includes('سيولة') || cLower.includes('قلب')) cat = 'مسكنات';

            const firstWord = (m.nameEn || m.nameAr || 'medicine').split(' ')[0].toLowerCase();

            return {
              id: m._id,
              nameAr: m.nameAr,
              nameEn: m.nameEn || m.nameAr,
              category: cat,
              activeIngredient: m.activeIngredient || '',
              price: Number(m.price) || 25.0,
              rating: 4.8,
              status: 'available',
              pharmaciesCount: Math.floor(Math.random() * 35) + 10,
              image: m.image && !m.image.startsWith('assets') ? m.image : getMedicineImage(m.nameEn, m.category),
              slug: firstWord,
            };
          });
        }
      } catch (err) {
        console.warn('API load failed, using rich local catalog preset:', err.message);
      }
    }
  }

  await loadMedicinesFromAPI();

  // Unified Filter State
  const state = {
    search: '',
    category: 'all',
    status: 'all',
    priceRange: 'all',
    sortBy: 'default',
  };

  // Toggle Advanced Filter Drawer
  if (filterBtn && filterDrawer) {
    filterBtn.addEventListener('click', () => {
      const isExpanded = filterDrawer.classList.toggle('show');
      filterBtn.classList.toggle('active', isExpanded);
      filterBtn.setAttribute('aria-expanded', isExpanded);
      if (arrowIcon) {
        arrowIcon.classList.toggle('fa-chevron-down', !isExpanded);
        arrowIcon.classList.toggle('fa-chevron-up', isExpanded);
      }
    });
  }

  // Update Active Filter Count Badge
  function updateFilterBadge() {
    let count = 0;
    if (state.category !== 'all') count++;
    if (state.status !== 'all') count++;
    if (state.priceRange !== 'all') count++;
    if (state.search.trim() !== '') count++;

    if (activeFilterBadge) {
      if (count > 0) {
        activeFilterBadge.textContent = count;
        activeFilterBadge.classList.remove('hide');
      } else {
        activeFilterBadge.classList.add('hide');
      }
    }
  }

  // Render Active Filter Chips
  function renderFilterChips() {
    if (!activeChipsContainer) return;
    activeChipsContainer.innerHTML = '';

    const chips = [];

    if (state.category !== 'all') {
      chips.push({
        label: `الفئة: ${state.category}`,
        onRemove: () => setCategory('all'),
      });
    }

    if (state.status !== 'all') {
      const statusLabels = {
        'available': 'متوفر فوراً',
        'limited': 'كمية محدودة',
        'unavailable': 'غير متوفر',
      };
      chips.push({
        label: `الحالة: ${statusLabels[state.status] || state.status}`,
        onRemove: () => setStatus('all'),
      });
    }

    if (state.priceRange !== 'all') {
      const priceLabels = {
        'under30': 'أقل من 30 ج.م',
        '30to60': '30 - 60 ج.م',
        'over60': 'أكثر من 60 ج.م',
      };
      chips.push({
        label: `السعر: ${priceLabels[state.priceRange] || state.priceRange}`,
        onRemove: () => setPriceRange('all'),
      });
    }

    if (state.search.trim() !== '') {
      chips.push({
        label: `بحث: "${state.search}"`,
        onRemove: () => {
          if (searchInput) searchInput.value = '';
          state.search = '';
          if (clearSearchBtn) clearSearchBtn.classList.add('hide');
          applyFilters();
        },
      });
    }

    chips.forEach((chip) => {
      const chipEl = document.createElement('span');
      chipEl.className = 'filter-chip';
      chipEl.innerHTML = `
        ${chip.label}
        <span class="filter-chip-remove" aria-label="إزالة">&times;</span>
      `;
      chipEl.querySelector('.filter-chip-remove').addEventListener('click', chip.onRemove);
      activeChipsContainer.appendChild(chipEl);
    });
  }

  // Dynamic Card Rendering Function
  function renderCards(medicines) {
    if (!grid) return;
    grid.innerHTML = '';

    if (totalCountEl) totalCountEl.textContent = rawMedicinesList.length;
    if (resultsCountEl) resultsCountEl.textContent = medicines.length;

    if (medicines.length === 0) {
      if (noResultsState) noResultsState.classList.remove('hide');
      return;
    } else {
      if (noResultsState) noResultsState.classList.add('hide');
    }

    medicines.forEach((med) => {
      const col = document.createElement('div');
      col.className = 'col-12 col-md-6 col-lg-3 medicine-item';
      col.dataset.category = med.category;
      col.dataset.status = med.status;
      col.dataset.price = med.price;
      col.dataset.rating = med.rating;
      col.dataset.availability = med.pharmaciesCount;
      col.dataset.name = med.nameAr;
      col.dataset.nameEn = med.nameEn;
      col.dataset.activeIng = med.activeIngredient;

      const statusBadge =
        med.status === 'available'
          ? '<span class="available">متوفر</span>'
          : med.status === 'limited'
          ? '<span class="limited">كمية محدودة</span>'
          : '<span class="unavailable">غير متوفر</span>';

      const detailUrl = `medicine-detail.html?med=${encodeURIComponent(med.slug || med.nameEn || med.nameAr)}`;

      col.innerHTML = `
        <div class="card">
          <div class="img-box">
            <a href="${detailUrl}">
              <img src="${med.image}" class="card-img-top" alt="${med.nameAr}" loading="lazy">
            </a>
            <span class="rate"><i class="fa-solid fa-star"></i> ${med.rating}</span>
            ${statusBadge}
          </div>
          <div class="card-body">
            <small>${med.nameEn} · ${med.category}</small>
            <p class="card-title"><a href="${detailUrl}">${med.nameAr}</a></p>
            <small class="text-truncate" style="max-width: 100%;">${med.activeIngredient || med.nameEn}</small>
            <div class="d-flex justify-content-between align-items-center mt-2 mb-2">
              <div>
                <small class="text-muted">السعر الرسمي</small>
                <p class="parg">${med.price.toFixed(2)} ج.م</p>
              </div>
              <div class="mrT text-end">
                <small class="text-muted">متوفر في</small><br>
                <small class="sml ${med.pharmaciesCount === 0 ? 'text-danger' : ''}">${med.pharmaciesCount} صيدلية</small>
              </div>
            </div>
            <button class="addCart w-100" data-id="${med.id}" data-name="${med.nameAr}" data-price="${med.price}" data-img="${med.image}">
              <i class="fa-solid fa-cart-plus me-1"></i> <span>أضف للسلة</span>
            </button>
          </div>
        </div>
      `;

      // Bind Cart Button Click
      const addBtn = col.querySelector('.addCart');
      if (addBtn) {
        addBtn.dataset.handledByPage = 'true';
        addBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (window.Cart) {
            window.Cart.addItem({
              id: med.id || Date.now(),
              name: med.nameAr,
              price: med.price,
              quantity: 1,
              image: med.image,
            });

            if (window.Toast) {
              window.Toast.success(`تمت إضافة (${med.nameAr}) إلى سلة المشتريات بنجاح`, 'سلة المشتريات', 3500, {
                text: 'عرض السلة',
                onClick: () => {
                  const modalEl = document.getElementById('exampleModalToggle');
                  if (modalEl && typeof bootstrap !== 'undefined') {
                    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
                    modalInstance.show();
                  }
                },
              });
            }
          }
        });
      }

      grid.appendChild(col);
    });
  }

  // Main Filter Application Function
  function applyFilters() {
    updateFilterBadge();
    renderFilterChips();

    const normalizedSearch = state.search.trim().toLowerCase();

    // Filter dynamic list
    let filtered = rawMedicinesList.filter((med) => {
      // 1. Search Check
      let matchesSearch = true;
      if (normalizedSearch) {
        const nameAr = (med.nameAr || '').toLowerCase();
        const nameEn = (med.nameEn || '').toLowerCase();
        const activeIng = (med.activeIngredient || '').toLowerCase();
        const cat = (med.category || '').toLowerCase();
        matchesSearch =
          nameAr.includes(normalizedSearch) ||
          nameEn.includes(normalizedSearch) ||
          activeIng.includes(normalizedSearch) ||
          cat.includes(normalizedSearch);
      }

      // 2. Category Check
      let matchesCategory = true;
      if (state.category !== 'all') {
        const medCat = (med.category || '').toLowerCase();
        const targetCat = state.category.toLowerCase();
        matchesCategory = medCat.includes(targetCat) || targetCat.includes(medCat);
      }

      // 3. Status Check
      let matchesStatus = true;
      if (state.status !== 'all') {
        matchesStatus = med.status === state.status;
      }

      // 4. Price Range Check
      let matchesPrice = true;
      if (state.priceRange === 'under30') {
        matchesPrice = med.price < 30;
      } else if (state.priceRange === '30to60') {
        matchesPrice = med.price >= 30 && med.price <= 60;
      } else if (state.priceRange === 'over60') {
        matchesPrice = med.price > 60;
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesPrice;
    });

    // Sort Items
    filtered.sort((a, b) => {
      switch (state.sortBy) {
        case 'priceLow':
          return a.price - b.price;
        case 'priceHigh':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'availability':
          return b.pharmaciesCount - a.pharmaciesCount;
        case 'name':
          return (a.nameAr || '').localeCompare(b.nameAr || '', 'ar');
        default:
          return 0;
      }
    });

    // Render to Grid
    renderCards(filtered);
  }

  // Set Category Helper
  function setCategory(cat) {
    state.category = cat;
    quickCategoryButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.category === cat);
    });
    applyFilters();
  }

  // Set Status Helper
  function setStatus(st) {
    state.status = st;
    statusButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.filter === st);
    });
    applyFilters();
  }

  // Set Price Range Helper
  function setPriceRange(range) {
    state.priceRange = range;
    priceButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.priceRange === range);
    });
    applyFilters();
  }

  // Reset All Filters
  function resetAllFilters() {
    state.search = '';
    state.category = 'all';
    state.status = 'all';
    state.priceRange = 'all';
    state.sortBy = 'default';

    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.classList.add('hide');
    if (sortSelect) sortSelect.value = 'default';

    quickCategoryButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.category === 'all'));
    statusButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.filter === 'all'));
    priceButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.priceRange === 'all'));

    applyFilters();

    if (window.Toast) {
      window.Toast.info('تمت إعادة تعيين كافة الفلاتر بنجاح وعرض جميع الأدوية.', 'إعادة ضبط');
    }
  }

  // Event Listeners: Search
  if (searchInput) {
    searchInput.addEventListener('input', function () {
      state.search = this.value;
      if (clearSearchBtn) {
        clearSearchBtn.classList.toggle('hide', this.value.trim() === '');
      }
      applyFilters();
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      clearSearchBtn.classList.add('hide');
      state.search = '';
      applyFilters();
      searchInput?.focus();
    });
  }

  // Event Listeners: Categories
  quickCategoryButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.category || 'all';
      setCategory(cat);
    });
  });

  // Event Listeners: Status
  statusButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const st = btn.dataset.filter || 'all';
      setStatus(st);
    });
  });

  // Event Listeners: Price Range
  priceButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const range = btn.dataset.priceRange || 'all';
      setPriceRange(range);
    });
  });

  // Event Listeners: Sorting
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      state.sortBy = this.value;
      applyFilters();
    });
  }

  // Reset Buttons
  if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetAllFilters);
  if (emptyResetBtn) emptyResetBtn.addEventListener('click', resetAllFilters);

  // Parse URL Parameters (e.g. medicines.html?search=panadol or ?category=مسكنات)
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get('search');
  const catParam = urlParams.get('category');
  if (searchParam) {
    state.search = searchParam;
    if (searchInput) searchInput.value = searchParam;
    if (clearSearchBtn) clearSearchBtn.classList.remove('hide');
  }
  if (catParam) {
    state.category = catParam;
    quickCategoryButtons.forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.category === catParam);
    });
  }

  // Initial Filter & Render Application
  applyFilters();
});
