/**
 * Teryak Platform - Payment Step Logic
 * Integrated with Auth Protection, Cart Synchronization & Payment Validation
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Auth Protection Check
  const isLoggedIn = window.Auth ? window.Auth.isLoggedIn() : Boolean(localStorage.getItem('token') || localStorage.getItem('isLoggedIn') === 'true');
  if (!isLoggedIn) {
    if (window.Toast) {
      window.Toast.warning('يرجى تسجيل الدخول أولاً للمتابعة إلى الدفع', 'تسجيل الدخول مطلوب');
    }
    setTimeout(() => {
      window.location.href = 'login.html?redirect=checkout.html';
    }, 600);
    return;
  }

  // 2. Render Order Summary
  const itemsContainer = document.getElementById('checkoutItemsContainer');
  const countBadge = document.getElementById('summaryCountBadge');
  const subtotalDisplay = document.getElementById('subtotalPriceDisplay');
  const deliveryDisplay = document.getElementById('deliveryFeeDisplay');
  const finalTotalDisplay = document.getElementById('finalTotalPriceDisplay');
  const deliveryFee = 15.00;

  function renderSummary() {
    const cartItems = (window.Cart && typeof window.Cart.getItems === 'function') ? window.Cart.getItems() : [];
    const subtotal = (window.Cart && typeof window.Cart.getTotal === 'function') ? window.Cart.getTotal() : 0;
    const count = (window.Cart && typeof window.Cart.getCount === 'function') ? window.Cart.getCount() : cartItems.length;
    const finalTotal = subtotal > 0 ? subtotal + deliveryFee : 0;

    if (countBadge) countBadge.textContent = `${count} أدوية`;
    if (subtotalDisplay) subtotalDisplay.textContent = `${subtotal.toFixed(2)} ج.م`;
    if (deliveryDisplay) deliveryDisplay.textContent = `${deliveryFee.toFixed(2)} ج.م`;
    if (finalTotalDisplay) finalTotalDisplay.textContent = `${finalTotal.toFixed(2)} ج.م`;

    if (!itemsContainer) return;

    if (cartItems.length === 0) {
      itemsContainer.innerHTML = `
        <div class="text-center py-3 text-muted">
          <small>السلة فارغة. <a href="medicines.html" class="text-success">تصفح الأدوية</a></small>
        </div>
      `;
      return;
    }

    let itemsHtml = '';
    cartItems.forEach((item) => {
      const img = item.image || item.img || '../../assets/images/parst.jpg';
      const qty = Number(item.quantity) || 1;
      const price = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 25;
      const itemSubtotal = (price * qty).toFixed(2);
      const pharmacy = item.pharmacy || 'صيدلية النهضة';

      itemsHtml += `
        <div class="summary-item-row">
          <img src="${img}" alt="${item.name}" class="summary-item-img" onerror="this.src='../../assets/images/parst.jpg'">
          <div class="summary-item-info">
            <div class="summary-item-name" title="${item.name}">${item.name}</div>
            <div class="summary-item-meta d-flex justify-content-between align-items-center">
              <span>${pharmacy}</span>
              <span class="badge bg-light text-dark border">× ${qty}</span>
            </div>
          </div>
          <div class="summary-item-price">${itemSubtotal} ج.م</div>
        </div>
      `;
    });

    itemsContainer.innerHTML = itemsHtml;
  }

  renderSummary();

  // 3. Payment Method Selection
  const byHand = document.getElementById('byHand');
  const Cash = document.getElementById('Cash'); // Card
  const credit = document.getElementById('credit'); // E-Wallet

  const byHandIC = document.getElementById('byHandIC');
  const cashIC = document.getElementById('cashIC');
  const creditIC = document.getElementById('creditIC');

  const VisaForm = document.getElementById('Visa');
  const CashForm = document.getElementById('cash');

  let selectedMethod = 'cash'; // 'cash' | 'card' | 'vodafone_cash'

  function setIndicatorState(iconEl, isChecked) {
    if (!iconEl) return;
    if (isChecked) {
      iconEl.className = 'fa-solid fa-circle-check text-success fs-4 check-indicator';
    } else {
      iconEl.className = 'fa-regular fa-circle text-muted fs-4 check-indicator';
    }
  }

  function selectPayment(type) {
    selectedMethod = type;

    // Reset all option cards
    [byHand, Cash, credit].forEach(opt => opt?.classList.remove('active'));
    setIndicatorState(byHandIC, false);
    setIndicatorState(cashIC, false);
    setIndicatorState(creditIC, false);

    if (VisaForm) VisaForm.classList.add('d-none');
    if (CashForm) CashForm.classList.add('d-none');

    if (type === 'cash') {
      if (byHand) byHand.classList.add('active');
      setIndicatorState(byHandIC, true);
      localStorage.setItem('paymentMethod', 'الدفع عند الاستلام (كاش)');
      localStorage.setItem('paymentMethodCode', 'cash');
    } else if (type === 'card') {
      if (Cash) Cash.classList.add('active');
      setIndicatorState(cashIC, true);
      if (VisaForm) VisaForm.classList.remove('d-none');
      localStorage.setItem('paymentMethod', 'بطاقة بنكية (Visa / Mastercard / ميزة)');
      localStorage.setItem('paymentMethodCode', 'card');
    } else if (type === 'wallet') {
      if (credit) credit.classList.add('active');
      setIndicatorState(creditIC, true);
      if (CashForm) CashForm.classList.remove('d-none');
      localStorage.setItem('paymentMethod', 'محفظة إلكترونية (فودافون كاش / انستاباي)');
      localStorage.setItem('paymentMethodCode', 'vodafone_cash');
    }
  }

  if (byHand) {
    byHand.addEventListener('click', () => selectPayment('cash'));
    byHand.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectPayment('cash'); } });
  }

  if (Cash) {
    Cash.addEventListener('click', () => selectPayment('card'));
    Cash.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectPayment('card'); } });
  }

  if (credit) {
    credit.addEventListener('click', () => selectPayment('wallet'));
    credit.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectPayment('wallet'); } });
  }

  // Also activate corresponding payment method if user clicks/focuses inside sub-forms
  if (VisaForm) {
    VisaForm.addEventListener('focusin', () => {
      if (selectedMethod !== 'card') selectPayment('card');
    });
  }

  if (CashForm) {
    CashForm.addEventListener('focusin', () => {
      if (selectedMethod !== 'wallet') selectPayment('wallet');
    });
  }

  // Default selection
  selectPayment('cash');

  // 4. Handle Next Button Navigation
  const nextBtn = document.getElementById('nextBtn');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (selectedMethod === 'card') {
        const cardNum = document.getElementById('criditNum')?.value.trim();
        const exp = document.getElementById('rev')?.value.trim();
        const cvv = document.getElementById('CVV')?.value.trim();

        if (!cardNum || cardNum.length < 12) {
          if (window.Toast) window.Toast.warning('يرجى إدخال رقم بطاقة بنكية صحيح مكون من 16 رقماً', 'بيانات البطاقة');
          document.getElementById('criditNum')?.focus();
          return;
        }
        if (!exp || !exp.includes('/') || exp.length < 5) {
          if (window.Toast) window.Toast.warning('يرجى إدخال تاريخ انتهاء البطاقة بصيغة MM/YY', 'بيانات البطاقة');
          document.getElementById('rev')?.focus();
          return;
        }
        if (!cvv || cvv.length < 3) {
          if (window.Toast) window.Toast.warning('يرجى إدخال رمز الأمان CVV (3 أرقام)', 'بيانات البطاقة');
          document.getElementById('CVV')?.focus();
          return;
        }
      } else if (selectedMethod === 'wallet') {
        const walletNum = document.getElementById('num')?.value.trim();
        if (!walletNum || walletNum.length < 5) {
          if (window.Toast) window.Toast.warning('يرجى إدخال رقم المحفظة الإلكترونية أو عنوان InstaPay', 'المحفظة الإلكترونية');
          document.getElementById('num')?.focus();
          return;
        }
      }

      if (window.Toast) {
        window.Toast.success('تم اختيار طريقة الدفع، جاري نقلك لمراجعة الطلب النهائية...', 'طريقة الدفع', 2000);
      }

      setTimeout(() => {
        window.location.href = 'order-summary.html';
      }, 400);
    });
  }
});

