/**
 * Teryak Platform - Centralized API Client Layer
 */
(function() {
  const getBaseUrl = () => {
    return (window.CONFIG && window.CONFIG.API_BASE_URL) || '/api';
  };

  const getToken = () => {
    return localStorage.getItem('token') || '';
  };

  const request = async (endpoint, options = {}) => {
    const url = `${getBaseUrl()}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const config = {
        ...options,
        headers,
      };

      if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
        config.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'حدث خطأ أثناء معالجة الطلب');
      }

      return data;
    } catch (error) {
      console.error(`[API Error] ${endpoint}:`, error.message);
      throw error;
    }
  };

  const API = {
    request,

    get: (endpoint, params = {}) => {
      const query = new URLSearchParams(params).toString();
      const url = query ? `${endpoint}?${query}` : endpoint;
      return request(url, { method: 'GET' });
    },

    post: (endpoint, body) => {
      return request(endpoint, { method: 'POST', body });
    },

    put: (endpoint, body) => {
      return request(endpoint, { method: 'PUT', body });
    },

    delete: (endpoint) => {
      return request(endpoint, { method: 'DELETE' });
    },

    // 1. Authentication Services
    auth: {
      register: (userData) => API.post('/auth/register', userData),
      login: (credentials) => API.post('/auth/login', credentials),
      getMe: () => API.get('/auth/me'),
      updateProfile: (data) => API.put('/auth/profile', data),
      changePassword: (data) => API.put('/auth/change-password', data),
    },

    // 2. Medicines Catalog Services
    medicines: {
      getAll: (params) => API.get('/medicines', params),
      getById: (id) => API.get(`/medicines/${id}`),
      getAlternatives: (id) => API.get(`/medicines/${id}/alternatives`),
      create: (data) => API.post('/medicines', data),
      bulkImport: (medicines) => API.post('/medicines/bulk-import', { medicines }),
      update: (id, data) => API.put(`/medicines/${id}`, data),
      delete: (id) => API.delete(`/medicines/${id}`),
    },

    // 3. Pharmacies Services
    pharmacies: {
      getAll: (params) => API.get('/pharmacies', params),
      getById: (id) => API.get(`/pharmacies/${id}`),
      getMyPharmacy: () => API.get('/pharmacies/my-pharmacy'),
      updateMyPharmacy: (data) => API.put('/pharmacies/my-pharmacy', data),
    },

    // 4. Pharmacist Inventory Services
    inventory: {
      getAll: (params) => API.get('/inventory', params),
      add: (data) => API.post('/inventory', data),
      bulkImport: (items) => API.post('/inventory/bulk-import', { items }),
      update: (id, data) => API.put(`/inventory/${id}`, data),
      delete: (id) => API.delete(`/inventory/${id}`),
      getLowStock: () => API.get('/inventory/low-stock'),
    },

    // 5. Orders Services
    orders: {
      create: (data) => API.post('/orders', data),
      getMyOrders: () => API.get('/orders/my-orders'),
      getPharmacyOrders: (status) => API.get('/orders/pharmacy', { status }),
      getById: (id) => API.get(`/orders/${id}`),
      updateStatus: (id, status) => API.put(`/orders/${id}/status`, { status }),
      cancel: (id) => API.put(`/orders/${id}/cancel`),
    },

    // 6. Donations & Exchanges Services
    donations: {
      getAll: (params) => API.get('/donations', params),
      getMyDonations: () => API.get('/donations/my-donations'),
      create: (data) => API.post('/donations', data),
      updateStatus: (id, status) => API.put(`/donations/${id}/status`, { status }),
    },

    // 7. Admin Services
    admin: {
      getDashboardStats: () => API.get('/admin/dashboard-stats'),
      getUsers: (params) => API.get('/admin/users', params),
      updateUserStatus: (id, data) => API.put(`/admin/users/${id}/status`, data),
      getPendingPharmacies: () => API.get('/admin/pharmacies/pending'),
      approvePharmacy: (id, isApproved = true) => API.put(`/admin/pharmacies/${id}/approve`, { isApproved }),
      getReports: () => API.get('/admin/reports'),
    },

    // 8. Notifications
    notifications: {
      getAll: () => API.get('/notifications'),
      markAsRead: (id) => API.put(`/notifications/${id}/read`),
      markAllAsRead: () => API.put('/notifications/read-all'),
    },
  };

  window.API = API;
})();
