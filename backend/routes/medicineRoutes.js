const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicineById,
  getMedicineAlternatives,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  bulkImportMedicines,
  getEgyptianDrugRegistry,
  syncEgyptianDrugCatalog,
} = require('../controllers/medicineController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { validateMedicine } = require('../middlewares/validationMiddleware');

router.get('/egypt-registry', getEgyptianDrugRegistry);
router.post('/sync-egypt-registry', protect, authorize('admin'), syncEgyptianDrugCatalog);
router.post('/bulk-import', protect, authorize('admin'), bulkImportMedicines);

router.route('/')
  .get(getMedicines)
  .post(protect, authorize('admin', 'pharmacist'), validateMedicine, createMedicine);

router.get('/:id/alternatives', getMedicineAlternatives);

router.route('/:id')
  .get(getMedicineById)
  .put(protect, authorize('admin'), validateMedicine, updateMedicine)
  .delete(protect, authorize('admin'), deleteMedicine);

module.exports = router;
