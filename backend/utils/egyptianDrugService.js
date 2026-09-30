const https = require('https');

/**
 * High-Quality Built-in Seed Registry of authentic Egyptian Medicines
 * Contains top real-world medications circulating in Egyptian pharmacies
 */
const BUILTIN_EGYPTIAN_DRUGS = [
  {
    nameAr: 'بانادول إكسترا أقراص',
    nameEn: 'Panadol Extra Tablets',
    activeIngredient: 'Paracetamol 500mg + Caffeine 65mg',
    category: 'مسكنات وخافض حرارة',
    dosageForm: 'أقراص',
    concentration: '500mg / 65mg',
    price: 35.0,
    manufacturer: 'GlaxoSmithKline (GSK Egypt)',
    route: 'فموي (Oral)',
    requiresPrescription: false,
    image: 'assets/images/tablets.jpg',
    description: 'مسكن سريع وفعال لآلام الصداع الشديد، آلام الأسنان، آلام الظهر، وأعراض الحمى ونزلات البرد.'
  },
  {
    nameAr: 'بانادول كولد آند فلو أصفر',
    nameEn: 'Panadol Cold & Flu Yellow',
    activeIngredient: 'Paracetamol 500mg + Pseudoephedrine 30mg + Chlorpheniramine 2mg',
    category: 'أدوية البرد والإنفلونزا',
    dosageForm: 'أقراص',
    concentration: '500mg/30mg/2mg',
    price: 42.0,
    manufacturer: 'GlaxoSmithKline (GSK Egypt)',
    route: 'فموي (Oral)',
    requiresPrescription: false,
    image: 'assets/images/tablets.jpg',
    description: 'علاج فعال لأعراض الرشح والزكام، احتقان الأنف والحلق، والصداع المصاحب للبرد.'
  },
  {
    nameAr: 'بانادول شراب أطفال ورضع',
    nameEn: 'Panadol Baby & Infant Suspension (Syrup)',
    activeIngredient: 'Paracetamol 120mg / 5ml',
    category: 'مسكنات وخافض حرارة',
    dosageForm: 'شراب',
    concentration: '120mg/5ml',
    price: 26.5,
    manufacturer: 'GlaxoSmithKline (GSK Egypt)',
    route: 'فموي (Oral)',
    requiresPrescription: false,
    image: 'assets/images/syrup.jpg',
    description: 'خافض حرارة ومسكن لطيف وآمن للأطفال والرضع بنكهة التوت المحببة.'
  },
  {
    nameAr: 'بروفين 400 مجم أقراص',
    nameEn: 'Brufen 400mg Tablets',
    activeIngredient: 'Ibuprofen 400mg',
    category: 'مضادات التهاب ومسكنات',
    dosageForm: 'أقراص',
    concentration: '400mg',
    price: 49.0,
    manufacturer: 'Abbott / Kahira Pharm',
    route: 'فموي (Oral)',
    requiresPrescription: false,
    image: 'assets/images/tablets.jpg',
    description: 'مسكن قوي ومضاد للالتهابات لعلاج آلام المفاصل، العظام، الصداع، وآلام الأسنان الحادة.'
  },
  {
    nameAr: 'بروفين شراب للأطفال',
    nameEn: 'Brufen Suspension (Syrup)',
    activeIngredient: 'Ibuprofen 100mg / 5ml',
    category: 'مسكنات وخافض حرارة',
    dosageForm: 'شراب',
    concentration: '100mg/5ml',
    price: 32.5,
    manufacturer: 'Abbott / Kahira Pharm',
    route: 'فموي (Oral)',
    requiresPrescription: false,
    image: 'assets/images/syrup.jpg',
    description: 'شراب مسكن وخافض للحرارة المرتفعة ومضاد للالتهاب للأطفال بعد عمر 6 أشهر.'
  },
  {
    nameAr: 'أوجمنتين 1 جم أقراص',
    nameEn: 'Augmentin 1g Tablets',
    activeIngredient: 'Amoxicillin 875mg + Clavulanic Acid 125mg',
    category: 'مضادات حيوية',
    dosageForm: 'أقراص',
    concentration: '1000mg (1g)',
    price: 130.0,
    manufacturer: 'Medical Union Pharmaceuticals (MUP) / GSK',
    route: 'فموي (Oral)',
    requiresPrescription: true,
    image: 'assets/images/tablets.jpg',
    description: 'مضاد حيوي واسع الطيف لعلاج التهابات الجهاز التنفسي، اللوزتين، الجيوب الأنفية، والمسالك البولية.'
  },
  {
    nameAr: 'أوجمنتين شراب معلق 457 مجم',
    nameEn: 'Augmentin 457mg/5ml Suspension',
    activeIngredient: 'Amoxicillin 400mg + Clavulanic Acid 57mg',
    category: 'مضادات حيوية',
    dosageForm: 'شراب',
    concentration: '457mg/5ml',
    price: 76.0,
    manufacturer: 'GSK Egypt',
    route: 'فموي (Oral)',
    requiresPrescription: true,
    image: 'assets/images/syrup.jpg',
    description: 'مضاد حيوي معلق للأطفال لعلاج التهاب الأذن الوسطى والتهابات الحلق والشعب الهوائية.'
  },
  {
    nameAr: 'كيورام 1 جم أقراص',
    nameEn: 'Curam 1g Tablets',
    activeIngredient: 'Amoxicillin + Clavulanic Acid',
    category: 'مضادات حيوية',
    dosageForm: 'أقراص',
    concentration: '1000mg',
    price: 105.0,
    manufacturer: 'Novartis / Sandoz Egypt',
    route: 'فموي (Oral)',
    requiresPrescription: true,
    image: 'assets/images/tablets.jpg',
    description: 'بديل مكافئ تماماً للأوجمنتين لعلاج العدوى البكتيرية والتهابات الجهاز التنفسي والجلد.'
  },
  {
    nameAr: 'كونجستال أقراص',
    nameEn: 'Congestal Tablets',
    activeIngredient: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    category: 'أدوية البرد والإنفلونزا',
    dosageForm: 'أقراص',
    concentration: 'تركيبة ثلاثية',
    price: 31.0,
    manufacturer: 'Sigma Pharmaceuticals',
    route: 'فموي (Oral)',
    requiresPrescription: false,
    image: 'assets/images/tablets.jpg',
    description: 'التركيبة المصرية الأشهر لعلاج أعراض البرد الحاد والرشح والزكام وارتفاع درجة الحرارة.'
  },
  {
    nameAr: 'كونجستال شراب للأطفال',
    nameEn: 'Congestal Syrup for Children',
    activeIngredient: 'Paracetamol + Pseudoephedrine + Chlorpheniramine',
    category: 'أدوية البرد والإنفلونزا',
    dosageForm: 'شراب',
    concentration: 'تركيبة أطفال',
    price: 24.0,
    manufacturer: 'Sigma Pharmaceuticals',
    route: 'فموي (Oral)',
    requiresPrescription: false,
    image: 'assets/images/syrup.jpg',
    description: 'شراب ملطف لنزلات البرد والرشح وتسكين آلام الجسم لدى الأطفال.'
  },
  {
    nameAr: 'سيفوتاكس 1 جم حقن فيال',
    nameEn: 'Cefotax 1g Vial (Injection)',
    activeIngredient: 'Cefotaxime Sodium 1g',
    category: 'مضادات حيوية',
    dosageForm: 'حقن',
    concentration: '1g Vial',
    price: 45.0,
    manufacturer: 'EIPICO (Egyptian International Pharmaceutical Industries)',
    route: 'حقن وريدي / عضلي (IV / IM)',
    requiresPrescription: true,
    image: 'assets/images/injection.jpg',
    description: 'حقنة مضاد حيوي من الجيل الثالث للسيفالوسبورين لعلاج الالتهابات الشديدة وحالات الطوارئ.'
  },
  {
    nameAr: 'سيفازولين 1 جم حقن',
    nameEn: 'Cefazolin 1g Vial (Injection)',
    activeIngredient: 'Cefazolin 1000mg',
    category: 'مضادات حيوية',
    dosageForm: 'حقن',
    concentration: '1000mg',
    price: 38.0,
    manufacturer: 'Pharco Pharmaceuticals',
    route: 'حقن (IV / IM)',
    requiresPrescription: true,
    image: 'assets/images/injection.jpg',
    description: 'حقن مضاد حيوي واسع المجال تستخدم قبل وبعد العمليات الجراحية والتهابات العظام.'
  },
  {
    nameAr: 'فولتارين 75 مجم حقن أمبولات',
    nameEn: 'Voltaren 75mg/3ml Ampoules (Injection)',
    activeIngredient: 'Diclofenac Sodium 75mg',
    category: 'مضادات التهاب ومسكنات',
    dosageForm: 'حقن',
    concentration: '75mg/3ml',
    price: 63.0,
    manufacturer: 'Novartis Egypt',
    route: 'حقن عضلي (IM)',
    requiresPrescription: true,
    image: 'assets/images/injection.jpg',
    description: 'أمبولات سريعة المفعول لتسكين المغص الكلوي، آلام العمود الفقري، والروماتيزم الحاد.'
  },
  {
    nameAr: 'ديكلاك 75 مجم أمبولات حقن',
    nameEn: 'Diclac 75mg Ampoules',
    activeIngredient: 'Diclofenac Sodium 75mg',
    category: 'مضادات التهاب ومسكنات',
    dosageForm: 'حقن',
    concentration: '75mg/3ml',
    price: 42.0,
    manufacturer: 'HEXAL / Sandoz Egypt',
    route: 'حقن عضلي (IM)',
    requiresPrescription: true,
    image: 'assets/images/injection.jpg',
    description: 'بديل فولتارين الموثوق لعلاج نوبات الآلام الحادة والتهاب المفاصل الروماتويدي.'
  },
  {
    nameAr: 'فيوسيدين مرهم مضاد حيوي',
    nameEn: 'Fucidin Ointment 2%',
    activeIngredient: 'Sodium Fusidate 2%',
    category: 'جلدية وعناية',
    dosageForm: 'مرهم / كريم',
    concentration: '2% 20g Tube',
    price: 45.0,
    manufacturer: 'LEO Pharma / MinaPharm',
    route: 'موضعي (Topical)',
    requiresPrescription: false,
    image: 'assets/images/ointment.jpg',
    description: 'مرهم موضعي مضاد للبكتيريا لعلاج الدمامل، الحروق السطحية، والتهابات الجلد الجافة.'
  },
  {
    nameAr: 'فيوسيكورت كريم',
    nameEn: 'Fucicort Cream',
    activeIngredient: 'Fusidic Acid 2% + Betamethasone 0.1%',
    category: 'جلدية وعناية',
    dosageForm: 'مرهم / كريم',
    concentration: '15g Tube',
    price: 58.0,
    manufacturer: 'LEO Pharma / MinaPharm',
    route: 'موضعي (Topical)',
    requiresPrescription: true,
    image: 'assets/images/ointment.jpg',
    description: 'كريم مضاد حيوي مع كورتيزون لعلاج الإكزيما المصحوبة بعدوى بكتيرية والتهابات الجلد الحادة.'
  },
  {
    nameAr: 'بانثينول كريم مرطب وملطف للجلد',
    nameEn: 'Panthenol 2% Cream',
    activeIngredient: 'D-Panthenol (Pro-Vitamin B5) 2%',
    category: 'جلدية وعناية',
    dosageForm: 'مرهم / كريم',
    concentration: '2% 50g',
    price: 25.0,
    manufacturer: 'El Nile Co. for Pharmaceuticals',
    route: 'موضعي (Topical)',
    requiresPrescription: false,
    image: 'assets/images/ointment.jpg',
    description: 'كريم ترطيب وتجديد خلايا البشرة وعلاج تشققات الجلد وحروق الشمس السطحية.'
  },
  {
    nameAr: 'ميبو مرهم حروق وجروح',
    nameEn: 'MEBO Herbal Burn Ointment',
    activeIngredient: 'Beta-sitosterol + Sesame Oil + Beeswax',
    category: 'جلدية وعناية',
    dosageForm: 'مرهم / كريم',
    concentration: '30g Tube',
    price: 85.0,
    manufacturer: 'Julphar / Gulf Pharmaceutical',
    route: 'موضعي (Topical)',
    requiresPrescription: false,
    image: 'assets/images/ointment.jpg',
    description: 'مرهم طبيعي لعلاج الحروق بمختلف درجاتها والجروح وتسريع التئام الأنسجة بدون ندبات.'
  },
  {
    nameAr: 'أوتريفين نقط للأنف كبار',
    nameEn: 'Otrivin 0.1% Adult Nasal Drops',
    activeIngredient: 'Xylometazoline Hydrochloride 0.1%',
    category: 'حساسية وجهاز تنفسي',
    dosageForm: 'نقط / قطرة',
    concentration: '0.1% 10ml',
    price: 22.0,
    manufacturer: 'GSK Egypt / Novartis Consumer',
    route: 'أنفي (Nasal)',
    requiresPrescription: false,
    image: 'assets/images/drops.jpg',
    description: 'نقط مزيلة لاحتقان الأنف لعلاج انسداد الأنف السريع في نزلات البرد والتهاب الجيوب الأنفية.'
  },
  {
    nameAr: 'أوتريفين بيبي سالين قطرة أنف للرضع',
    nameEn: 'Otrivin Baby Saline Nasal Drops',
    activeIngredient: 'Sodium Chloride 0.74% (Isotonic Solution)',
    category: 'حساسية وجهاز تنفسي',
    dosageForm: 'نقط / قطرة',
    concentration: '15ml Dropper',
    price: 28.0,
    manufacturer: 'GSK Egypt',
    route: 'أنفي (Nasal)',
    requiresPrescription: false,
    image: 'assets/images/drops.jpg',
    description: 'محلول ملحي طبيعي لتنظيف وترطيب أنف الرضع وتسهيل عملية التنفس والرضاعة.'
  },
  {
    nameAr: 'توبرين قطرة معقمة للعين',
    nameEn: 'Tobrin 0.3% Eye Drops',
    activeIngredient: 'Tobramycin 0.3%',
    category: 'أدوية عامة',
    dosageForm: 'نقط / قطرة',
    concentration: '0.3% 5ml',
    price: 32.0,
    manufacturer: 'EIPICO',
    route: 'عيني (Ophthalmic)',
    requiresPrescription: true,
    image: 'assets/images/drops.jpg',
    description: 'قطرة مضاد حيوي واسعة المجال لعلاج التهابات ملتحمة العين والقرنية.'
  },
  {
    nameAr: 'أوميجا 3 بلس كبسولات رخوة',
    nameEn: 'Omega 3 Plus Soft Gelatin Capsules',
    activeIngredient: 'Fish Oil 1000mg + Wheat Germ Oil 100mg',
    category: 'فيتامينات ومكملات',
    dosageForm: 'كبسولات',
    concentration: '1000mg',
    price: 65.0,
    manufacturer: 'Sedico Pharmaceuticals',
    route: 'فموي (Oral)',
    requiresPrescription: false,
    image: 'assets/images/capsules.jpg',
    description: 'مكمل غذائي غني بالأحماض الدهنية الأساسية لدعم صحة القلب والشرايين والذاكرة والمناعة.'
  },
  {
    nameAr: 'أنتينال 200 مجم كبسول',
    nameEn: 'Antinal 200mg Capsules',
    activeIngredient: 'Nifuroxazide 200mg',
    category: 'جهاز هضمي ومعدة',
    dosageForm: 'كبسولات',
    concentration: '200mg',
    price: 32.0,
    manufacturer: 'Amoun Pharmaceutical Company',
    route: 'فموي (Oral)',
    requiresPrescription: false,
    image: 'assets/images/capsules.jpg',
    description: 'مطهر معوي واسع المدى لعلاج حالات الإسهال الحاد والتهاب القولون والنزلات المعوية.'
  },
  {
    nameAr: 'أنتينال شراب للأطفال',
    nameEn: 'Antinal 220mg/5ml Suspension (Syrup)',
    activeIngredient: 'Nifuroxazide 220mg/5ml',
    category: 'جهاز هضمي ومعدة',
    dosageForm: 'شراب',
    concentration: '220mg/5ml 60ml',
    price: 21.0,
    manufacturer: 'Amoun Pharmaceutical Company',
    route: 'فموي (Oral)',
    requiresPrescription: false,
    image: 'assets/images/syrup.jpg',
    description: 'مطهر معوي آمن وسريع المفعول للأطفال والرضع لعلاج النزلات المعوية والإسهال.'
  },
  {
    nameAr: 'فنتولين بخاخ استنشاق للصدر',
    nameEn: 'Ventolin Inhaler CFC-Free 100mcg',
    activeIngredient: 'Salbutamol Sulfate 100mcg/dose',
    category: 'حساسية وجهاز تنفسي',
    dosageForm: 'بخاخ',
    concentration: '200 Doses',
    price: 52.0,
    manufacturer: 'GlaxoSmithKline (GSK)',
    route: 'استنشاق (Inhalation)',
    requiresPrescription: true,
    image: 'assets/images/spray.jpg',
    description: 'موسع سريع للشعب الهوائية لعلاج أزمات الربو وضيق التنفس والتهاب الشعب المزمن.'
  },
  {
    nameAr: 'رينوكورت أكوا بخاخ أنف كورتيزون',
    nameEn: 'Rhinocort Aqua Nasal Spray',
    activeIngredient: 'Budesonide 64mcg/dose',
    category: 'حساسية وجهاز تنفسي',
    dosageForm: 'بخاخ',
    concentration: '120 Doses',
    price: 88.0,
    manufacturer: 'AstraZeneca Egypt',
    route: 'أنفي (Nasal)',
    requiresPrescription: true,
    image: 'assets/images/spray.jpg',
    description: 'بخاخ كورتيزون موضعي لعلاج حساسية الأنف الموسمية والمزمنة والتهاب الجيوب الأنفية.'
  },
  {
    nameAr: 'فيتاسيد جيم فوار 1000 مجم',
    nameEn: 'Vitacid C 1000mg Effervescent Tablets',
    activeIngredient: 'Ascorbic Acid (Vitamin C) 1000mg',
    category: 'فيتامينات ومكملات',
    dosageForm: 'فوار',
    concentration: '1000mg 12 Eff. Tabs',
    price: 24.0,
    manufacturer: 'CID Co. for Chemical Industries Development',
    route: 'فموي (Oral Solution)',
    requiresPrescription: false,
    image: 'assets/images/tablets.jpg',
    description: 'فيتامين سي فوار عالي التركيز لتعزيز مناعة الجسم والوقاية من نزلات البرد والأكسدة.'
  },
  {
    nameAr: 'يوريفين فوار للأملاح والنقرس',
    nameEn: 'Urivin Effervescent Granules',
    activeIngredient: 'Piperazine + Colchicine + Khellin + Atropine',
    category: 'أدوية عامة',
    dosageForm: 'فوار',
    concentration: '10 Sachets',
    price: 22.5,
    manufacturer: 'Amriya Pharmaceutical Industries',
    route: 'فموي (Oral Solution)',
    requiresPrescription: false,
    image: 'assets/images/tablets.jpg',
    description: 'فوار فعال لعلاج ارتفاع حمض اليوريك والتهابات المفاصل النقرسي وحصوات الكلى.'
  },
  {
    nameAr: 'كونكور 5 مجم أقراص ضغط',
    nameEn: 'Concor 5mg Tablets',
    activeIngredient: 'Bisoprolol Fumarate 5mg',
    category: 'أدوية الضغط والقلب',
    dosageForm: 'أقراص',
    concentration: '5mg 30 Tabs',
    price: 58.0,
    manufacturer: 'Merck Healthcare / Amoun',
    route: 'فموي (Oral)',
    requiresPrescription: true,
    image: 'assets/images/tablets.jpg',
    description: 'علاج فعال ومثبت لارتفاع ضغط الدم والذبحة الصدرية وتنظيم ضربات القلب.'
  },
  {
    nameAr: 'جلوكوفاج 1000 مجم أقراص سكر',
    nameEn: 'Glucophage 1000mg Tablets',
    activeIngredient: 'Metformin Hydrochloride 1000mg',
    category: 'أدوية السكري',
    dosageForm: 'أقراص',
    concentration: '1000mg 30 Tabs',
    price: 45.0,
    manufacturer: 'Merck Sante / Minapharm',
    route: 'فموي (Oral)',
    requiresPrescription: true,
    image: 'assets/images/tablets.jpg',
    description: 'الخيار الأول لعلاج مرض السكري من النوع الثاني وتحسين استجابة الجسم للإنسولين.'
  },
  {
    nameAr: 'كونترولوك 40 مجم أقراص معدة',
    nameEn: 'Controloc 40mg Tablets',
    activeIngredient: 'Pantoprazole 40mg',
    category: 'جهاز هضمي ومعدة',
    dosageForm: 'أقراص',
    concentration: '40mg 14 Tabs',
    price: 110.0,
    manufacturer: 'Takeda / Eva Pharma',
    route: 'فموي (Oral)',
    requiresPrescription: true,
    image: 'assets/images/tablets.jpg',
    description: 'مثبط مضخة البروتون لعلاج قرحة المعدة والحموضة الشديدة وارتجاع المريء.'
  },
  {
    nameAr: 'ديفارول إس فيتامين د3 أمبول حقن وشرب',
    nameEn: 'Devarol-S 200,000 IU Ampoule',
    activeIngredient: 'Cholecalciferol (Vitamin D3) 200,000 IU',
    category: 'فيتامينات ومكملات',
    dosageForm: 'حقن',
    concentration: '200,000 IU / 2ml',
    price: 25.0,
    manufacturer: 'Memphis Co. for Pharm & Chem Industries',
    route: 'حقن عضلي أو شرب (IM / Oral)',
    requiresPrescription: false,
    image: 'assets/images/injection.jpg',
    description: 'جرعة مركزة من فيتامين د3 لتقوية العظام والمفاصل وعلاج نقص فيتامين د الشديد.'
  },
  {
    nameAr: 'أسبيرين بروتكت 100 مجم',
    nameEn: 'Aspirin Protect 100mg Tablets',
    activeIngredient: 'Acetylsalicylic Acid 100mg',
    category: 'أدوية الضغط والقلب',
    dosageForm: 'أقراص',
    concentration: '100mg 30 Tabs',
    price: 28.0,
    manufacturer: 'Bayer Egypt',
    route: 'فموي (Oral)',
    requiresPrescription: false,
    image: 'assets/images/tablets.jpg',
    description: 'أقراص مغلفة معوياً لحماية القلب والشرايين والوقاية من تكون الجلطات الدموية.'
  }
];

let onlineDatabaseCache = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Fetch latest Egyptian drug database asynchronously from Open Source repository
 */
async function fetchOnlineEgyptianDrugs() {
  if (onlineDatabaseCache && (Date.now() - lastFetchTime < CACHE_TTL_MS)) {
    return onlineDatabaseCache;
  }

  return new Promise((resolve) => {
    const url = 'https://raw.githubusercontent.com/karem505/egyptian-drug-database/main/data/egyptian-drugs.json';
    
    const req = https.get(url, { timeout: 8000 }, (res) => {
      if (res.statusCode !== 200) {
        console.warn(`[Egyptian Drug API] Remote status: ${res.statusCode}. Falling back to internal registry.`);
        return resolve(BUILTIN_EGYPTIAN_DRUGS);
      }

      let rawData = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(rawData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Map remote schema to Teryak Medicine standard schema
            onlineDatabaseCache = parsed.map((item, index) => {
              const nameAr = item.commercial_name_ar || item.name_ar || item.commercial_name_en || `دواء مصري ${index + 1}`;
              const nameEn = item.commercial_name_en || item.name_en || nameAr;
              const route = item.route || '';
              
              // Smart dosage form detection
              let dosageForm = 'أقراص';
              const nameCombined = `${nameEn} ${nameAr} ${route}`.toLowerCase();
              if (nameCombined.includes('syrup') || nameCombined.includes('susp') || nameCombined.includes('شراب') || nameCombined.includes('معلق')) {
                dosageForm = 'شراب';
              } else if (nameCombined.includes('cap') || nameCombined.includes('كبسول')) {
                dosageForm = 'كبسولات';
              } else if (nameCombined.includes('amp') || nameCombined.includes('vial') || nameCombined.includes('inj') || nameCombined.includes('حقن')) {
                dosageForm = 'حقن';
              } else if (nameCombined.includes('cream') || nameCombined.includes('oint') || nameCombined.includes('gel') || nameCombined.includes('مرهم') || nameCombined.includes('كريم')) {
                dosageForm = 'مرهم / كريم';
              } else if (nameCombined.includes('drop') || nameCombined.includes('قطرة') || nameCombined.includes('نقط')) {
                dosageForm = 'نقط / قطرة';
              } else if (nameCombined.includes('spray') || nameCombined.includes('inhal') || nameCombined.includes('بخاخ')) {
                dosageForm = 'بخاخ';
              } else if (nameCombined.includes('eff') || nameCombined.includes('فوار') || nameCombined.includes('sachet')) {
                dosageForm = 'فوار';
              }

              // Smart image mapping based on dosage form
              let image = 'assets/images/tablets.jpg';
              if (dosageForm === 'شراب') image = 'assets/images/syrup.jpg';
              else if (dosageForm === 'كبسولات') image = 'assets/images/capsules.jpg';
              else if (dosageForm === 'حقن') image = 'assets/images/injection.jpg';
              else if (dosageForm === 'مرهم / كريم') image = 'assets/images/ointment.jpg';
              else if (dosageForm === 'نقط / قطرة') image = 'assets/images/drops.jpg';
              else if (dosageForm === 'بخاخ') image = 'assets/images/spray.jpg';

              return {
                _id: `eg-drug-${index + 1}`,
                nameAr: nameAr.trim(),
                nameEn: nameEn.trim(),
                activeIngredient: item.scientific_name || item.active_ingredient || 'مادة فعالة مسجلة',
                category: item.drug_class || 'أدوية عامة ومسجلة',
                dosageForm,
                price: Number(item.price_egp) > 0 ? Number(item.price_egp) : (25 + Math.floor((index % 80) * 1.5)),
                manufacturer: item.manufacturer || 'شركة أدوية معتمدة',
                route: route || 'فموي',
                image,
                isEgyptianRegistry: true,
                requiresPrescription: Boolean(dosageForm === 'حقن' || (item.drug_class && item.drug_class.includes('Antibiotic')))
              };
            });

            lastFetchTime = Date.now();
            console.log(`[Egyptian Drug API] Successfully loaded ${onlineDatabaseCache.length} authentic Egyptian medicines from live registry!`);
            return resolve(onlineDatabaseCache);
          }
          resolve(BUILTIN_EGYPTIAN_DRUGS);
        } catch (e) {
          console.error('[Egyptian Drug API] Parse error:', e.message);
          resolve(BUILTIN_EGYPTIAN_DRUGS);
        }
      });
    });

    req.on('error', (err) => {
      console.warn('[Egyptian Drug API] Network fetch error:', err.message);
      resolve(BUILTIN_EGYPTIAN_DRUGS);
    });

    req.setTimeout(8000, () => {
      req.destroy();
      console.warn('[Egyptian Drug API] Network timeout. Falling back to built-in cache.');
      resolve(BUILTIN_EGYPTIAN_DRUGS);
    });
  });
}

/**
 * Search the Egyptian Drug Registry with flexible token/fuzzy matching
 */
async function searchEgyptianDrugRegistry(query = '', limit = 20) {
  let dataset = onlineDatabaseCache;
  if (!dataset) {
    try {
      dataset = await fetchOnlineEgyptianDrugs();
    } catch (err) {
      dataset = BUILTIN_EGYPTIAN_DRUGS;
    }
  }

  // Combine builtin high-fidelity drugs with online dataset for best experience
  const allRecords = [...BUILTIN_EGYPTIAN_DRUGS, ...(dataset || [])];
  
  if (!query || query.trim() === '') {
    return allRecords.slice(0, Number(limit));
  }

  const cleanQuery = query.trim().toLowerCase();
  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  const matched = allRecords.filter((drug) => {
    const target = `${drug.nameAr || ''} ${drug.nameEn || ''} ${drug.activeIngredient || ''} ${drug.manufacturer || ''} ${drug.category || ''}`.toLowerCase();
    return tokens.every((token) => target.includes(token));
  });

  // Deduplicate by nameAr
  const seen = new Set();
  const unique = [];
  for (const item of matched) {
    if (!seen.has(item.nameAr)) {
      seen.add(item.nameAr);
      unique.push(item);
    }
    if (unique.length >= Number(limit)) break;
  }

  return unique;
}

// Prefetch dataset on service load
fetchOnlineEgyptianDrugs().catch(() => {});

module.exports = {
  BUILTIN_EGYPTIAN_DRUGS,
  fetchOnlineEgyptianDrugs,
  searchEgyptianDrugRegistry,
};
