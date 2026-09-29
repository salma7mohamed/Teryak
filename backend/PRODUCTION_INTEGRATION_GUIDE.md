# 🌐 الدليل الشامل لمتطلبات الإنتاج وربط الخدمات الخارجية (Teryak Production & Third-Party APIs Guide)

تم إعداد هذا الملف كمرجع تنفيذي ومهني للمؤسس والمطورين لتهيئة منصة **ترياق (Teryak)** للعمل في السوق التجاري الفعلي (Live Production) وربط جميع الخدمات السحابية وبوابات الدفع وتسجيل الدخول.

---

## 📑 فهرس الخدمات المطلوبة للإطلاق في سوق العمل

1. [تسجيل الدخول بحساب جوجل (Google OAuth 2.0)](#1-تسجيل-الدخول-بحساب-جوجل-google-oauth-20)
2. [بوابات الدفع الإلكتروني (Paymob / Fawry / Stripe / Vodafone Cash)](#2-بوابات-الدفع-الإلكتروني)
3. [خدمات الرسائل وتأكيد الحسابات عبر OTP و WhatsApp](#3-خدمات-الرسائل-والإشعارات-sms--whatsapp)
4. [خدمة تخزين الصور السحابية للرووشتات والأدوية (Cloudinary / AWS S3)](#4-تخزين-الصور-والملفات-السحابية)
5. [خدمات الخرائط وتحديد الصيدليات القريبة (Mapbox / Google Maps)](#5-خدمات-الخرائط-وتحديد-المواقع)
6. [قاعدة البيانات السحابية (MongoDB Atlas Production)](#6-قاعدة-بيانات-mongodb-atlas)
7. [استضافة المشروع والدومين وشهادة الأمان (SSL & Hosting)](#7-الاستضافة-والدومين)

---

## 1. تسجيل الدخول بحساب جوجل (Google OAuth 2.0)

### 🎯 الفائدة:
تمكين المرضى والأطباء والصيادلة من تسجيل الدخول بضغطة زر واحدة دون الحاجة لتذكر كلمات مرور.

### 🛠️ خطوات استخراج المفاتيح:
1. توجه إلى [Google Cloud Console](https://console.cloud.google.com/).
2. أنشئ مشروعاً جديداً باسم `Teryak-Production`.
3. من القائمة الجانبية: **APIs & Services** > **OAuth consent screen**:
   - اختر **External**.
   - املأ اسم التطبيق: `ترياق - Teryak`، والبريد الإلكتروني للدعم.
4. توجه إلى **Credentials** > اضغط **Create Credentials** > اختر **OAuth Client ID**:
   - Application Type: **Web application**.
   - Authorized JavaScript origins:
     - محلياً: `http://localhost:5000`
     - الإنتاج: `https://your-domain.com`
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
     - `https://your-domain.com/api/auth/google/callback`
5. ستحصل على:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

### 📝 المتغيرات في ملف `.env`:
```env
GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx
GOOGLE_CALLBACK_URL=https://your-domain.com/api/auth/google/callback
```

---

## 2. بوابات الدفع الإلكتروني

### الخيارات الأنسب للسوق المصري والعربي:
1. **Paymob (الأنسب في مصر):** يدعم (فيزا / ماستركارد / محافظ إلكترونية فودافون كاش / أمان / ميزة / كارت التقسيط تابي وتمارا).
2. **Fawry Pay:** يدعم الدفع بكود فوري من أي ماكينة بالشارع.
3. **Stripe:** الأنسب إذا كان التطبيق يستهدف دول الخليج أو عملاء دوليين.

### 🛠️ خطوات الربط مع Paymob:
1. افتح حساب أعمال في [Paymob Dashboard](https://accept.paymob.com/).
2. أكمل الأوراق الرسمية (سجل تجاري / بطاقة ضريبية) أو ابدأ بحساب **Test Mode** مجاناً.
3. من الإعدادات **Settings** > استخرج:
   - `PAYMOB_API_KEY`
   - `PAYMOB_INTEGRATION_ID_CARD` (للدفع بالفيزا)
   - `PAYMOB_INTEGRATION_ID_WALLET` (لمحافظ الموبايل كاش)
   - `PAYMOB_IFRAME_ID`
   - `PAYMOB_HMAC_SECRET` (للتحقق من إشعار نجاح الدفع Webhook)

### 📝 المتغيرات في ملف `.env`:
```env
PAYMOB_API_KEY=ZXlKaGJHY2lPaUpJVXpVeE1pS...
PAYMOB_HMAC_SECRET=4B5A79E89C6D...
PAYMOB_CARD_INTEGRATION_ID=123456
PAYMOB_WALLET_INTEGRATION_ID=654321
```

---

## 3. خدمات الرسائل والإشعارات (SMS & WhatsApp)

### 🎯 الفائدة:
- إرسال كود OTP لتأكيد أرقام هواتف المرضى والصيادلة عند التسجيل.
- إشعار الصيدلية فورياً برسالة واتساب عند وجود طلب دواء جديد من مريض قريب.
- إشعار المريض بأن الطلب قيد التوصيل مع رقم مندوب الصيدلية.

### الخيارات المقترحة:
1. **Twilio (دولي ممتاز):** يدعم SMS و WhatsApp API الرسمي.
2. **Infobip / VictoryLink / Taqtak (محلي مصري):** أسعار الرسائل المحلية (SMS) منخفضة جداً.
3. **Green API / UltraMsg / WhatsApp Cloud API:** لإرسال رسائل WhatsApp من رقم الصيدلية أو رقم خدمة عملاء المنصة.

### 📝 المتغيرات في ملف `.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
WHATSAPP_API_TOKEN=EAABxxxxxxxxxxxxxxxxxxxx
WHATSAPP_PHONE_NUMBER_ID=109876543210
```

---

## 4. تخزين الصور والملفات السحابية

### 🎯 الفائدة:
- رفع صور الروشتات الطبية (Prescriptions) التي يرسلها المرضى لفك شفرتها وصرفها.
- رفع رخص الصيدليات وسجلات مزاولة المهنة للتحقق منها قبل التفعيل.
- رفع وتوليد صور الأدوية بجودة عالية وضغطها لتسريع التصفح.

### 🛠️ الخيار الموصى به: **Cloudinary** (يعطي مساحة وترافيك شهري مجاني ضخم جداً)
1. سجل في [Cloudinary Console](https://cloudinary.com/).
2. من لوحة التحكم الرئيسية انسخ بياناتك.

### 📝 المتغيرات في ملف `.env`:
```env
CLOUDINARY_CLOUD_NAME=teryak-app
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz12345
```

---

## 5. خدمات الخرائط وتحديد المواقع

### 🎯 الفائدة:
- إظهار الصيدليات على الخريطة التفاعلية وحساب أقرب صيدلية لموقع المريض الجغرافي (GPS).
- حساب المسافة بدقة لتسعير خدمة الدليفري تلقائياً.

### 🛠️ الخيارات:
1. **Mapbox (موصى به بشدة):** يقدم 50,000 استعلام مجاني شهرياً وخرائط سريعة جداً وجميلة بصرياً.
2. **Google Maps API:** يتطلب تفعيل الفواتير في Google Cloud (Maps JavaScript API & Geocoding API).

### 📝 المتغيرات في ملف `.env`:
```env
MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoidGVyeWFrIiwiYSI6ImNsc3...
# أو خرائط جوجل:
GOOGLE_MAPS_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 6. قاعدة بيانات MongoDB Atlas

### 🎯 الفائدة:
تخزين جميع الأدوية، الصيدليات، الطلبات، المستخدمين، والمخزون في كلاود آمن وسريع ومدعوم بالنسخ الاحتياطي التلقائي (Automated Backups).

### 🛠️ التجهيز للإنتاج:
1. تفعيل الوصول `0.0.0.0/0` في **Network Access**.
2. إنشاء مستخدم مخصص للإنتاج بكلمة مرور قوية ومحمية.
3. إنشاء مؤشرات بحثية سريعة (Indexes) على حقول: `nameAr`, `nameEn`, `activeIngredient`, `pharmacyId`.

### 📝 المتغيرات في ملف `.env`:
```env
MONGODB_URI=mongodb+srv://teryak_prod_user:StrongPassword@teryak.boxngyx.mongodb.net/teryak_db?retryWrites=true&w=majority
JWT_SECRET=teryak_secret_jwt_key_2026_super_secure_hash_89a4b98c76ef4
JWT_EXPIRES_IN=7d
```

---

## 7. الاستضافة والدومين

### الخطة التشغيلية للنشر التجاري:

| العنصر | الخيار المقترح | التكلفة التقديرية |
|:---|:---|:---|
| **الفرونت إند (Frontend)** | Vercel / Netlify / Cloudflare Pages | **مجاني مدى الحياة** |
| **الباك إند (Backend)** | Render / Railway / DigitalOcean VPS | مجاني مبدئياً / 5$ شهرياً |
| **قاعدة البيانات (DB)** | MongoDB Atlas (Cluster M0 / M2) | **مجاني** حتى 512MB / ثم 9$ |
| **النطاق الرسمي (Domain)** | Namecheap / GoDaddy (`teryak.com` أو `teryak.app`) | ~10$ سنوياً |
| **شهادة الأمان (SSL)** | Let's Encrypt / Cloudflare SSL | **مجاني تلقائياً** |

---

## 🚀 خطة العمل للتنفيذ (Next Steps Checklist):

- [x] تم تجهيز الـ Endpoints والـ Controllers في الباك إند لدعم كافة المتغيرات.
- [x] تم ربط الفرونت إند بالكامل ودعم العمل المتزامن أونلاين وأوفلاين (Fallback).
- [ ] إنشاء حسابات الخدمات الخارجية ونسخ المفاتيح إلى ملف `.env`.
- [ ] ربط الدومين الرسمي بالمنصة وإطلاق النسخة التجريبية (Beta Launch).
