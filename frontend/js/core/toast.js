/**
 * Teryak Platform - Luxury Side-Sliding Toast & Confirmation Dialog Engine
 * Exposes window.Toast with:
 * - Toast.success(message, title, duration, action)
 * - Toast.error(message, title, duration, action)
 * - Toast.warning(message, title, duration, action)
 * - Toast.info(message, title, duration, action)
 * - Toast.confirm({ title, message, type, confirmText, cancelText }) -> Promise<boolean>
 */

(function () {
  'use strict';

  // Ensure Toast container exists in DOM
  function getOrCreateContainer() {
    let container = document.querySelector('.teryak-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'teryak-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  // FontAwesome Icons mapping
  const ICONS = {
    success: '<i class="fa-solid fa-circle-check"></i>',
    error: '<i class="fa-solid fa-circle-xmark"></i>',
    warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
    info: '<i class="fa-solid fa-circle-info"></i>',
  };

  const DEFAULT_TITLES = {
    success: 'تم بنجاح',
    error: 'حدث خطأ',
    warning: 'تنبيه هام',
    info: 'معلومة',
  };

  /**
   * Main Toast Show Method
   */
  function show({
    type = 'info',
    title = '',
    message = '',
    duration = 4500,
    action = null, // { text: '...', onClick: () => {} }
  } = {}) {
    // If DOM is not loaded yet, wait
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', () => {
        show({ type, title, message, duration, action });
      });
      return;
    }

    const container = getOrCreateContainer();
    const finalTitle = title || DEFAULT_TITLES[type] || 'تنبيه';
    const iconHtml = ICONS[type] || ICONS.info;

    const toast = document.createElement('div');
    toast.className = `teryak-toast teryak-toast-${type}`;

    let actionBtnHtml = '';
    if (action && action.text) {
      actionBtnHtml = `<button type="button" class="teryak-toast-action">${action.text}</button>`;
    }

    toast.innerHTML = `
      <div class="teryak-toast-icon">${iconHtml}</div>
      <div class="teryak-toast-body">
        <div class="teryak-toast-title">${finalTitle}</div>
        <div class="teryak-toast-message">${message}</div>
        ${actionBtnHtml}
      </div>
      <button type="button" class="teryak-toast-close" aria-label="إغلاق"><i class="fa-solid fa-xmark"></i></button>
      <div class="teryak-toast-progress">
        <div class="teryak-toast-progress-bar"></div>
      </div>
    `;

    container.appendChild(toast);

    // Bind action button if provided
    if (action && action.onClick) {
      const btn = toast.querySelector('.teryak-toast-action');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          action.onClick();
          dismiss(toast);
        });
      }
    }

    // Trigger Slide-In
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    // Handle Progress Bar Animation
    const progressBar = toast.querySelector('.teryak-toast-progress-bar');
    if (progressBar && duration > 0) {
      progressBar.style.transitionDuration = `${duration}ms`;
      requestAnimationFrame(() => {
        progressBar.style.transform = 'scaleX(0)';
      });
    }

    // Auto Dismiss Timeout
    let dismissTimeout;
    if (duration > 0) {
      dismissTimeout = setTimeout(() => {
        dismiss(toast);
      }, duration);
    }

    // Close button click
    const closeBtn = toast.querySelector('.teryak-toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        if (dismissTimeout) clearTimeout(dismissTimeout);
        dismiss(toast);
      });
    }

    return toast;
  }

  function dismiss(toast) {
    if (!toast || toast.classList.contains('hide')) return;
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 380);
  }

  /**
   * Custom Confirmation Dialog (Replaces window.confirm)
   */
  function confirm({
    title = 'تأكيد الإجراء',
    message = 'هل أنت متأكد من رغبتك في إتمام هذا الإجراء؟',
    type = 'danger', // 'danger' | 'warning' | 'info'
    confirmText = 'تأكيد',
    cancelText = 'إلغاء',
  } = {}) {
    return new Promise((resolve) => {
      let overlay = document.querySelector('.teryak-modal-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'teryak-modal-overlay';
        document.body.appendChild(overlay);
      }

      const icon = type === 'danger'
        ? '<i class="fa-solid fa-trash-can"></i>'
        : type === 'warning'
        ? '<i class="fa-solid fa-triangle-exclamation"></i>'
        : '<i class="fa-solid fa-circle-question"></i>';

      const btnClass = type === 'danger' ? 'btn-confirm-danger' : 'btn-confirm-primary';

      overlay.innerHTML = `
        <div class="teryak-modal-box">
          <div class="teryak-modal-icon-wrap ${type}">${icon}</div>
          <h3 class="teryak-modal-title">${title}</h3>
          <p class="teryak-modal-desc">${message}</p>
          <div class="teryak-modal-buttons">
            <button type="button" class="teryak-modal-btn ${btnClass}" id="teryakModalConfirmBtn">${confirmText}</button>
            <button type="button" class="teryak-modal-btn btn-cancel" id="teryakModalCancelBtn">${cancelText}</button>
          </div>
        </div>
      `;

      requestAnimationFrame(() => {
        overlay.classList.add('active');
      });

      const cleanup = (result) => {
        overlay.classList.remove('active');
        setTimeout(() => {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 260);
        resolve(result);
      };

      overlay.querySelector('#teryakModalConfirmBtn').onclick = () => cleanup(true);
      overlay.querySelector('#teryakModalCancelBtn').onclick = () => cleanup(false);
      overlay.onclick = (e) => {
        if (e.target === overlay) cleanup(false);
      };
    });
  }

  // Toast API Object
  window.Toast = {
    show,
    success: (message, title, duration, action) => show({ type: 'success', title, message, duration, action }),
    error: (message, title, duration, action) => show({ type: 'error', title, message, duration, action }),
    warning: (message, title, duration, action) => show({ type: 'warning', title, message, duration, action }),
    info: (message, title, duration, action) => show({ type: 'info', title, message, duration, action }),
    confirm,
  };

  // Safe Polyfill for window.alert to prevent native browser popups
  window.alert = function (message) {
    if (typeof message === 'string') {
      if (message.includes('بنجاح') || message.includes('تم ')) {
        window.Toast.success(message);
        return;
      }
      if (message.includes('خطأ') || message.includes('فشل') || message.includes('غير صحيح') || message.includes('مطلوب')) {
        window.Toast.error(message);
        return;
      }
      if (message.includes('تنبيه') || message.includes('يرجى') || message.includes('من فضلك') || message.includes('يجب')) {
        window.Toast.warning(message);
        return;
      }
    }
    window.Toast.info(message);
  };
})();
