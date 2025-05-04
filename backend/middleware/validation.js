const { body, validationResult } = require('express-validator');

// Validation middleware to check request bodies
const validate = (validations) => {
  return async (req, res, next) => {
    for (let validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      errors: errors.array()
    });
  };
};

// Common validations
const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('walletAddress')
    .notEmpty()
    .withMessage('Wallet address is required')
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum wallet address format')
];

const loginValidation = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const projectValidation = [
  body('name')
    .notEmpty()
    .withMessage('Project name is required'),
  body('description')
    .notEmpty()
    .withMessage('Description is required'),
  body('location.country')
    .notEmpty()
    .withMessage('Country is required'),
  body('projectType')
    .notEmpty()
    .withMessage('Project type is required')
    .isIn(['reforestation', 'avoided_deforestation', 'renewable_energy', 'energy_efficiency', 'methane_capture', 'other'])
    .withMessage('Invalid project type'),
  body('methodology')
    .notEmpty()
    .withMessage('Methodology is required'),
  body('estimatedCredits')
    .notEmpty()
    .withMessage('Estimated credits are required')
    .isNumeric()
    .withMessage('Estimated credits must be a number'),
  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isDate()
    .withMessage('Invalid start date format'),
  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isDate()
    .withMessage('Invalid end date format')
];

const carbonCreditValidation = [
  body('projectId')
    .notEmpty()
    .withMessage('Project ID is required'),
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isInt({ min: 1 })
    .withMessage('Amount must be at least 1'),
  body('vintage')
    .notEmpty()
    .withMessage('Vintage year is required')
    .isDate()
    .withMessage('Invalid vintage date format')
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  projectValidation,
  carbonCreditValidation
};
