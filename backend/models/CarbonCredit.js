const mongoose = require('mongoose');

const CarbonCreditSchema = new mongoose.Schema({
  tokenId: {
    type: String,
    required: true,
    unique: true
  },
  project: {
    type: mongoose.Schema.ObjectId,
    ref: 'Project',
    required: true
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [1, 'Amount must be at least 1']
  },
  vintage: {
    type: Date,
    required: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'retired', 'transferred'],
    default: 'active'
  },
  issuanceDate: {
    type: Date,
    default: Date.now
  },
  retirementDate: Date,
  retirementBeneficiary: String,
  retirementReason: String,
  certificateUrl: String,
  transactionHistory: [{
    transactionType: {
      type: String,
      enum: ['issuance', 'transfer', 'retirement']
    },
    fromAddress: String,
    toAddress: String,
    amount: Number,
    transactionHash: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  price: {
    type: Number,
    default: 0
  },
  forSale: {
    type: Boolean,
    default: false
  },
  metadata: {
    ipfsHash: String,
    additionalAttributes: mongoose.Schema.Types.Mixed
  }
});

module.exports = mongoose.model('CarbonCredit', CarbonCreditSchema);