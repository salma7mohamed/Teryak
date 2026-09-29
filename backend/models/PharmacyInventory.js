const mongoose = require('mongoose');

const pharmacyInventorySchema = new mongoose.Schema(
  {
    pharmacyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pharmacy',
      required: true,
      index: true,
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'الكمية مطلوبة'],
      min: [0, 'الكمية لا يمكن أن تكون سالبة'],
      default: 10,
    },
    customPrice: {
      type: Number,
      min: [0, 'السعر لا يمكن أن يكون سالباً'],
    },
    costPrice: {
      type: Number,
      min: [0, 'سعر التكلفة لا يمكن أن يكون سالباً'],
    },
    shelfLocation: {
      type: String,
      default: '',
    },
    expiryDate: {
      type: Date,
      default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year ahead
    },
    batchNumber: {
      type: String,
      default: () => 'BATCH-' + Math.floor(1000 + Math.random() * 9000),
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate inventory entry for same medicine in same pharmacy
pharmacyInventorySchema.index({ pharmacyId: 1, medicineId: 1 }, { unique: true });

module.exports = mongoose.model('PharmacyInventory', pharmacyInventorySchema);
