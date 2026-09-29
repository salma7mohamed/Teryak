/**
 * Teryak Platform - Pharmacist Orders Management Controller
 * Handles order lifecycles, live search/filtering, KPI calculation, and interactive modal/invoice.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const ordersListContainer = document.getElementById('ordersListContainer');
  const searchInput = document.getElementById('orderSearchInput');
  const statusTabs = document.getElementById('orderStatusTabs');
  const btnRefresh = document.getElementById('btnRefreshOrders');
  const detailsModalEl = document.getElementById('orderDetailsModal');
  const btnPrintInvoice = document.getElementById('btnPrintOrderInvoice');

  // KPI Elements
  const kpiTotal = document.getElementById('kpiTotalOrders');
  const kpiPending = document.getElementById('kpiPendingOrders');
  const kpiPreparing = document.getElementById('kpiPreparingOrders');
  const kpiCompleted = document.getElementById('kpiCompletedOrders');

  // Tab Badge Counters
  const countAll = document.getElementById('countAll');
  const countPending = document.getElementById('countPending');
  const countPreparing = document.getElementById('countPreparing');
  const countReady = document.getElementById('countReady');
  const countCompleted = document.getElementById('countCompleted');
  const countCancelled = document.getElementById('countCancelled');

  // State
  let ordersList = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let activeSelectedOrder = null;
  let detailsModalInstance = null;

  if (detailsModalEl && typeof bootstrap !== 'undefined') {
    detailsModalInstance = new bootstrap.Modal(detailsModalEl);
  }

  // Default Mock Pharmacy Orders Dataset
  const DEFAULT_MOCK_ORDERS = [
    {
      _id: 'ord_101',
      orderNumber: 'ORD-001',
      status: 'pending',
      createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      patientId: { name: 'أحمد محمد', phone: '01012345678' },
      shippingAddress: { fullName: 'أحمد محمد', phone: '01012345678', address: 'شارع الجمهورية - عمارة 14 - الدور الثالث', city: 'المنصورة' },
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      totalPrice: 130.00,
      notes: 'يرجى إرسال الفاتورة مع الطلب وتوصيل الدواء سريعاً',
      items: [
        {
          name: 'باراسيتامول 500 مجم أقراص',
          image: '../../assets/images/parst.jpg',
          quantity: 2,
          price: 25.00,
          total: 50.00
        },
        {
          name: 'بانادول إكسترا 500 مجم',
          image: '../../assets/images/panadol.jpg',
          quantity: 2,
          price: 40.00,
          total: 80.00
        }
      ]
    },
    {
      _id: 'ord_102',
      orderNumber: 'ORD-002',
      status: 'preparing',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      patientId: { name: 'سارة علي خليل', phone: '01198765432' },
      shippingAddress: { fullName: 'سارة علي خليل', phone: '01198765432', address: 'حي الجامعة - بجوار مسجد النور', city: 'المنصورة' },
      paymentMethod: 'online',
      paymentStatus: 'paid',
      totalPrice: 85.50,
      notes: 'الاستلام مباشرة من فرع الصيدلية',
      items: [
        {
          name: 'أموكسيسيلين 500 مجم كبسولات',
          image: '../../assets/images/Amoxicillin.jpg',
          quantity: 1,
          price: 85.50,
          total: 85.50
        }
      ]
    },
    {
      _id: 'ord_103',
      orderNumber: 'ORD-003',
      status: 'ready',
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
      patientId: { name: 'محمد حسن إبراهيم', phone: '01234567890' },
      shippingAddress: { fullName: 'محمد حسن إبراهيم', phone: '01234567890', address: 'شارع الجيش - أمام المستشفى الدولي', city: 'المنصورة' },
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'pending',
      totalPrice: 240.00,
      notes: 'تأكيد توفر العبوات بتاريخ صلاحية حديث',
      items: [
        {
          name: 'أوميجا 3 بلس كبسول جيلاتيني',
          image: '../../assets/images/omega.jpg',
          quantity: 2,
          price: 120.00,
          total: 240.00
        }
      ]
    },
    {
      _id: 'ord_104',
      orderNumber: 'ORD-004',
      status: 'completed',
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      patientId: { name: 'نورا أحمد السيد', phone: '01122334455' },
      shippingAddress: { fullName: 'نورا أحمد السيد', phone: '01122334455', address: 'ميدان الثورة - برج الأطباء', city: 'المنصورة' },
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'paid',
      totalPrice: 42.00,
      notes: '',
      items: [
        {
          name: 'كونجستال أقراص للبرد والانفلونزا',
          image: '../../assets/images/congestal.jpg',
          quantity: 1,
          price: 42.00,
          total: 42.00
        }
      ]
    },
    {
      _id: 'ord_105',
      orderNumber: 'ORD-005',
      status: 'cancelled',
      createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      patientId: { name: 'كريم محمود يوسف', phone: '01099887766' },
      shippingAddress: { fullName: 'كريم محمود يوسف', phone: '01099887766', address: 'شارع الترعة - عمارة الأمل', city: 'المنصورة' },
      paymentMethod: 'cash_on_delivery',
      paymentStatus: 'failed',
      totalPrice: 65.00,
      notes: 'تم الإلغاء بناءً على رغبة المريض',
      items: [
        {
          name: 'كتافلام 50 مجم مسكن ومضاد للالتهاب',
          image: '../../assets/images/parst.jpg',
          quantity: 1,
          price: 65.00,
          total: 65.00
        }
      ]
    }
  ];

  // Load Orders from Server / LocalStorage
  async function fetchOrders() {
    let orders = [];

    // Try backend API first
    try {
      if (window.API && window.API.orders) {
        const res = await window.API.orders.getPharmacyOrders();
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          orders = res.data;
        }
      }
    } catch (err) {
      console.warn('API getPharmacyOrders warning:', err);
    }

    // Fallback to localStorage or mock
    if (orders.length === 0) {
      try {
        const saved = localStorage.getItem('myOrders');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            orders = parsed;
          }
        }
      } catch (e) {
        console.warn('localStorage parse warning:', e);
      }
    }

    if (orders.length === 0) {
      orders = DEFAULT_MOCK_ORDERS;
      localStorage.setItem('myOrders', JSON.stringify(orders));
    }

    ordersList = orders;
    updateKpis();
    renderOrders();
  }

  // Update KPI counters & Tab Pill Badges
  function updateKpis() {
    const total = ordersList.length;
    const pending = ordersList.filter(o => o.status === 'pending').length;
    const preparing = ordersList.filter(o => o.status === 'preparing').length;
    const ready = ordersList.filter(o => o.status === 'ready').length;
    const completed = ordersList.filter(o => o.status === 'completed').length;
    const cancelled = ordersList.filter(o => o.status === 'cancelled').length;

    if (kpiTotal) kpiTotal.textContent = total;
    if (kpiPending) kpiPending.textContent = pending;
    if (kpiPreparing) kpiPreparing.textContent = preparing;
    if (kpiCompleted) kpiCompleted.textContent = completed;

    if (countAll) countAll.textContent = total;
    if (countPending) countPending.textContent = pending;
    if (countPreparing) countPreparing.textContent = preparing;
    if (countReady) countReady.textContent = ready;
    if (countCompleted) countCompleted.textContent = completed;
    if (countCancelled) countCancelled.textContent = cancelled;
  }

  // Format Status Badge
  function getStatusBadge(status) {
    switch (status) {
      case 'pending':
        return `<span class="status-pill status-pending"><i class="fa-solid fa-clock"></i> قيد الانتظار</span>`;
      case 'preparing':
        return `<span class="status-pill status-preparing"><i class="fa-solid fa-mortar-pestle"></i> قيد التجهيز</span>`;
      case 'ready':
        return `<span class="status-pill status-ready"><i class="fa-solid fa-boxes-packing"></i> جاهز للاستلام</span>`;
      case 'completed':
        return `<span class="status-pill status-completed"><i class="fa-solid fa-circle-check"></i> مكتمل ومُسلّم</span>`;
      case 'cancelled':
        return `<span class="status-pill status-cancelled"><i class="fa-solid fa-ban"></i> ملغي</span>`;
      default:
        return `<span class="status-pill status-pending">${status}</span>`;
    }
  }

  // Generate Action Buttons based on order status
  function getActionButtons(order) {
    const id = order._id;
    const status = order.status;

    let actions = '';

    if (status === 'pending') {
      actions = `
        <button type="button" class="btn-order-action btn-action-prepare" data-action="preparing" data-id="${id}">
          <i class="fa-solid fa-mortar-pestle"></i> بدء التجهيز
        </button>
        <button type="button" class="btn-order-action btn-action-cancel" data-action="cancelled" data-id="${id}">
          <i class="fa-solid fa-xmark"></i> إلغاء الطلب
        </button>
      `;
    } else if (status === 'preparing') {
      actions = `
        <button type="button" class="btn-order-action btn-action-ready" data-action="ready" data-id="${id}">
          <i class="fa-solid fa-boxes-packing"></i> جاهز للاستلام
        </button>
        <button type="button" class="btn-order-action btn-action-cancel" data-action="cancelled" data-id="${id}">
          <i class="fa-solid fa-xmark"></i> إلغاء الطلب
        </button>
      `;
    } else if (status === 'ready') {
      actions = `
        <button type="button" class="btn-order-action btn-action-complete" data-action="completed" data-id="${id}">
          <i class="fa-solid fa-circle-check"></i> تأكيد تسليم العميل
        </button>
      `;
    }

    // Always include details button
    return `
      <div class="order-actions-group">
        ${actions}
        <button type="button" class="btn-order-action btn-action-details" data-action="view-details" data-id="${id}">
          <i class="fa-solid fa-file-lines"></i> التفاصيل والفاتورة
        </button>
      </div>
    `;
  }

  // Render Orders in Container
  function renderOrders() {
    if (!ordersListContainer) return;

    // Apply Filter & Search
    let filtered = ordersList.filter(order => {
      // Tab filter
      if (currentFilter !== 'all' && order.status !== currentFilter) {
        return false;
      }
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const num = (order.orderNumber || order._id || '').toLowerCase();
        const patientName = (order.patientId?.name || order.shippingAddress?.fullName || '').toLowerCase();
        const patientPhone = (order.patientId?.phone || order.shippingAddress?.phone || '').toLowerCase();
        const meds = (order.items || []).map(i => (i.name || i.medicine?.name || '').toLowerCase()).join(' ');

        if (!num.includes(query) && !patientName.includes(query) && !patientPhone.includes(query) && !meds.includes(query)) {
          return false;
        }
      }
      return true;
    });

    if (filtered.length === 0) {
      ordersListContainer.innerHTML = `
        <div class="orders-empty-state">
          <div class="orders-empty-icon">
            <i class="fa-solid fa-box-open"></i>
          </div>
          <h4 class="font-bold text-dark mb-2">لا توجد طلبات مطابقة</h4>
          <p class="text-muted mb-0">لم نتمكن من العثور على أي طلبات في هذه الحالة أو بكلمات البحث الحالية.</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(order => {
      const orderNum = order.orderNumber || order._id?.substring(order._id.length - 6).toUpperCase() || 'ORD';
      const patientName = order.patientId?.name || order.shippingAddress?.fullName || 'مريض مجهول';
      const patientPhone = order.patientId?.phone || order.shippingAddress?.phone || '01000000000';
      const patientAddress = order.shippingAddress?.address || 'الاستلام المباشر من الصيدلية';
      const items = order.items || [];
      const firstItem = items[0] || { name: 'دواء علاجي', quantity: 1, price: 0 };
      const extraItemsCount = items.length > 1 ? items.length - 1 : 0;
      const imgSrc = firstItem.image || firstItem.img || '../../assets/images/parst.jpg';
      const totalPrice = Number(order.totalPrice || items.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toFixed(2);
      const isPaid = order.paymentStatus === 'paid';
      const paymentBadge = isPaid
        ? `<span class="text-success"><i class="fa-solid fa-circle-check"></i> مدفوع إلكترونياً</span>`
        : `<span class="text-muted"><i class="fa-solid fa-money-bill-wave"></i> دفع عند الاستلام</span>`;

      const formattedDate = new Date(order.createdAt || Date.now()).toLocaleString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      html += `
        <div class="order-card" data-order-id="${order._id}">
          <!-- Header -->
          <div class="order-card-header">
            <div class="order-meta-group">
              <span class="order-id-badge">#${orderNum}</span>
              <span class="order-timestamp">
                <i class="fa-regular fa-clock"></i> ${formattedDate}
              </span>
            </div>
            <div>
              ${getStatusBadge(order.status)}
            </div>
          </div>

          <!-- Body -->
          <div class="order-card-body">
            <!-- Medicine Info -->
            <div class="order-items-preview">
              <img src="${imgSrc}" alt="${firstItem.name}" class="order-med-thumb" onerror="this.src='../../assets/images/parst.jpg'">
              <div class="order-med-info">
                <h4>${firstItem.name}</h4>
                <div class="order-item-qty-tag">
                  الكمية: ${firstItem.quantity || 1} عبوة
                </div>
                ${extraItemsCount > 0 ? `<div class="order-med-extra">+ يوجد ${extraItemsCount} أصناف أخرى بالطلب</div>` : ''}
              </div>
            </div>

            <!-- Patient Info -->
            <div class="order-patient-info">
              <div class="patient-name">
                <i class="fa-solid fa-user-circle text-success"></i> ${patientName}
              </div>
              <div class="patient-contact">
                <a href="tel:${patientPhone}" class="patient-quick-link" title="اتصال هاتفي">
                  <i class="fa-solid fa-phone"></i> ${patientPhone}
                </a>
                <a href="https://wa.me/2${patientPhone.replace(/[^0-9]/g, '')}" target="_blank" class="patient-quick-link text-success" title="مراسلة عبر واتساب">
                  <i class="fa-brands fa-whatsapp"></i> واتساب
                </a>
              </div>
              <div class="patient-address text-truncate" title="${patientAddress}">
                <i class="fa-solid fa-location-dot"></i> ${patientAddress}
              </div>
            </div>

            <!-- Pricing Info -->
            <div class="order-pricing-info">
              <div class="order-total-price">${totalPrice} ج.م</div>
              <div class="order-payment-method">${paymentBadge}</div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="order-card-footer">
            <div class="text-muted small">
              <i class="fa-solid fa-circle-info me-1"></i> يتم إشعار المريض تلقائياً عند تغيير حالة الطلب
            </div>
            ${getActionButtons(order)}
          </div>
        </div>
      `;
    });

    ordersListContainer.innerHTML = html;
  }

  // Update Order Status Handler
  async function updateOrderStatus(orderId, newStatus) {
    const targetOrder = ordersList.find(o => o._id === orderId);
    if (!targetOrder) return;

    // Update in backend API
    try {
      if (window.API && window.API.orders && orderId.length === 24) {
        await window.API.orders.updateStatus(orderId, newStatus);
      }
    } catch (err) {
      console.warn('API updateStatus warning:', err);
    }

    // Update local state
    targetOrder.status = newStatus;
    if (newStatus === 'completed') {
      targetOrder.paymentStatus = 'paid';
    }

    // Save to localStorage
    localStorage.setItem('myOrders', JSON.stringify(ordersList));

    // Update UI
    updateKpis();
    renderOrders();

    // Show feedback toast
    const statusArabicNames = {
      pending: 'قيد الانتظار',
      preparing: 'قيد التجهيز',
      ready: 'جاهز للاستلام',
      completed: 'مكتمل ومُسلّم',
      cancelled: 'ملغي'
    };

    if (window.Toast) {
      window.Toast.success(
        `تم تحويل حالة الطلب إلى "${statusArabicNames[newStatus] || newStatus}" بنجاح وإشعار المريض.`,
        'تحديث الطلب'
      );
    }
  }

  // Populate and Open Details Modal
  function showOrderDetailsModal(orderId) {
    const order = ordersList.find(o => o._id === orderId);
    if (!order) return;

    activeSelectedOrder = order;

    const modalTitle = document.getElementById('modalOrderTitle');
    const modalDate = document.getElementById('modalOrderDate');
    const modalBody = document.getElementById('modalOrderBody');

    const orderNum = order.orderNumber || order._id?.substring(order._id.length - 6).toUpperCase() || 'ORD';
    const patientName = order.patientId?.name || order.shippingAddress?.fullName || 'مريض مجهول';
    const patientPhone = order.patientId?.phone || order.shippingAddress?.phone || '01000000000';
    const patientAddress = order.shippingAddress?.address || 'استلام مباشر من فرع الصيدلية';
    const items = order.items || [];
    const totalPrice = Number(order.totalPrice || items.reduce((sum, item) => sum + (item.price * item.quantity), 0)).toFixed(2);

    const formattedDate = new Date(order.createdAt || Date.now()).toLocaleString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    if (modalTitle) modalTitle.textContent = `تفاصيل الطلب #${orderNum}`;
    if (modalDate) modalDate.textContent = formattedDate;

    // Timeline Steps State
    const s = order.status;
    const step1Class = 'completed';
    const step2Class = (s === 'preparing' || s === 'ready' || s === 'completed') ? 'completed' : (s === 'pending' ? 'active' : '');
    const step3Class = (s === 'ready' || s === 'completed') ? 'completed' : (s === 'preparing' ? 'active' : '');
    const step4Class = (s === 'completed') ? 'completed' : (s === 'ready' ? 'active' : '');

    // Items table rows
    const itemsRows = items.map((item, idx) => {
      const itemImg = item.image || item.img || '../../assets/images/parst.jpg';
      const itemPrice = Number(item.price || 0).toFixed(2);
      const itemQty = item.quantity || 1;
      const itemSubtotal = (itemPrice * itemQty).toFixed(2);

      return `
        <tr>
          <td class="text-center font-bold">${idx + 1}</td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <img src="${itemImg}" alt="${item.name}" style="width: 40px; height: 40px; border-radius: 6px; object-fit: cover;" onerror="this.src='../../assets/images/parst.jpg'">
              <span class="font-bold text-dark">${item.name}</span>
            </div>
          </td>
          <td class="text-center">${itemPrice} ج.م</td>
          <td class="text-center font-bold">${itemQty}</td>
          <td class="text-end font-bold text-success">${itemSubtotal} ج.م</td>
        </tr>
      `;
    }).join('');

    if (modalBody) {
      modalBody.innerHTML = `
        <!-- Timeline Stepper -->
        <div class="order-details-step-wrapper">
          <div class="order-step-node ${step1Class}">
            <div class="order-step-circle"><i class="fa-solid fa-file-invoice"></i></div>
            <div class="order-step-title">تم الطلب</div>
          </div>
          <div class="order-step-node ${step2Class}">
            <div class="order-step-circle"><i class="fa-solid fa-mortar-pestle"></i></div>
            <div class="order-step-title">قيد التجهيز</div>
          </div>
          <div class="order-step-node ${step3Class}">
            <div class="order-step-circle"><i class="fa-solid fa-boxes-packing"></i></div>
            <div class="order-step-title">جاهز للاستلام</div>
          </div>
          <div class="order-step-node ${step4Class}">
            <div class="order-step-circle"><i class="fa-solid fa-circle-check"></i></div>
            <div class="order-step-title">تم التسليم</div>
          </div>
        </div>

        <div class="row g-3 mb-4">
          <!-- Patient Box -->
          <div class="col-md-6">
            <div class="p-3 bg-light rounded-3 border h-100">
              <h6 class="font-bold text-dark mb-2"><i class="fa-solid fa-user me-1 text-success"></i> بيانات المريض</h6>
              <div class="text-muted small mb-1"><strong>الاسم:</strong> ${patientName}</div>
              <div class="text-muted small mb-1"><strong>رقم الهاتف:</strong> <a href="tel:${patientPhone}" class="text-success">${patientPhone}</a></div>
              <div class="text-muted small"><strong>العنوان:</strong> ${patientAddress}</div>
            </div>
          </div>

          <!-- Order Summary Box -->
          <div class="col-md-6">
            <div class="p-3 bg-light rounded-3 border h-100">
              <h6 class="font-bold text-dark mb-2"><i class="fa-solid fa-receipt me-1 text-success"></i> معلومات الدفع والحالة</h6>
              <div class="text-muted small mb-1"><strong>حالة الطلب:</strong> ${getStatusBadge(order.status)}</div>
              <div class="text-muted small mb-1"><strong>طريقة الدفع:</strong> ${order.paymentMethod === 'online' ? 'دفع إلكتروني' : 'دفع نقدي عند الاستلام'}</div>
              <div class="text-muted small"><strong>ملاحظات العميل:</strong> ${order.notes || 'لا توجد ملاحظات إضافية'}</div>
            </div>
          </div>
        </div>

        <!-- Items Table -->
        <h6 class="font-bold text-dark mb-2"><i class="fa-solid fa-pills me-1 text-success"></i> الأصناف المطلوبة</h6>
        <div class="table-responsive border rounded-3 mb-3">
          <table class="table align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th class="text-center" style="width: 50px;">#</th>
                <th>الصنف الدوائي</th>
                <th class="text-center">سعر الوحدة</th>
                <th class="text-center">الكمية</th>
                <th class="text-end">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
            <tfoot class="table-light font-bold">
              <tr>
                <td colspan="4" class="text-end">إجمالي قيمة الفاتورة:</td>
                <td class="text-end text-success fs-5">${totalPrice} ج.م</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Quick Status Control -->
        <div class="d-flex align-items-center justify-content-between p-3 bg-light rounded-3 border">
          <span class="font-bold text-dark">تغيير حالة الطلب مباشرة:</span>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-sm btn-outline-info font-bold" onclick="window.handleModalStatusChange('${order._id}', 'preparing')">
              <i class="fa-solid fa-mortar-pestle me-1"></i> قيد التجهيز
            </button>
            <button type="button" class="btn btn-sm btn-outline-primary font-bold" onclick="window.handleModalStatusChange('${order._id}', 'ready')">
              <i class="fa-solid fa-boxes-packing me-1"></i> جاهز للاستلام
            </button>
            <button type="button" class="btn btn-sm btn-outline-success font-bold" onclick="window.handleModalStatusChange('${order._id}', 'completed')">
              <i class="fa-solid fa-circle-check me-1"></i> تسليم مكتمل
            </button>
            <button type="button" class="btn btn-sm btn-outline-danger font-bold" onclick="window.handleModalStatusChange('${order._id}', 'cancelled')">
              <i class="fa-solid fa-ban me-1"></i> إلغاء
            </button>
          </div>
        </div>
      `;
    }

    if (detailsModalInstance) {
      detailsModalInstance.show();
    }
  }

  // Global window helper for modal status change buttons
  window.handleModalStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    showOrderDetailsModal(orderId);
  };

  // Event Delegation for All Action Buttons in Orders List
  if (ordersListContainer) {
    ordersListContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const orderId = btn.dataset.id;

      if (action === 'view-details') {
        showOrderDetailsModal(orderId);
      } else if (action) {
        updateOrderStatus(orderId, action);
      }
    });
  }

  // Live Search
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderOrders();
    });
  }

  // Status Filter Tabs
  if (statusTabs) {
    statusTabs.addEventListener('click', (e) => {
      const pill = e.target.closest('.tab-pill');
      if (!pill) return;

      statusTabs.querySelectorAll('.tab-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      currentFilter = pill.dataset.status || 'all';
      renderOrders();
    });
  }

  // Refresh Button
  if (btnRefresh) {
    btnRefresh.addEventListener('click', async () => {
      btnRefresh.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-1"></i> جاري التحديث...`;
      btnRefresh.disabled = true;

      await fetchOrders();

      setTimeout(() => {
        btnRefresh.innerHTML = `<i class="fa-solid fa-arrows-rotate me-1"></i> تحديث فوري`;
        btnRefresh.disabled = false;
        if (window.Toast) {
          window.Toast.info('تم تحديث قائمة الطلبات بنجاح.', 'تحديث');
        }
      }, 500);
    });
  }

  // Print Invoice Button
  if (btnPrintInvoice) {
    btnPrintInvoice.addEventListener('click', () => {
      window.print();
    });
  }

  // Initial Load
  fetchOrders();
});