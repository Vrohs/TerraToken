const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  tokenId: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['Mint', 'Transfer', 'Listing', 'Purchase', 'Cancellation', 'Retirement'],
    required: true
  },
  from: {
    type: String, // Wallet address
    required: function() {
      return this.type !== 'Mint'; // Not required for minting
    }
  },
  to: {
    type: String, // Wallet address
    required: function() {
      return ['Transfer', 'Purchase'].includes(this.type);
    }
  },
  amount: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: function() {
      return ['Listing', 'Purchase'].includes(this.type);
    }
  },
  transactionHash: {
    type: String,
    required: true
  },
  blockNumber: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);