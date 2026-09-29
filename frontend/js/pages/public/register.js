/**
 * Teryak Platform - Registration Logic (Connected to API)
 * Integrated with Real-Time Validation & Side-Sliding Toast Notifications
 */

document.addEventListener('DOMContentLoaded', () => {
  const pharmacistFields = document.querySelectorAll(".pharmacist-field");
  const tabs = document.querySelectorAll(".tab");
  let selectedUserType = "مريض";

  // Toggle Pharmacist vs Patient fields
  function toggleFields(type) {
    const pharmacyName = document.getElementById("pharmacyName");
    const licenseNumber = document.getElementById("licenseNumber");

    pharmacistFields.forEach(field => {
      field.style.display = type === "صيدلي" ? "block" : "none";
    });
    if (type === "صيدلي") {
      if (pharmacyName) pharmacyName.required = true;
      if (licenseNumber) licenseNumber.required = true;
    } else {
      if (pharmacyName) {
        pharmacyName.required = false;
        pharmacyName.value = "";
        if (window.TeryakValidator) window.TeryakValidator.clearError(pharmacyName);
      }
      if (licenseNumber) {
        licenseNumber.required = false;
        licenseNumber.value = "";
        if (window.TeryakValidator) window.TeryakValidator.clearError(licenseNumber);
      }
    }
  }

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      selectedUserType = tab.textContent.trim();
      localStorage.setItem("userType", selectedUserType);
      toggleFields(selectedUserType);
    });
  });

  toggleFields("مريض");

  // Floating labels value sync & change events
  const allFloatingInputs = document.querySelectorAll(".floating-input");
  allFloatingInputs.forEach(input => {
    const updateHasValue = () => {
      if (input.value && input.value.trim().length > 0) {
        input.classList.add("has-value");
      } else {
        input.classList.remove("has-value");
      }
    };
    input.addEventListener("input", updateHasValue);
    input.addEventListener("change", updateHasValue);
    input.addEventListener("blur", updateHasValue);
    updateHasValue();
  });

  // Eye Password Toggle (Robust Delegation)
  document.addEventListener("click", (e) => {
    const eyeBtn = e.target.closest(".eye-btn, .eye");
    if (!eyeBtn) return;
    e.preventDefault();
    e.stopPropagation();

    const box = eyeBtn.closest(".password-box, .input-box");
    if (!box) return;
    const input = box.querySelector("input");
    const icon = eyeBtn.querySelector("i") || (eyeBtn.tagName === "I" ? eyeBtn : null);
    if (!input) return;

    if (input.type === "password") {
      input.type = "text";
      if (icon) {
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      }
    } else {
      input.type = "password";
      if (icon) {
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    }
  });

  // Real-time input validation handlers
  const fullNameInput = document.getElementById("fullName");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const pharmacyNameInput = document.getElementById("pharmacyName");
  const licenseNumberInput = document.getElementById("licenseNumber");
  const termsCheckbox = document.getElementById("terms") || document.querySelector('input[type="checkbox"]');

  if (fullNameInput && window.TeryakValidator) {
    fullNameInput.addEventListener("blur", () => {
      if (!fullNameInput.value || fullNameInput.value.trim().length < 3) {
        window.TeryakValidator.setError(fullNameInput, 'الاسم يجب أن يحتوي على 3 أحرف على الأقل');
      } else {
        window.TeryakValidator.setValid(fullNameInput);
      }
    });
  }

  if (phoneInput && window.TeryakValidator) {
    phoneInput.addEventListener("input", () => {
      const res = window.TeryakValidator.rules.phone(phoneInput.value);
      if (res !== true) {
        window.TeryakValidator.setError(phoneInput, res);
      } else {
        window.TeryakValidator.setValid(phoneInput);
      }
    });
  }

  if (emailInput && window.TeryakValidator) {
    emailInput.addEventListener("blur", () => {
      const res = window.TeryakValidator.rules.email(emailInput.value);
      if (res !== true) {
        window.TeryakValidator.setError(emailInput, res);
      } else {
        window.TeryakValidator.setValid(emailInput);
      }
    });
  }

  if (confirmPasswordInput && passwordInput && window.TeryakValidator) {
    confirmPasswordInput.addEventListener("input", () => {
      if (confirmPasswordInput.value !== passwordInput.value) {
        window.TeryakValidator.setError(confirmPasswordInput, 'كلمتا المرور غير متطابقتين');
      } else {
        window.TeryakValidator.setValid(confirmPasswordInput);
      }
    });
  }

  const registerForm = document.querySelector("#registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullName = fullNameInput ? fullNameInput.value.trim() : '';
      const pharmacyName = pharmacyNameInput ? pharmacyNameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const licenseNumber = licenseNumberInput ? licenseNumberInput.value.trim() : '';
      const password = passwordInput ? passwordInput.value : '';
      const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
      const terms = termsCheckbox ? termsCheckbox.checked : true;

      // Validate Full Name
      if (!fullName || fullName.length < 3) {
        if (window.TeryakValidator && fullNameInput) window.TeryakValidator.setError(fullNameInput, 'يرجى إدخال اسمك بالكامل (3 أحرف على الأقل)');
        if (window.Toast) window.Toast.warning('يرجى كتابة الاسم بالكامل بشكل صحيح', 'الاسم مطلوب');
        fullNameInput?.focus();
        return;
      }

      // Validate Email
      if (!email || (window.TeryakValidator && window.TeryakValidator.rules.email(email) !== true)) {
        if (window.TeryakValidator) window.TeryakValidator.setError(emailInput, 'يرجى إدخال بريد إلكتروني صحيح');
        if (window.Toast) window.Toast.warning('يرجى إدخال بريد إلكتروني صالح ومكتمل', 'تنبيه التحقق');
        emailInput?.focus();
        return;
      }

      // Validate Phone
      if (!phone || (window.TeryakValidator && window.TeryakValidator.rules.phone(phone) !== true)) {
        if (window.TeryakValidator) window.TeryakValidator.setError(phoneInput, 'يرجى إدخال رقم هاتف مصري صحيح (11 رقماً يبدأ بـ 01)');
        if (window.Toast) window.Toast.warning('يرجى كتابة رقم هاتف مصري صحيح يبدأ بـ 01', 'رقم الهاتف');
        phoneInput?.focus();
        return;
      }

      // Validate Pharmacist fields if selected
      if (selectedUserType === "صيدلي") {
        if (!pharmacyName) {
          if (window.TeryakValidator) window.TeryakValidator.setError(pharmacyNameInput, 'اسم الصيدلية مطلوب');
          if (window.Toast) window.Toast.warning('يرجى كتابة اسم الصيدلية التجاري', 'بيانات الصيدلية');
          pharmacyNameInput?.focus();
          return;
        }
        if (!licenseNumber) {
          if (window.TeryakValidator) window.TeryakValidator.setError(licenseNumberInput, 'رقم ترخيص الصيدلية مطلوب');
          if (window.Toast) window.Toast.warning('يرجى إدخال رقم ترخيص مزاولة المهنة / المنشأة', 'ترخيص الصيدلية');
          licenseNumberInput?.focus();
          return;
        }
      }

      // Validate Password
      if (!password || password.length < 6) {
        if (window.TeryakValidator) window.TeryakValidator.setError(passwordInput, 'كلمة المرور يجب أن تتكون من 6 خانات على الأقل');
        if (window.Toast) window.Toast.warning('كلمة المرور قصيرة جداً (الحد الأدنى 6 أحرف/أرقام)', 'كلمة المرور');
        passwordInput?.focus();
        return;
      }

      // Validate Confirm Password
      if (password !== confirmPassword) {
        if (window.TeryakValidator) window.TeryakValidator.setError(confirmPasswordInput, 'كلمتا المرور غير متطابقتين');
        if (window.Toast) window.Toast.error('تأكيد كلمة المرور لا يطابق كلمة المرور التي أدخلتها', 'عدم تطابق');
        confirmPasswordInput?.focus();
        return;
      }

      // Validate Terms
      if (!terms) {
        if (window.Toast) window.Toast.warning('يجب الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة', 'الشروط والأحكام');
        return;
      }

      const submitBtn = registerForm.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'إنشاء حساب';
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> جاري إنشاء الحساب...';
        submitBtn.disabled = true;
      }

      const userData = {
        name: fullName,
        email,
        phone,
        password,
        role: selectedUserType === 'صيدلي' ? 'pharmacist' : 'patient',
        pharmacyName: selectedUserType === 'صيدلي' ? pharmacyName : '',
        licenseNumber: selectedUserType === 'صيدلي' ? licenseNumber : '',
      };

      try {
        if (window.API && window.API.auth) {
          const response = await window.API.auth.register(userData);
          const { user, token } = response.data;
          if (window.Auth) window.Auth.login({ user, token });

          if (window.Toast) {
            window.Toast.success(
              `أهلاً بك يا ${user.name || fullName} في منصة ترياق الطبية!`,
              'تم إنشاء الحساب بنجاح',
              3500
            );
          }

          setTimeout(() => {
            if (user.role === "pharmacist") {
              window.location.href = '../pharmacist/index.html';
            } else {
              window.location.href = '../../index.html';
            }
          }, 1000);
          return;
        }
      } catch (error) {
        console.warn('Backend register failed, trying fallback:', error.message);
        
        // Handle duplicate email message gracefully
        if (error.message && (error.message.includes('مسجل') || error.message.includes('already exists') || error.message.includes('E11000'))) {
          if (window.Toast) {
            window.Toast.error('هذا البريد الإلكتروني مسجل بالفعل، يمكنك تسجيل الدخول مباشرة.', 'حساب موجود مسبقاً');
          }
          return;
        }

        // Offline / fallback storage
        let users = JSON.parse(localStorage.getItem("users")) || [];
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
          if (window.Toast) window.Toast.error("هذا البريد الإلكتروني مسجل بالفعل", "تنبيه");
          return;
        }

        const newUser = {
          id: Date.now(),
          userType: selectedUserType,
          email,
          phone,
          password,
          pharmacyName,
          licenseNumber
        };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        if (window.Auth) window.Auth.login({ user: newUser, token: 'demo-jwt-token' });

        if (window.Toast) window.Toast.success("تم إنشاء الحساب بنجاح! جاري توجيهك...", "مرحباً بك");
        setTimeout(() => {
          if (selectedUserType === "صيدلي") {
            window.location.href = '../pharmacist/index.html';
          } else {
            window.location.href = '../../index.html';
          }
        }, 1000);
      } finally {
        if (submitBtn) {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      }
    });
  }
});