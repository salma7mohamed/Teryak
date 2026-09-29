/**
 * Teryak Platform - Client-Side Form Validation Module
 * Real-time validation for Egyptian Phone Numbers, Email, Password, Required fields, etc.
 */

(function () {
  'use strict';

  const VALIDATORS = {
    // Egyptian phone numbers: 010, 011, 012, 015 followed by 8 digits (11 digits total)
    phone: (value) => {
      const cleaned = (value || '').trim();
      const regex = /^01[0125][0-9]{8}$/;
      if (!regex.test(cleaned)) {
        return 'يرجى إدخال رقم هاتف مصري صحيح يبدأ بـ 01 (11 رقماً)';
      }
      return true;
    },

    // Standard email validation
    email: (value) => {
      const cleaned = (value || '').trim();
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!regex.test(cleaned)) {
        return 'يرجى إدخال بريد إلكتروني صحيح (مثال: name@example.com)';
      }
      return true;
    },

    // Password validation (min 6 characters)
    password: (value) => {
      const val = value || '';
      if (val.length < 6) {
        return 'كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل';
      }
      return true;
    },

    // Required field validation
    required: (value, fieldName = 'هذا الحقل') => {
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        return `${fieldName} مطلوب ولا يمكن تركه فارغاً`;
      }
      return true;
    },

    // Positive numeric check
    positiveNumber: (value, fieldName = 'الرقم') => {
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        return `${fieldName} يجب أن يكون رقماً أكبر من الصفر`;
      }
      return true;
    },

    // Future date check
    futureDate: (value, fieldName = 'تاريخ الصلاحية') => {
      if (!value) return `${fieldName} مطلوب`;
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(date.getTime()) || date <= today) {
        return `${fieldName} يجب أن يكون تاريخاً مستقبلياً`;
      }
      return true;
    },
  };

  /**
   * Set field visual error
   */
  function setError(inputEl, message) {
    if (!inputEl) return;
    inputEl.classList.add('is-invalid');
    inputEl.classList.remove('is-valid');

    const inputBox = inputEl.closest('.input-box');
    if (inputBox) {
      inputBox.classList.add('is-invalid');
      inputBox.classList.remove('is-valid');
    }

    // Remove existing error message
    clearError(inputEl);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'teryak-error-message';
    errorDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;

    const formGroup = inputEl.closest('.form-group') || (inputBox ? inputBox.parentNode : inputEl.parentNode);
    if (inputBox && inputBox.nextSibling) {
      inputBox.parentNode.insertBefore(errorDiv, inputBox.nextSibling);
    } else if (inputBox) {
      inputBox.parentNode.appendChild(errorDiv);
    } else if (inputEl.nextSibling) {
      inputEl.parentNode.insertBefore(errorDiv, inputEl.nextSibling);
    } else {
      formGroup.appendChild(errorDiv);
    }
  }

  /**
   * Clear field error
   */
  function clearError(inputEl) {
    if (!inputEl) return;
    inputEl.classList.remove('is-invalid');

    const inputBox = inputEl.closest('.input-box');
    if (inputBox) {
      inputBox.classList.remove('is-invalid');
    }

    const container = inputEl.closest('.form-group') || (inputBox ? inputBox.parentNode : inputEl.parentNode);
    if (container) {
      const existingMsgs = container.querySelectorAll('.teryak-error-message');
      existingMsgs.forEach(msg => msg.remove());
    }
  }

  /**
   * Mark field as valid
   */
  function setValid(inputEl) {
    if (!inputEl) return;
    clearError(inputEl);
    inputEl.classList.add('is-valid');

    const inputBox = inputEl.closest('.input-box');
    if (inputBox) {
      inputBox.classList.add('is-valid');
      inputBox.classList.remove('is-invalid');
    }
  }

  /**
   * Validate a single input element according to data attributes or rules
   */
  function validateField(inputEl) {
    if (!inputEl) return true;
    const value = inputEl.value;
    const isRequired = inputEl.hasAttribute('required') || inputEl.dataset.validate?.includes('required');
    const type = inputEl.dataset.type || inputEl.type;
    const fieldLabel = inputEl.dataset.label || inputEl.placeholder || 'هذا الحقل';

    if (isRequired) {
      const res = VALIDATORS.required(value, fieldLabel);
      if (res !== true) {
        setError(inputEl, res);
        return false;
      }
    } else if (!value || value.trim() === '') {
      clearError(inputEl);
      inputEl.classList.remove('is-valid');
      return true;
    }

    if (type === 'email' || inputEl.dataset.validate === 'email') {
      const res = VALIDATORS.email(value);
      if (res !== true) {
        setError(inputEl, res);
        return false;
      }
    }

    if (type === 'tel' || inputEl.dataset.validate === 'phone') {
      const res = VALIDATORS.phone(value);
      if (res !== true) {
        setError(inputEl, res);
        return false;
      }
    }

    if (type === 'password' && isRequired) {
      const res = VALIDATORS.password(value);
      if (res !== true) {
        setError(inputEl, res);
        return false;
      }
    }

    setValid(inputEl);
    return true;
  }

  /**
   * Setup real-time validation on a form
   */
  function setupFormValidation(formEl, onSubmit) {
    if (!formEl) return;

    const inputs = formEl.querySelectorAll('input, select, textarea');
    inputs.forEach((input) => {
      input.addEventListener('input', () => {
        if (input.classList.contains('is-invalid')) {
          validateField(input);
        }
      });
      input.addEventListener('blur', () => {
        validateField(input);
      });
    });

    if (onSubmit) {
      formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        let firstInvalidInput = null;

        inputs.forEach((input) => {
          const valid = validateField(input);
          if (!valid) {
            isValid = false;
            if (!firstInvalidInput) firstInvalidInput = input;
          }
        });

        if (!isValid) {
          if (firstInvalidInput) firstInvalidInput.focus();
          if (window.Toast) {
            window.Toast.error('يرجى التأكد من ملء جميع الحقول المطلوبة بشكل صحيح');
          }
          return;
        }

        onSubmit(e);
      });
    }
  }

  window.TeryakValidator = {
    rules: VALIDATORS,
    validateField,
    setError,
    clearError,
    setValid,
    setupFormValidation,
  };
})();
