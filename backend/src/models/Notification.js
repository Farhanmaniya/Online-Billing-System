const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'error'],
    default: 'info',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  entityType: {
    type: String, // e.g., 'Invoice', 'Payment'
    required: false,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false, // Made optional to be safe, though user said required.
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Notification', notificationSchema);
