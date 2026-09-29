/**
 * Teryak Platform - Reusable <app-cart-modal> Web Component
 * Fully Interactive Cart Drawer/Modal with Real-Time Quantity Adjustments & Price Calculation
 */

class AppCartModal extends HTMLElement {
  connectedCallback() {
    this.render();
    this.bindEvents();
    this.renderCartItems();

    // Listen to global cart state changes
    window.addEventListener('teryak:cart-change', () => this.renderCartItems());

    // Listen to modal open event to refresh
    const modalEl = this.querySelector('#exampleModalToggle');
    if (modalEl) {
      modalEl.addEventListener('show.bs.modal', () => this.renderCartItems());
    }
  }

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

  render() {
    const base = this.getBasePath();
    const checkoutUrl = base + 'pages/public/checkout.html';

    this.innerHTML = `
      <div class="modal fade" id="exampleModalToggle" aria-hidden="true" aria-labelledby="exampleModalToggleLabel" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title font-bold text-dark" id="exampleModalToggleLabel">
                <i class="fa-solid fa-cart-shopping text-success me-2"></i> سلة مشتريات الأدوية
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body p-3" id="cartModalBody">
              <!-- Dynamically populated cart items -->
            </div>

            <div class="cart-modal-footer-actions">
              <div class="cart-total-price">
                المجموع الكلي: <span id="cartTotalPrice" class="text-success font-bold fs-5">0.00 ج.م</span>
              </div>
              <div class="d-flex gap-2">
                <button type="button" class="btn btn-outline-secondary btn-sm" id="clearCartBtn">
                  <i class="fa-solid fa-trash-can me-1"></i> تفريغ السلة
                </button>
                <a href="${checkoutUrl}" id="proceedToCheckoutBtn" class="btn-checkout-cart">
                  إتمام الطلب <i class="fa-solid fa-arrow-left ms-1"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const clearBtn = this.querySelector('#clearCartBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (window.Cart) {
          window.Cart.clearCart();
          if (window.Toast) {
            window.Toast.info('تم تفريغ سلة المشتريات بالكامل', 'السلة', 2500);
          }
        }
      });
    }

    // Global event delegation inside modal body for quantity and delete buttons
    const container = this.querySelector('#cartModalBody');
    if (container) {
      container.addEventListener('click', (e) => {
        const plusBtn = e.target.closest('.btn-plus');
        const minusBtn = e.target.closest('.btn-minus');
        const removeBtn = e.target.closest('.btn-remove-item');

        if (plusBtn) {
          e.preventDefault();
          e.stopPropagation();
          const identifier = plusBtn.dataset.id || plusBtn.dataset.name;
          if (window.Cart) window.Cart.updateQuantity(identifier, 1);
        } else if (minusBtn) {
          e.preventDefault();
          e.stopPropagation();
          const identifier = minusBtn.dataset.id || minusBtn.dataset.name;
          if (window.Cart) window.Cart.updateQuantity(identifier, -1);
        } else if (removeBtn) {
          e.preventDefault();
          e.stopPropagation();
          const identifier = removeBtn.dataset.id || removeBtn.dataset.name;
          if (window.Cart) {
            window.Cart.removeItem(identifier);
            if (window.Toast) {
              window.Toast.info('تم حذف الصنف من السلة', 'سلة المشتريات', 2000);
            }
          }
        }
      });
    }
  }

  renderCartItems() {
    const container = this.querySelector('#cartModalBody');
    const totalPriceEl = this.querySelector('#cartTotalPrice');
    const checkoutBtn = this.querySelector('#proceedToCheckoutBtn');
    if (!container) return;

    const cart = window.Cart ? window.Cart.getCart() : [];

    if (cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty-message text-center py-4">
          <div class="empty-cart-icon mb-3">
            <i class="fa-solid fa-cart-arrow-down text-muted" style="font-size: 46px;"></i>
          </div>
          <h6 class="font-bold text-dark mb-1">سلة المشتريات فارغة حالياً</h6>
          <p class="text-muted small mb-0">تصفح قائمة الأدوية وأضف ما تحتاجه إلى سلتك بكل سهولة</p>
        </div>
      `;
      if (totalPriceEl) totalPriceEl.textContent = '0.00 ج.م';
      if (checkoutBtn) {
        checkoutBtn.classList.add('disabled');
        checkoutBtn.style.pointerEvents = 'none';
        checkoutBtn.style.opacity = '0.5';
      }
      return;
    }

    if (checkoutBtn) {
      checkoutBtn.classList.remove('disabled');
      checkoutBtn.style.pointerEvents = 'auto';
      checkoutBtn.style.opacity = '1';
    }

    let html = '';
    const base = this.getBasePath();

    cart.forEach(item => {
      let imgSrc = item.img || item.image;
      if (!imgSrc || imgSrc.includes('undefined')) {
        imgSrc = base + 'assets/images/parst.jpg';
      }

      let numPrice = typeof item.price === 'number'
        ? item.price
        : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 25.0;

      const itemTotal = (numPrice * (item.quantity || 1)).toFixed(2);
      const itemId = item.id || item.name;

      html += `
        <div class="modalDiv" data-id="${itemId}" data-name="${item.name}">
          <div class="cart-item-info-group">
            <img src="${imgSrc}" alt="${item.name}" class="cart-item-thumb" onerror="this.src='${base}assets/images/parst.jpg'">
            <div>
              <p class="NameOfMedicine">${item.name}</p>
              <div class="d-flex align-items-center gap-2">
                <span class="PriceOfMedicine">${numPrice.toFixed(2)} ج.م</span>
                <small class="text-muted">(${itemTotal} ج.م الإجمالي)</small>
              </div>
            </div>
          </div>

          <div class="cart-item-actions-group">
            <!-- Plus/Minus Stepper -->
            <div class="cart-item-qty-control">
              <button type="button" class="btn-qty-action btn-minus" data-id="${itemId}" data-name="${item.name}" title="تقليل الكمية">
                <i class="fa-solid fa-minus"></i>
              </button>
              <span class="cart-item-qty-val">${item.quantity || 1}</span>
              <button type="button" class="btn-qty-action btn-plus" data-id="${itemId}" data-name="${item.name}" title="زيادة الكمية">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>

            <!-- Remove Button -->
            <button type="button" class="btn-remove-item" data-id="${itemId}" data-name="${item.name}" title="حذف الدواء من السلة">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    const total = window.Cart ? window.Cart.getTotalPrice() : 0;
    if (totalPriceEl) {
      totalPriceEl.textContent = total.toFixed(2) + ' ج.م';
    }
  }
}

customElements.define('app-cart-modal', AppCartModal);
