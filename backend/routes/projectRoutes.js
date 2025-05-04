const express = require('express');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  verifyProject,
  getUserProjects
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const { validate, projectValidation } = require('../middleware/validation');

const router = express.Router();

router.route('/')
  .get(getProjects)
  .post(protect, authorize('project_developer', 'admin'), validate(projectValidation), createProject);

router.route('/:id')
  .get(getProject)
  .put(protect, updateProject)
  .delete(protect, deleteProject);

router.route('/:id/verify')
  .put(protect, authorize('validator', 'admin'), verifyProject);

router.route('/user/:userId')
  .get(protect, getUserProjects);

module.exports = router;
