const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  projectType: {
    type: String,
    required: true,
    enum: ['Renewable Energy', 'Forest Conservation', 'Reforestation', 
           'Methane Capture', 'Energy Efficiency', 'Agricultural Management', 'Other']
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  estimatedCredits: {
    type: Number,
    required: true
  },
  methodology: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactName: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    required: true
  },
  documents: [{
    name: String,
    description: String,
    ipfsHash: String,
    uploadDate: Date
  }],
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  verificationData: {
    verifier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: Date,
    comments: String,
    ipfsHash: String
  },
  tokenId: {
    type: Number,
    sparse: true // Allow null until verified
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);