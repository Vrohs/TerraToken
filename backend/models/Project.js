const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a project name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  location: {
    country: {
      type: String,
      required: [true, 'Please add a country']
    },
    region: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  projectType: {
    type: String,
    required: [true, 'Please add a project type'],
    enum: [
      'reforestation',
      'avoided_deforestation',
      'renewable_energy',
      'energy_efficiency',
      'methane_capture',
      'other'
    ]
  },
  methodology: {
    type: String,
    required: [true, 'Please add a methodology']
  },
  developer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  validator: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  documents: [{
    name: String,
    fileUrl: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  estimatedCredits: {
    type: Number,
    required: [true, 'Please estimate the amount of carbon credits']
  },
  issuedCredits: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending'
  },
  externalRegistryId: String,
  blockchainReference: {
    tokenId: String,
    transactionHash: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Project', ProjectSchema);