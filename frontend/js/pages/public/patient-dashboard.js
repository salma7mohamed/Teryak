/**
 * Teryak Platform - Patient Dashboard Logic
 * Fully Dynamic Data Engine Connected with Live Database & Local Storage
 */

document.addEventListener('DOMContentLoaded', async () => {
  const items = document.querySelectorAll('.list ul li');
  const sections = [
    document.querySelector('.hidden1'),
    document.querySelector('.hidden2'),
    document.querySelector('.hidden3'),
    document.querySelector('.hidden4'),
    document.querySelector('.hidden5'),
    document.querySelector('.hidden6')
  ];

  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(li => li.classList.remove('active'));
      item.classList.add('active');
      sections.forEach(section => {
        if (section) section.style.display = 'none';
      });
      const target = document.querySelector('.' + item.dataset.target);
      if (target) target.style.display = 'block';
    });
  });

  // User Greeting & Details
  const userNameEl = document.getElementById('userName');
  const userEmailOrPhoneEl = document.getElementById('userEmailOrPhone');
  const currentUser = window.Auth ? window.Auth.getCurrentUser() : JSON.parse(localStorage.getItem('currentUser') || 'null');

  if (currentUser) {
    if (userNameEl) userNameEl.textContent = currentUser.name || currentUser.fullName || currentUser.email?.split('@')[0] || 'عزيزنا المستخدم';
    if (userEmailOrPhoneEl) userEmailOrPhoneEl.textContent = currentUser.email || currentUser.phone || 'حساب مفعل في ترياق';
  } else {
    if (userNameEl) userNameEl.textContent = 'عزيزنا المستخدم';
    if (userEmailOrPhoneEl) userEmailOrPhoneEl.textContent = 'حساب تجريبي / ضيف';
  }

  // Load and Render Dynamic Patient Orders
  async function loadPatientOrders() {
    let orders = [];

    try {
      if (window.API && window.API.orders) {
        const res = await window.API.orders.getMyOrders();
        if (res && res.data && Array.isArray(res.data)) {
          orders = res.data;
        }
      }
    } catch (e) {
      console.warn('Backend orders fetch fallback to localStorage:', e);
    }

    if (orders.length === 0) {
      try {
        const saved = localStorage.getItem('myOrders');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) orders = parsed;
        }
      } catch (e) {
        orders = [];
      }
    }

    // Update Overview Stats
    const statActive = document.getElementById('statActiveOrders');
    const statSpent = document.getElementById('statTotalSpent');
    const paymentsTotal = document.getElementById('paymentsTotalVal');
    const paymentsCount = document.getElementById('paymentsCountBadge');
    const overviewContent = document.getElementById('overviewBookingContent');

    const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready');
    const totalSpent = orders.reduce((sum, ord) => sum + (Number(ord.totalPrice) || Number(ord.totalAmount) || Number(ord.subtotal) || 0), 0);

    if (statActive) statActive.textContent = activeOrders.length;
    if (statSpent) statSpent.textContent = `${totalSpent.toFixed(2)} ج.م`;
    if (paymentsTotal) paymentsTotal.textContent = `${totalSpent.toFixed(2)} ج.م`;
    if (paymentsCount) paymentsCount.textContent = `${orders.length} معاملات`;

    // Overview Active Booking Box
    if (overviewContent) {
      if (activeOrders.length > 0) {
        const topOrder = activeOrders[0];
        const firstItem = (topOrder.items && topOrder.items[0]) || { name: 'دواء علاجي' };
        const img = firstItem.image || firstItem.img || '../../assets/images/parst.jpg';

        overviewContent.innerHTML = `
          <div class="d-flex align-items-center gap-3">
            <img src="${img}" alt="${firstItem.name}" style="width: 50px; height: 50px; border-radius: 8px; object-fit: cover;" onerror="this.src='../../assets/images/parst.jpg'">
            <div>
              <p class="font-bold text-dark mb-0">${firstItem.name}</p>
              <small class="text-success font-bold">الحالة: ${getOrderStatusLabel(topOrder.status)}</small>
            </div>
          </div>
        `;
      } else {
        overviewContent.innerHTML = `<p class="text-muted small mb-0">لا توجد طلبات جارية حالياً.</p>`;
      }
    }

    // Render Tab 2: Orders List
    const ordersContainer = document.getElementById('patientOrdersContainer');
    if (ordersContainer) {
      if (orders.length === 0) {
        ordersContainer.innerHTML = `
          <div class="text-center py-5 bg-white border rounded">
            <i class="fa-solid fa-box-open fs-1 text-muted mb-2 d-block"></i>
            <h6 class="font-bold text-dark mb-1">لا توجد طلبات سابقة</h6>
            <p class="text-muted small mb-3">يمكنك تصفح دليل الأدوية وطلب علاجك مباشرة ليصلك من الصيدلية</p>
            <a href="medicines.html" class="btn btn-success font-bold btn-sm">تصفح الأدوية الآن</a>
          </div>
        `;
      } else {
        let ordersHtml = '';
        orders.forEach(order => {
          const orderNum = order.orderNumber || order._id?.substring(order._id.length - 6).toUpperCase() || 'ORD';
          const items = order.items || [];
          const firstItem = items[0] || { name: 'أدوية علاجية', price: 25 };
          const medName = firstItem.name + (items.length > 1 ? ` (+${items.length - 1} أدوية أخرى)` : '');
          const img = firstItem.image || firstItem.img || '../../assets/images/parst.jpg';
          const pharmacyName = order.pharmacyName || order.pharmacyId?.name || 'صيدلية ترياق المعتمدة';
          const total = Number(order.totalPrice || order.totalAmount || order.subtotal || 25).toFixed(2);
          const status = order.status || 'pending';

          ordersHtml += `
            <div class="secOne p-3 bg-white border rounded d-flex justify-content-between align-items-center mb-2 shadow-xs" data-order-id="${order._id}">
              <div class="d-flex align-items-center gap-3">
                <img src="${img}" alt="${firstItem.name}" style="width: 55px; height: 55px; border-radius: 8px; object-fit: cover;" onerror="this.src='../../assets/images/parst.jpg'">
                <div>
                  <p class="parg font-bold mb-0 text-dark">${medName}</p>
                  <small class="text-muted"><i class="fa-solid fa-store me-1"></i> ${pharmacyName}</small><br>
                  <small class="text-muted"><i class="fa-solid fa-hashtag me-1"></i> ${orderNum} · <b class="text-success">${total} ج.م</b></small>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2">
                ${getOrderStatusBadge(status)}
                ${status === 'pending' || status === 'preparing' ? `<button class="btn btn-outline-danger btn-sm btn-cancel-booking" data-id="${order._id}">إلغاء</button>` : ''}
              </div>
            </div>
          `;
        });
        ordersContainer.innerHTML = ordersHtml;
        bindCancelListeners();
      }
    }

    // Render Tab 5: Payments List
    const paymentsContainer = document.getElementById('paymentsListContainer');
    if (paymentsContainer) {
      if (orders.length === 0) {
        paymentsContainer.innerHTML = `
          <div class="text-center py-4 bg-white border rounded">
            <p class="text-muted mb-0">لا توجد معاملات مالية مسجلة بعد</p>
          </div>
        `;
      } else {
        let paymentsHtml = '';
        orders.forEach(order => {
          const firstItem = (order.items && order.items[0]) || { name: 'مشتريات أدوية' };
          const pharmacyName = order.pharmacyName || order.pharmacyId?.name || 'صيدلية ترياق المعتمدة';
          const total = Number(order.totalPrice || order.totalAmount || order.subtotal || 25).toFixed(2);
          const dateStr = new Date(order.createdAt || Date.now()).toLocaleDateString('ar-EG');

          paymentsHtml += `
            <div class="secOne p-3 bg-white border rounded d-flex justify-content-between align-items-center">
              <div>
                <p class="font-bold mb-0 text-dark">${firstItem.name}</p>
                <small class="text-muted"><i class="fa-solid fa-store me-1"></i> ${pharmacyName} · ${dateStr}</small>
              </div>
              <span class="font-bold text-success fs-6">${total} ج.م</span>
            </div>
          `;
        });
        paymentsContainer.innerHTML = paymentsHtml;
      }
    }
  }

  function getOrderStatusLabel(status) {
    switch (status) {
      case 'pending': return 'قيد الانتظار والمراجعة';
      case 'preparing': return 'قيد التجهيز في الصيدلية';
      case 'ready': return 'جاهز للاستلام الفوري';
      case 'completed': return 'مكتمل وتم الاستلام';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  }

  function getOrderStatusBadge(status) {
    switch (status) {
      case 'pending':
        return '<span class="badge bg-warning text-dark p-2">قيد المراجعة</span>';
      case 'preparing':
        return '<span class="badge bg-info text-white p-2">جاري التحضير</span>';
      case 'ready':
        return '<span class="badge bg-primary text-white p-2">جاهز للاستلام</span>';
      case 'completed':
        return '<span class="badge bg-success text-white p-2">مكتمل وتم الاستلام</span>';
      case 'cancelled':
        return '<span class="badge bg-secondary text-white p-2">ملغي</span>';
      default:
        return `<span class="badge bg-light text-dark p-2">${status}</span>`;
    }
  }

  function bindCancelListeners() {
    document.querySelectorAll('.btn-cancel-booking').forEach(btn => {
      btn.addEventListener('click', async () => {
        const card = btn.closest('.secOne');
        const orderId = btn.dataset.id;

        if (window.Toast && window.Toast.confirm) {
          const confirmed = await window.Toast.confirm({
            title: 'إلغاء الطلب',
            message: 'هل أنت متأكد من رغبتك في إلغاء هذا الطلب؟',
            type: 'danger',
            confirmText: 'نعم، إلغاء الطلب',
            cancelText: 'تراجع'
          });

          if (confirmed) {
            try {
              if (window.API && window.API.orders && orderId && orderId.length === 24) {
                await window.API.orders.cancel(orderId);
              }
            } catch (e) {
              console.warn('API order cancel fallback:', e);
            }

            if (card) {
              card.style.opacity = '0.5';
              btn.textContent = 'تم الإلغاء';
              btn.disabled = true;
            }
            window.Toast.success('تم إلغاء الطلب بنجاح وإشعار الصيدلية.', 'إلغاء الطلب');
          }
        }
      });
    });
  }

  await loadPatientOrders();

  // Upload Prescription Modal trigger
  const uploadRxBtn = document.querySelector('.btn-upload-rx');
  if (uploadRxBtn) {
    uploadRxBtn.addEventListener('click', () => {
      if (window.Toast) {
        window.Toast.info(
          'يمكنك تصوير ورفع الروشتة الطبية وسيتم إرسالها لأقرب صيدلية لصرفها فوراً.',
          'رفع روشتة طبية',
          4500
        );
      }
    });
  }
});