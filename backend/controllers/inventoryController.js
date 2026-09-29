const PharmacyInventory = require('../models/PharmacyInventory');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const { successResponse, errorResponse } = require('../utils/apiResponse');

// Helper to get pharmacy for logged-in user
const getUserPharmacy = async (userId) => {
  return await Pharmacy.findOne({ ownerId: userId });
};

// @desc    Get logged-in pharmacist's inventory
// @route   GET /api/inventory
// @access  Private (Pharmacist)
const getMyInventory = async (req, res, next) => {
  try {
    const pharmacy = await getUserPharmacy(req.user._id);
    if (!pharmacy) {
      return errorResponse(res, 404, 'لم يتم العثور على صيدلية مرتبطة بهذا الحساب');
    }

    const { search } = req.query;

    let inventory = await PharmacyInventory.find({ pharmacyId: pharmacy._id })
      .populate('medicineId', 'nameAr nameEn price activeIngredient category dosageForm image concentration')
      .sort({ updatedAt: -1 });

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      inventory = inventory.filter((item) => {
        const med = item.medicineId;
        if (!med) return false;
        return (
          med.nameAr.toLowerCase().includes(q) ||
          med.nameEn.toLowerCase().includes(q) ||
          med.activeIngredient.toLowerCase().includes(q)
        );
      });
    }

    return successResponse(res, 200, 'تم جلب المخزون بنجاح', inventory);
  } catch (error) {
    next(error);
  }
};

// @desc    Add medicine to pharmacy inventory
// @route   POST /api/inventory
// @access  Private (Pharmacist)
const addToInventory = async (req, res, next) => {
  try {
    const pharmacy = await getUserPharmacy(req.user._id);
    if (!pharmacy) {
      return errorResponse(res, 404, 'لم يتم العثور على صيدلية مرتبطة بهذا الحساب');
    }

    const {
      medicineId,
      medicineName,
      quantity = 1,
      customPrice,
      costPrice,
      shelfLocation,
      expiryDate,
      batchNumber,
      lowStockThreshold = 5,
      image,
      activeIngredient,
      category,
      dosageForm,
    } = req.body;

    let targetMedicineId = medicineId;

    // If no medicineId provided, find by name or create a new medicine entry
    if (!targetMedicineId && medicineName) {
      let med = await Medicine.findOne({
        $or: [{ nameAr: medicineName }, { nameEn: medicineName }],
      });

      if (!med) {
        med = await Medicine.create({
          nameAr: medicineName,
          nameEn: medicineName,
          activeIngredient: activeIngredient || 'عام',
          category: category || 'أدوية عامة',
          dosageForm: dosageForm || 'أقراص',
          image: image || '',
          price: customPrice || 25,
        });
      } else if (image && !med.image) {
        med.image = image;
        await med.save();
      }
      targetMedicineId = med._id;
    } else if (targetMedicineId && image) {
      const med = await Medicine.findById(targetMedicineId);
      if (med && image !== med.image) {
        med.image = image;
        await med.save();
      }
    }

    if (!targetMedicineId) {
      return errorResponse(res, 400, 'يرجى تحديد الدواء أو إدخال اسمه');
    }

    // Check if already in inventory
    let inventoryItem = await PharmacyInventory.findOne({
      pharmacyId: pharmacy._id,
      medicineId: targetMedicineId,
    });

    if (inventoryItem) {
      inventoryItem.quantity += Number(quantity);
      if (customPrice !== undefined) inventoryItem.customPrice = Number(customPrice);
      if (costPrice !== undefined) inventoryItem.costPrice = Number(costPrice);
      if (shelfLocation !== undefined) inventoryItem.shelfLocation = shelfLocation;
      if (expiryDate) inventoryItem.expiryDate = expiryDate;
      if (batchNumber) inventoryItem.batchNumber = batchNumber;
      await inventoryItem.save();
    } else {
      inventoryItem = await PharmacyInventory.create({
        pharmacyId: pharmacy._id,
        medicineId: targetMedicineId,
        quantity: Number(quantity),
        customPrice: customPrice ? Number(customPrice) : undefined,
        costPrice: costPrice ? Number(costPrice) : undefined,
        shelfLocation: shelfLocation || '',
        expiryDate: expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        batchNumber: batchNumber || 'BATCH-' + Math.floor(1000 + Math.random() * 9000),
        lowStockThreshold: Number(lowStockThreshold),
      });
    }

    const populated = await PharmacyInventory.findById(inventoryItem._id).populate(
      'medicineId',
      'nameAr nameEn price activeIngredient category dosageForm image'
    );

    return successResponse(res, 201, 'تمت إضافة الدواء إلى المخزون بنجاح', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update inventory item (quantity, price, expiry, shelf, cost)
// @route   PUT /api/inventory/:id
// @access  Private (Pharmacist)
const updateInventoryItem = async (req, res, next) => {
  try {
    const pharmacy = await getUserPharmacy(req.user._id);
    if (!pharmacy) {
      return errorResponse(res, 404, 'لم يتم العثور على صيدلية');
    }

    const { id } = req.params;
    const { quantity, customPrice, costPrice, shelfLocation, batchNumber, expiryDate, isAvailable, lowStockThreshold, image } = req.body;

    const item = await PharmacyInventory.findOne({
      _id: id,
      pharmacyId: pharmacy._id,
    });

    if (!item) {
      return errorResponse(res, 404, 'عنصر المخزون غير موجود');
    }

    if (quantity !== undefined) item.quantity = Number(quantity);
    if (customPrice !== undefined) item.customPrice = Number(customPrice);
    if (costPrice !== undefined) item.costPrice = Number(costPrice);
    if (shelfLocation !== undefined) item.shelfLocation = shelfLocation;
    if (batchNumber !== undefined) item.batchNumber = batchNumber;
    if (expiryDate) item.expiryDate = expiryDate;
    if (typeof isAvailable === 'boolean') item.isAvailable = isAvailable;
    if (lowStockThreshold !== undefined) item.lowStockThreshold = Number(lowStockThreshold);

    await item.save();

    if (image && item.medicineId) {
      const med = await Medicine.findById(item.medicineId);
      if (med && med.image !== image) {
        med.image = image;
        await med.save();
      }
    }

    const populated = await PharmacyInventory.findById(item._id).populate(
      'medicineId',
      'nameAr nameEn price activeIngredient category dosageForm image'
    );

    return successResponse(res, 200, 'تم تحديث المخزون بنجاح', populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item from inventory
// @route   DELETE /api/inventory/:id
// @access  Private (Pharmacist)
const deleteInventoryItem = async (req, res, next) => {
  try {
    const pharmacy = await getUserPharmacy(req.user._id);
    if (!pharmacy) {
      return errorResponse(res, 404, 'لم يتم العثور على صيدلية');
    }

    const { id } = req.params;
    const item = await PharmacyInventory.findOneAndDelete({
      _id: id,
      pharmacyId: pharmacy._id,
    });

    if (!item) {
      return errorResponse(res, 404, 'عنصر المخزون غير موجود');
    }

    return successResponse(res, 200, 'تم حذف الدواء من المخزون بنجاح');
  } catch (error) {
    next(error);
  }
};

// @desc    Get low stock items for notifications/alerts
// @route   GET /api/inventory/low-stock
// @access  Private (Pharmacist)
const getLowStockItems = async (req, res, next) => {
  try {
    const pharmacy = await getUserPharmacy(req.user._id);
    if (!pharmacy) {
      return errorResponse(res, 404, 'لم يتم العثور على صيدلية');
    }

    const lowStockItems = await PharmacyInventory.find({
      pharmacyId: pharmacy._id,
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    }).populate('medicineId', 'nameAr nameEn price category');

    return successResponse(res, 200, 'تم جلب تنبيهات النواقص', lowStockItems);
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk import medicines to pharmacy inventory
// @route   POST /api/inventory/bulk-import
// @access  Private (Pharmacist, Admin)
const bulkImportInventory = async (req, res, next) => {
  try {
    const pharmacy = await getUserPharmacy(req.user._id);
    if (!pharmacy) {
      return errorResponse(res, 404, 'لم يتم العثور على صيدلية مرتبطة بهذا الحساب');
    }

    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return errorResponse(res, 400, 'يرجى إرسال قائمة أدوية صالحة للاستيراد');
    }

    let addedCount = 0;
    let updatedCount = 0;
    const errors = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const name = (item.medicineName || item.nameAr || item.name || '').trim();
      if (!name && !item.medicineId) {
        errors.push(`الصف #${i + 1}: اسم الدواء أو معرّفه مطلوب`);
        continue;
      }

      let targetMedId = item.medicineId;
      if (!targetMedId && name) {
        let med = await Medicine.findOne({
          $or: [
            { nameAr: name },
            { nameEn: new RegExp('^' + name + '$', 'i') }
          ]
        });
        if (!med) {
          med = await Medicine.create({
            nameAr: name,
            nameEn: item.nameEn || name,
            activeIngredient: item.activeIngredient || 'عام',
            category: item.category || 'أدوية عامة',
            price: Number(item.customPrice || item.price) || 25,
            status: 'active'
          });
        }
        targetMedId = med._id;
      }

      let existing = await PharmacyInventory.findOne({
        pharmacyId: pharmacy._id,
        medicineId: targetMedId
      });

      const qty = Number(item.quantity) || 0;
      const price = item.customPrice !== undefined ? Number(item.customPrice) : (item.price ? Number(item.price) : undefined);
      const expiry = item.expiryDate ? new Date(item.expiryDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      const batch = item.batchNumber || 'BATCH-' + Math.floor(1000 + Math.random() * 9000);

      if (existing) {
        existing.quantity += qty;
        if (price !== undefined) existing.customPrice = price;
        if (item.expiryDate) existing.expiryDate = expiry;
        if (item.batchNumber) existing.batchNumber = batch;
        await existing.save();
        updatedCount++;
      } else {
        await PharmacyInventory.create({
          pharmacyId: pharmacy._id,
          medicineId: targetMedId,
          quantity: qty,
          customPrice: price,
          expiryDate: expiry,
          batchNumber: batch,
          lowStockThreshold: Number(item.lowStockThreshold) || 5
        });
        addedCount++;
      }
    }

    return successResponse(res, 200, 'تم استيراد مخزون الأدوية بنجاح', {
      addedCount,
      updatedCount,
      totalProcessed: items.length,
      errors
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyInventory,
  addToInventory,
  updateInventoryItem,
  deleteInventoryItem,
  getLowStockItems,
  bulkImportInventory,
};

