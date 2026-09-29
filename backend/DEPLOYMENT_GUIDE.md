# 🚀 دليل النشر والتشغيل الشامل لمنصة ترياق (Teryak Deployment & Hosting Guide)

يوضح هذا الدليل كيفية تشغيل منصة ترياق محلياً، ونشر الواجهة الأمامية والخلفية، وحل مشكلة جدار حماية قاعدة البيانات **MongoDB Atlas**.

---

## 💻 1. التشغيل المحلي (Local Development)

### الخطوات:
```bash
# 1. الدخول إلى مجلد الباك إند
cd backend

# 2. تثبيت الحزم البرمجية
npm install

# 3. تعبئة قاعدة البيانات بالبيانات الافتراضية
npm run seed

# 4. تشغيل الخادم في وضع التطوير
npm run dev
```

- 🌐 رابط المنصة الرئيسي (الفرونت إند): `http://localhost:5000`
- 🩺 رابط فحص صحة الـ API: `http://localhost:5000/api/health`

---

## 🛡️ 2. الحسابات التجريبية الافتراضية (بعد `npm run seed`)

| الدور (Role) | البريد الإلكتروني (Email) | كلمة المرور (Password) |
|:---|:---|:---|
| **مدير المنصة (Admin)** | `admin@teryak.com` | `123` |
| **صيدلي (Pharmacist)** | `pharmacist@teryak.com` | `123` |
| **مريض / مستخدم (Patient)** | `patient@teryak.com` | `123` |

---

## 🛑 3. حل مشكلة جدار حماية MongoDB Atlas (مهم جداً للرفع)

إذا ظهرت لك رسالة خطأ في الاتصال بقاعدة البيانات:
1. سجل الدخول إلى [MongoDB Atlas](https://cloud.mongodb.com/).
2. من القائمة الجانبية: **Security** > **Network Access**.
3. اضغط على الزر الأخضر **Add IP Address**.
4. اختر **ALLOW ACCESS FROM ANYWHERE** (`0.0.0.0/0`).
5. اضغط **Confirm** وانتظر حتى تصبح الحالة **Active**.

---

## ☁️ 4. النشر السحابي (Production Hosting Options)

### الخيار (أ): نشر الباك إند على Render أو Railway ونشر الفرونت إند على Vercel أو Netlify (موصى به للإنتاج)

#### 1. نشر الباك إند (Render.com):
- أنشئ **New Web Service** واربط المستودع.
- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- أضف المتغيرات البيئية (Environment Variables):
  - `MONGODB_URI`: رابط اتصالك في MongoDB Atlas.
  - `JWT_SECRET`: مفتاح تشفير عشوائي قوي.
  - `JWT_EXPIRES_IN`: `7d`
  - `NODE_ENV`: `production`

#### 2. نشر الفرونت إند (Vercel / Netlify):
- اربط مجلد `frontend` كـ Root Directory.
- عدل `frontend/js/config.js` ليوجه `API_BASE_URL` إلى رابط الباك إند على Render (مثال: `https://teryak-api.onrender.com/api`).

### الخيار (ب): النشر كـ Fullstack Node.js App على استضافة cPanel / VPS
- ارفع مجلدي `backend` و `frontend`.
- من لوحة cPanel: توجه إلى **Setup Node.js App**.
- حدد Application root: `backend`، و Application startup file: `server.js`.
- اضغط **Start Application**.
- سيقوم الخادم بخدمة الفرونت إند والـ API معاً من نفس المنفذ والنطاق تلقائياً!
