const Medicine = require('../models/Medicine');
const PharmacyInventory = require('../models/PharmacyInventory');
const Pharmacy = require('../models/Pharmacy');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { searchEgyptianDrugRegistry, fetchOnlineEgyptianDrugs } = require('../utils/egyptianDrugService');

// @desc    Get all medicines with search, category filtering, sorting & pagination
// @route   GET /api/medicines
// @access  Public
const getMedicines = async (req, res, next) => {
  try {
    const { search, category, sort, page = 1, limit = 20 } = req.query;

    const query = { status: 'active' };

    // Search by Arabic name, English name, or active ingredient
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { nameAr: regex },
        { nameEn: regex },
        { activeIngredient: regex },
        { category: regex },
      ];
    }

    // Category filter
    if (category && category !== 'all' && category !== 'الكل') {
      query.category = new RegExp(category.trim(), 'i');
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sort === 'priceLow') {
      sortOptions = { price: 1 };
    } else if (sort === 'priceHigh') {
      sortOptions = { price: -1 };
    } else if (sort === 'name') {
      sortOptions = { nameAr: 1 };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Medicine.countDocuments(query);
    const medicines = await Medicine.find(query)
      .populate('alternatives', 'nameAr nameEn price image activeIngredient')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    return successResponse(
      res,
      200,
      'تم جلب قائمة الأدوية بنجاح',
      medicines,
      {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      }
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get single medicine details with alternatives and available pharmacies
// @route   GET /api/medicines/:id
// @access  Public
const getMedicineById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find medicine by ID or by English/Arabic name lookup
    let medicine;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      medicine = await Medicine.findById(id).populate(
        'alternatives',
        'nameAr nameEn price image activeIngredient category dosageForm'
      );
    } else {
      const cleanQuery = (id || '').trim();
      const sanitized = cleanQuery.replace(/[-_]/g, ' ');
      const tokens = sanitized.split(/\s+/).filter(Boolean);
      const flexiblePattern = tokens.join('.*');
      const regex = new RegExp(cleanQuery, 'i');
      const flexRegex = new RegExp(flexiblePattern, 'i');

      // Common slug aliases for platform navigation
      const aliasQueries = [];
      const lower = cleanQuery.toLowerCase();
      if (lower.includes('aspirin')) {
        aliasQueries.push({ nameEn: /aspirin/i }, { nameAr: /أسبيرين|اسبرين|اسبوسيد/i });
      } else if (lower.includes('paracetamol')) {
        aliasQueries.push({ nameEn: /panadol|paramol|paracetamol/i }, { nameAr: /بانادول|بارامول|باراسيتامول/i });
      } else if (lower.includes('amox')) {
        aliasQueries.push({ nameEn: /amox|augmentin/i }, { nameAr: /أموكس|أوجمنتين/i });
      } else if (lower.includes('vitamin') || lower.includes('vitamind')) {
        aliasQueries.push({ nameEn: /vitamin|devarol/i }, { nameAr: /فيتامين|ديفارول/i });
      } else if (lower.includes('omega')) {
        aliasQueries.push({ nameEn: /omega/i }, { nameAr: /أوميجا|اوميجا/i });
      }

      medicine = await Medicine.findOne({
        $or: [
          { nameEn: regex },
          { nameAr: regex },
          { activeIngredient: regex },
          { nameEn: flexRegex },
          { nameAr: flexRegex },
          { activeIngredient: flexRegex },
          { category: regex },
          ...aliasQueries,
        ],
      }).populate(
        'alternatives',
        'nameAr nameEn price image activeIngredient category dosageForm'
      );
    }

    if (!medicine) {
      return errorResponse(res, 404, 'الدواء المطلوب غير موجود');
    }

    // If alternatives list is empty, automatically find medicines with same active ingredient or category
    let alternatives = medicine.alternatives;
    if (!alternatives || alternatives.length === 0) {
      alternatives = await Medicine.find({
        _id: { $ne: medicine._id },
        $or: [
          { activeIngredient: medicine.activeIngredient },
          { category: medicine.category },
        ],
        status: 'active',
      }).limit(4);
    }

    // Find pharmacies that have this medicine in stock
    const inventories = await PharmacyInventory.find({
      medicineId: medicine._id,
      quantity: { $gt: 0 },
      isAvailable: true,
    }).populate('pharmacyId', 'name phone address rating deliveryAvailable deliveryFee openingHours');

    const availablePharmacies = inventories.map((inv) => ({
      pharmacy: inv.pharmacyId,
      quantity: inv.quantity,
      price: inv.customPrice || medicine.price,
      expiryDate: inv.expiryDate,
    }));

    return successResponse(res, 200, 'تم جلب تفاصيل الدواء', {
      medicine,
      alternatives,
      availablePharmacies,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get alternative substitutes for a medicine
// @route   GET /api/medicines/:id/alternatives
// @access  Public
const getMedicineAlternatives = async (req, res, next) => {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findById(id);

    if (!medicine) {
      return errorResponse(res, 404, 'الدواء غير موجود');
    }

    const substitutes = await Medicine.find({
      _id: { $ne: medicine._id },
      $or: [
        { activeIngredient: medicine.activeIngredient },
        { category: medicine.category },
      ],
      status: 'active',
    }).limit(6);

    return successResponse(res, 200, 'تم جلب بدائل الدواء', substitutes);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new medicine
// @route   POST /api/medicines
// @access  Private (Admin / Pharmacist)
const createMedicine = async (req, res, next) => {
  try {
    const {
      nameAr,
      nameEn,
      activeIngredient,
      category,
      dosageForm,
      concentration,
      description,
      usageInstructions,
      price,
      requiresPrescription,
      image,
      alternatives,
      status,
    } = req.body;

    if (!nameAr || !price) {
      return errorResponse(res, 400, 'اسم الدواء والسعر حقول مطلوبة');
    }

    const medicine = await Medicine.create({
      nameAr,
      nameEn: nameEn || nameAr,
      activeIngredient: activeIngredient || 'مادة فعالة عامة',
      category: category || 'أدوية عامة',
      dosageForm: dosageForm || 'أقراص',
      concentration: concentration || '',
      description: description || '',
      usageInstructions: usageInstructions || '',
      price: Number(price),
      requiresPrescription: Boolean(requiresPrescription),
      image: image || '',
      alternatives: alternatives || [],
      status: req.user.role === 'admin' ? (status || 'active') : 'pending',
    });

    return successResponse(res, 201, 'تم إضافة الدواء بنجاح', medicine);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a medicine
// @route   PUT /api/medicines/:id
// @access  Private (Admin)
const updateMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!medicine) {
      return errorResponse(res, 404, 'الدواء غير موجود');
    }

    return successResponse(res, 200, 'تم تحديث بيانات الدواء بنجاح', medicine);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a medicine
// @route   DELETE /api/medicines/:id
// @access  Private (Admin)
const deleteMedicine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const medicine = await Medicine.findByIdAndDelete(id);

    if (!medicine) {
      return errorResponse(res, 404, 'الدواء غير موجود');
    }

    // Clean up inventory references
    await PharmacyInventory.deleteMany({ medicineId: id });

    return successResponse(res, 200, 'تم حذف الدواء بنجاح');
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk import medicines into catalog
// @route   POST /api/medicines/bulk-import
// @access  Private (Admin)
const bulkImportMedicines = async (req, res, next) => {
  try {
    const { medicines } = req.body;
    if (!Array.isArray(medicines) || medicines.length === 0) {
      return errorResponse(res, 400, 'يرجى إرسال مصفوفة أدوية صالحة للاستيراد');
    }

    let insertedCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (let i = 0; i < medicines.length; i++) {
      const item = medicines[i];
      const nameAr = (item.nameAr || item.name || '').trim();
      if (!nameAr) {
        errors.push(`العنصر #${i + 1}: اسم الدواء بالعربية مطلوب`);
        continue;
      }

      const existing = await Medicine.findOne({
        $or: [
          { nameAr: nameAr },
          ...(item.nameEn ? [{ nameEn: item.nameEn.trim() }] : [])
        ]
      });

      if (existing) {
        if (item.price) existing.price = Number(item.price);
        if (item.category) existing.category = item.category;
        if (item.activeIngredient) existing.activeIngredient = item.activeIngredient;
        if (item.dosageForm) existing.dosageForm = item.dosageForm;
        if (item.concentration) existing.concentration = item.concentration;
        if (item.description) existing.description = item.description;
        if (item.image) existing.image = item.image;
        await existing.save();
        updatedCount++;
      } else {
        await Medicine.create({
          nameAr: nameAr,
          nameEn: (item.nameEn || nameAr).trim(),
          activeIngredient: item.activeIngredient || 'مادة فعالة عامة',
          category: item.category || 'أدوية عامة',
          dosageForm: item.dosageForm || 'أقراص',
          concentration: item.concentration || '',
          description: item.description || '',
          usageInstructions: item.usageInstructions || '',
          price: Number(item.price) || 25,
          requiresPrescription: Boolean(item.requiresPrescription),
          image: item.image || '',
          status: 'active'
        });
        insertedCount++;
      }
    }

    return successResponse(res, 200, 'تمت عملية الاستيراد الجماعي للأدوية بنجاح', {
      insertedCount,
      updatedCount,
      totalProcessed: medicines.length,
      errors
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search authentic Egyptian Drug Authority & Market Database live
// @route   GET /api/medicines/egypt-registry
// @access  Public
const getEgyptianDrugRegistry = async (req, res, next) => {
  try {
    const { search = '', limit = 25 } = req.query;
    const results = await searchEgyptianDrugRegistry(search, Number(limit) || 25);
    return successResponse(res, 200, 'تم جلب بيانات دليل الأدوية المصرية بنجاح', results, {
      count: results.length,
      search: search || 'all',
      source: 'Egyptian Drug Authority & National Open Registry (EDA)'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync Egyptian drugs to local MongoDB database
// @route   POST /api/medicines/sync-egypt-registry
// @access  Private (Admin)
const syncEgyptianDrugCatalog = async (req, res, next) => {
  try {
    const drugs = await fetchOnlineEgyptianDrugs();
    let imported = 0;
    for (const d of drugs.slice(0, 100)) {
      const exists = await Medicine.findOne({ nameAr: d.nameAr });
      if (!exists) {
        await Medicine.create({
          nameAr: d.nameAr,
          nameEn: d.nameEn,
          activeIngredient: d.activeIngredient,
          category: d.category,
          dosageForm: d.dosageForm,
          price: d.price,
          image: d.image,
          requiresPrescription: d.requiresPrescription,
          status: 'active'
        });
        imported++;
      }
    }
    return successResponse(res, 200, `تمت مزامنة ${imported} دواء مصري رسمي لقاعدة البيانات بنجاح`, {
      importedCount: imported,
      totalRegistryCount: drugs.length
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMedicines,
  getMedicineById,
  getMedicineAlternatives,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  bulkImportMedicines,
  getEgyptianDrugRegistry,
  syncEgyptianDrugCatalog,
};

