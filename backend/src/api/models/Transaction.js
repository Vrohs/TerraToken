const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mint', 'transfer', 'retirement', 'listing', 'purchase', 'cancel_listing'],
    required: true
  },
  sender: {
    type: String,
    required: true
  },
  recipient: {
    type: String
  },
  tokenId: {
    type: Number,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  price: {
    type: Number
  },
  currency: {
    type: String,
    default: 'MATIC'
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  txHash: {
    type: String,
    required: true
  },
  blockNumber: {
    type: Number
  },
  blockTimestamp: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema);