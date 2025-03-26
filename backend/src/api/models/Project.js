const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: [true, 'Please provide a project name'],
    trim: true
  },
  projectType: {
    type: String,
    required: [true, 'Please provide a project type'],
    enum: [
      'Renewable Energy',
      'Forest Conservation',
      'Reforestation',
      'Methane Capture',
      'Energy Efficiency',
      'Agricultural Management',
      'Other'
    ]
  },
  location: {
    type: String,
    required: [true, 'Please provide a location']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide an end date']
  },
  estimatedCredits: {
    type: Number,
    required: [true, 'Please provide estimated credits']
  },
  methodology: {
    type: String,
    required: [true, 'Please provide methodology']
  },
  contactName: {
    type: String,
    required: [true, 'Please provide a contact name']
  },
  contactEmail: {
    type: String,
    required: [true, 'Please provide a contact email']
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  documents: [{
    name: String,
    description: String,
    ipfsCid: String,
    ipfsUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  verificationStatus: {
    type: String,
    enum: ['not_submitted', 'pending', 'approved', 'rejected'],
    default: 'not_submitted'
  },
  verificationDetails: {
    verifier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    comments: String,
    reportCid: String,
    reportUrl: String
  },
  blockchainDetails: {
    registered: {
      type: Boolean,
      default: false
    },
    tokenId: Number,
    registrationTxHash: String,
    registeredAt: Date
  },
  issuedCredits: {
    type: Number,
    default: 0
  },
  retiredCredits: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', ProjectSchema);