/**
 * Teryak Platform - Reusable <pharmacist-sidebar> Web Component
 * Dynamically renders live pharmacy profile info and active navigation states.
 */

class PharmacistSidebar extends HTMLElement {
  connectedCallback() {
    this.render();
    this.loadPharmacyInfo();

    // Listen to user auth or profile changes
    window.addEventListener('teryak:auth-change', () => this.loadPharmacyInfo());
  }

  getCurrentPage() {
    const path = window.location.pathname.replace(/\\/g, '/');
    return path.split('/').pop() || 'index.html';
  }

  render() {
    const current = this.getCurrentPage();

    this.innerHTML = `
      <aside class="sidebar" id="sidebar">
        <div class="pharmacy-info d-flex align-items-center gap-3 mb-4">
          <div class="logo-box">
            <i class="fa-solid fa-prescription-bottle-medical text-success fs-3"></i>
          </div>
          <div class="overflow-hidden">
            <h2 id="sidebarPharmacyName" class="fs-5 font-bold text-dark mb-1 text-truncate">صيدلية ترياق</h2>
            <p id="sidebarPharmacyAddress" class="text-muted small mb-0 text-truncate">الفرع الرئيسي</p>
          </div>
        </div>

        <nav class="d-flex flex-column gap-2">
          <a class="${current === 'index.html' ? 'active' : ''}" href="index.html">
            <i class="fa-solid fa-chart-pie me-2"></i> الإحصائيات
          </a>
          <a class="${current === 'inventory.html' ? 'active' : ''}" href="inventory.html">
            <i class="fa-solid fa-boxes-stacked me-2"></i> المخزون
          </a>
          <a class="${current === 'orders.html' || current === 'order.html' ? 'active' : ''}" href="orders.html">
            <i class="fa-solid fa-clipboard-list me-2"></i> الطلبات
          </a>
          <a class="${current === 'exchange.html' || current === 'exchanges.html' ? 'active' : ''}" href="exchange.html">
            <i class="fa-solid fa-arrow-right-arrow-left me-2"></i> تبادل المخزون
          </a>
          <a class="${current === 'notifications.html' ? 'active' : ''}" href="notifications.html">
            <i class="fa-solid fa-bell me-2"></i> الإشعارات
          </a>
        </nav>
      </aside>
    `;
  }

  async loadPharmacyInfo() {
    let name = 'صيدلية ترياق';
    let address = 'الفرع المعتمد';

    try {
      const user = window.Auth ? window.Auth.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || 'null');
      if (user) {
        if (user.pharmacyName && user.pharmacyName.trim().length > 0) {
          name = user.pharmacyName.trim();
        } else if (user.name && user.name.trim().length > 0) {
          name = `صيدلية د. ${user.name.trim()}`;
        }

        if (user.address && user.address.trim().length > 0) {
          address = user.address.trim();
        } else if (user.city && user.city.trim().length > 0) {
          address = user.city.trim();
        }
      }

      // Try fetching live pharmacy profile if API is available
      if (window.API && window.API.pharmacies && window.Auth && window.Auth.isLoggedIn()) {
        try {
          const res = await window.API.pharmacies.getMyPharmacy();
          if (res && res.data && res.data.pharmacy) {
            const p = res.data.pharmacy;
            if (p.name) name = p.name;
            if (p.address) address = p.address;
          }
        } catch (e) {
          // silent fallback
        }
      }
    } catch (e) {
      console.warn('Sidebar info load error:', e);
    }

    const nameEl = this.querySelector('#sidebarPharmacyName');
    const addrEl = this.querySelector('#sidebarPharmacyAddress');

    if (nameEl) nameEl.textContent = name;
    if (addrEl) addrEl.textContent = address;
  }
}

customElements.define('pharmacist-sidebar', PharmacistSidebar);
