/**
 * Teryak Platform - Reusable <app-navbar> Web Component
 * Supports Live Authentication State, Cart Sync, Theme Switching (Dark/Light), and Language Switcher
 */

class AppNavbar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.initTheme();
    this.bindEvents();
    this.updateAuthState();
    this.updateCartCount();

    // Listen to global platform events
    window.addEventListener('teryak:auth-change', () => this.updateAuthState());
    window.addEventListener('teryak:cart-change', () => this.updateCartCount());
    window.addEventListener('teryak:theme-change', (e) => this.applyTheme(e.detail?.theme));
  }

  // Calculate relative root path dynamically based on page location
  getBasePath() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/pages/public/') || path.includes('/pages/pharmacist/') || path.includes('/pages/admin/')) {
      return '../../';
    } else if (path.includes('/pages/')) {
      return '../';
    } else {
      return './';
    }
  }

  getCurrentPage() {
    const path = window.location.pathname.replace(/\\/g, '/');
    const segment = path.split('/').pop() || 'index.html';
    return segment;
  }

  initTheme() {
    const savedTheme = localStorage.getItem('teryak_theme') || 'light';
    this.applyTheme(savedTheme, false);
  }

  applyTheme(theme, save = true) {
    const isDark = theme === 'dark';
    if (isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark-theme');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.body.classList.remove('dark-theme');
    }

    if (save) {
      localStorage.setItem('teryak_theme', isDark ? 'dark' : 'light');
    }

    // Update icons
    const themeBtns = this.querySelectorAll('#themeToggleBtn, #mobileThemeToggleBtn');
    themeBtns.forEach((btn) => {
      btn.innerHTML = isDark
        ? '<i class="fa-solid fa-sun text-warning"></i>'
        : '<i class="fa-solid fa-moon"></i>';
      btn.title = isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي';
    });
  }

  render() {
    const base = this.getBasePath();
    const current = this.getCurrentPage();

    const isHome = current === 'index.html' || current === 'home.html' || current === '';
    const isMedicines = current === 'medicines.html' || current === 'medicine.html' || current === 'medicine-detail.html';
    const isPharmacies = current === 'pharmacies.html';
    const isDonation = current === 'donation.html';
    const isAbout = current === 'about.html';

    const homeUrl = base + 'index.html';
    const medicinesUrl = base + 'pages/public/medicines.html';
    const pharmaciesUrl = base + 'pages/public/pharmacies.html';
    const donationUrl = base + 'pages/public/donation.html';
    const aboutUrl = base + 'pages/public/about.html';
    const loginUrl = base + 'pages/public/login.html';
    const registerUrl = base + 'pages/public/register.html';
    const logoImg = base + 'assets/images/logo.png';

    this.innerHTML = `
      <!-- Desktop Header -->
      <header class="header">
        <div class="leftofHeader">
          <a href="${homeUrl}" class="d-flex align-items-center gap-2 text-decoration-none">
            <img class="logo" src="${logoImg}" alt="Teryak Logo">
            <h1 class="m-0">تـريـاق</h1>
          </a>
        </div>

        <nav class="centerofHeader">
          <ul>
            <li><a href="${homeUrl}" class="${isHome ? 'active' : ''}">الرئيسية</a></li>
            <li><a href="${medicinesUrl}" class="${isMedicines ? 'active' : ''}">الأدوية</a></li>
            <li><a href="${pharmaciesUrl}" class="${isPharmacies ? 'active' : ''}">الصيدليات</a></li>
            <li><a href="${donationUrl}" class="${isDonation ? 'active' : ''}">التبرع</a></li>
            <li><a href="${aboutUrl}" class="${isAbout ? 'active' : ''}">من نحن</a></li>
          </ul>
        </nav>

        <div class="rightofHeader">
          <!-- Logged-in User Controls -->
          <div class="auth-user-section hide" id="userAuthDisplay">
            <button class="btn btn-sm btn-outline-danger font-bold" id="Logout" title="تسجيل الخروج">
              <i class="fa-solid fa-right-from-bracket me-1"></i> خروج
            </button>
            <div class="user-avatar-btn-wrap" id="IconWrapper" title="لوحة التحكم / الملف الشخصي" style="cursor: pointer;">
              <i class="fa-solid fa-circle-user" id="Icon"></i>
            </div>
          </div>

          <!-- Guest Controls -->
          <div class="auth-guest-section d-flex align-items-center gap-2" id="guestAuthDisplay">
            <a href="${registerUrl}" class="btn-primary-action" id="SignUp">إنشاء حساب</a>
            <a href="${loginUrl}" class="span" id="SignIn">تسجيل الدخول</a>
          </div>

          <button type="button" class="btn2" id="langToggleBtn" title="تغيير اللغة">AR</button>
          <button type="button" class="btn2" id="themeToggleBtn" title="الوضع الليلي"><i class="fa-solid fa-moon"></i></button>

          <div class="cart-icon-wrapper" data-bs-toggle="modal" data-bs-target="#exampleModalToggle" title="سلة الطلبات">
            <i class="fa-solid fa-cart-shopping icon"></i>
            <span id="count">0</span>
          </div>
        </div>
      </header>

      <!-- Mobile Responsive Header Bar -->
      <div class="btn-resp">
        <!-- Right (RTL Start): Brand Logo & Platform Title -->
        <div class="leftofHeaderRes">
          <a href="${homeUrl}" class="d-flex align-items-center gap-2 text-decoration-none">
            <img class="logo" src="${logoImg}" alt="Teryak Logo">
            <h1 class="m-0">تـريـاق</h1>
          </a>
        </div>

        <!-- Left (RTL End): Actions & Hamburger Menu -->
        <div class="rightofHeaderResp">
          <div class="cart-icon-wrapper" data-bs-toggle="modal" data-bs-target="#exampleModalToggle" title="سلة الطلبات">
            <i class="fa-solid fa-cart-shopping icon"></i>
            <span id="counter">0</span>
          </div>
          <button type="button" class="btn2" id="mobileThemeToggleBtn" title="الوضع الليلي"><i class="fa-solid fa-moon"></i></button>
          <button type="button" class="btn2" id="mobileLangToggleBtn" title="تغيير اللغة">AR</button>
          <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="فتح القائمة">
            <i class="fa-solid fa-bars"></i>
          </button>
        </div>
      </div>

      <!-- Offcanvas Mobile Drawer -->
      <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
        <div class="offcanvas-header d-flex justify-content-between align-items-center border-bottom pb-3">
          <h5 class="offcanvas-title font-bold text-success m-0" id="offcanvasNavbarLabel">
            <i class="fa-solid fa-layer-group me-2"></i> قائمة ترياق
          </h5>
          <button type="button" class="btn-drawer-close" data-bs-dismiss="offcanvas" aria-label="إغلاق">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="offcanvas-body">
          <ul class="list-unstyled d-flex flex-column gap-2 mb-4">
            <a href="${homeUrl}"><li class="${isHome ? 'active' : ''} p-2 rounded">الرئيسية</li></a>
            <a href="${medicinesUrl}"><li class="${isMedicines ? 'active' : ''} p-2 rounded">الأدوية</li></a>
            <a href="${pharmaciesUrl}"><li class="${isPharmacies ? 'active' : ''} p-2 rounded">الصيدليات</li></a>
            <a href="${donationUrl}"><li class="${isDonation ? 'active' : ''} p-2 rounded">التبرع</li></a>
            <a href="${aboutUrl}"><li class="${isAbout ? 'active' : ''} p-2 rounded">من نحن</li></a>
          </ul>

          <div class="bottom mt-auto">
            <div id="mobileGuestButtons" class="d-flex flex-column gap-2">
              <a href="${registerUrl}"><button class="btn btn-register w-100 font-bold">إنشاء حساب</button></a>
              <a href="${loginUrl}"><button class="btn btn-login w-100 font-bold">تسجيل الدخول</button></a>
            </div>
            <div id="mobileUserButtons" class="d-flex flex-column gap-2 hide">
              <button class="btn btn-success w-100 font-bold" id="mobileDashboardBtn"><i class="fa-solid fa-gauge-high me-2"></i> لوحة التحكم</button>
              <button class="btn btn-outline-danger w-100 font-bold" id="mobileLogoutBtn"><i class="fa-solid fa-right-from-bracket me-2"></i> تسجيل خروج</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const base = this.getBasePath();
    const logoutBtn = this.querySelector('#Logout');
    const mobileLogoutBtn = this.querySelector('#mobileLogoutBtn');
    const userIcon = this.querySelector('#Icon');
    const iconWrapper = this.querySelector('#IconWrapper');
    const mobileDashBtn = this.querySelector('#mobileDashboardBtn');
    const themeToggleBtn = this.querySelector('#themeToggleBtn');
    const mobileThemeToggleBtn = this.querySelector('#mobileThemeToggleBtn');
    const langToggleBtn = this.querySelector('#langToggleBtn');
    const mobileLangToggleBtn = this.querySelector('#mobileLangToggleBtn');

    const handleDashboardNav = (e) => {
      if (e) e.preventDefault();
      const currentUser = window.Auth ? window.Auth.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || 'null');
      const userType = currentUser ? (currentUser.role || currentUser.userType) : localStorage.getItem('userType');

      if (userType === 'صيدلي' || userType === 'pharmacist') {
        window.location.href = base + 'pages/pharmacist/index.html';
      } else if (userType === 'إدارة' || userType === 'admin') {
        window.location.href = base + 'pages/admin/index.html';
      } else {
        window.location.href = base + 'pages/public/patient-dashboard.html';
      }
    };

    const handleLogout = (e) => {
      if (e) e.preventDefault();
      if (window.Auth) {
        window.Auth.logout(base + 'index.html');
      } else {
        localStorage.clear();
        window.location.href = base + 'index.html';
      }
    };

    const handleThemeToggle = (e) => {
      if (e) e.preventDefault();
      const isCurrentlyDark = document.body.classList.contains('dark-theme') || document.documentElement.getAttribute('data-theme') === 'dark';
      const newTheme = isCurrentlyDark ? 'light' : 'dark';
      this.applyTheme(newTheme, true);
      window.dispatchEvent(new CustomEvent('teryak:theme-change', { detail: { theme: newTheme } }));
    };

    const handleLangToggle = (e) => {
      if (e) e.preventDefault();
      if (window.Toast) {
        window.Toast.info('اللغة الحالية هي العربية (الافتراضية). دعم اللغات الإضافية قريباً!', 'لغة الواجهة', 3000);
      }
    };

    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout);
    if (userIcon) userIcon.addEventListener('click', handleDashboardNav);
    if (iconWrapper) iconWrapper.addEventListener('click', handleDashboardNav);
    if (mobileDashBtn) mobileDashBtn.addEventListener('click', handleDashboardNav);
    if (themeToggleBtn) themeToggleBtn.addEventListener('click', handleThemeToggle);
    if (mobileThemeToggleBtn) mobileThemeToggleBtn.addEventListener('click', handleThemeToggle);
    if (langToggleBtn) langToggleBtn.addEventListener('click', handleLangToggle);
    if (mobileLangToggleBtn) mobileLangToggleBtn.addEventListener('click', handleLangToggle);
  }

  updateAuthState() {
    const isLoggedIn = window.Auth ? window.Auth.isLoggedIn() : (localStorage.getItem('isLoggedIn') === 'true' || localStorage.getItem('haveAcount') === 'true');
    const userAuthDisplay = this.querySelector('#userAuthDisplay');
    const guestAuthDisplay = this.querySelector('#guestAuthDisplay');
    const mobileGuestButtons = this.querySelector('#mobileGuestButtons');
    const mobileUserButtons = this.querySelector('#mobileUserButtons');

    if (isLoggedIn) {
      if (userAuthDisplay) userAuthDisplay.classList.remove('hide');
      if (guestAuthDisplay) guestAuthDisplay.classList.add('hide');
      if (mobileGuestButtons) mobileGuestButtons.classList.add('hide');
      if (mobileUserButtons) mobileUserButtons.classList.remove('hide');
    } else {
      if (userAuthDisplay) userAuthDisplay.classList.add('hide');
      if (guestAuthDisplay) guestAuthDisplay.classList.remove('hide');
      if (mobileGuestButtons) mobileGuestButtons.classList.remove('hide');
      if (mobileUserButtons) mobileUserButtons.classList.add('hide');
    }
  }

  updateCartCount() {
    const count = window.Cart ? window.Cart.getCount() : 0;
    const countEl = this.querySelector('#count');
    const counterEl = this.querySelector('#counter');
    if (countEl) countEl.textContent = count;
    if (counterEl) counterEl.textContent = count;
  }
}

customElements.define('app-navbar', AppNavbar);
