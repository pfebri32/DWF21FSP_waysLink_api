// Imports.
const express = require('express');

// Middlewares.
const { auth } = require('../../middlewares/auth');
const { upload } = require('../../middlewares/v2/upload');

// Router.
const router = express.Router();

// Controllers.
const { login, register, validate } = require('../../controllers/auth');
const { updateSelf, deleteSelf } = require('../../controllers/user');
const {
  getTemplateById,
  getAllTemplates,
  addTemplate,
} = require('../../controllers/template');
const {
  addContent,
  getContentsSelf,
  getContentByLink,
  deleteContentById,
  getContentById,
  updateContentById,
} = require('../../controllers/v2/content');

// Auth routes.
router.get('/validate', auth, validate);
router.post('/login', login);
router.post('/register', register);

// User routes.
router.patch('/user', auth, updateSelf);
router.delete('/user', auth, deleteSelf);

// Template routes.
router.get('/template/:id', getTemplateById);
router.post(
  '/template',
  auth,
  upload([{ name: 'img', maxCount: 1 }]),
  addTemplate
);

// Templates routes.
router.get('/templates', auth, getAllTemplates);

// Content routes.
router.get('/content/view/:link', getContentByLink);
router.get('/content/:id', getContentById);
router.post(
  '/content',
  auth,
  upload([{ name: 'img', maxCount: 1 }, { name: 'imgLinks' }]),
  addContent
);
router.patch(
  '/content/:id',
  auth,
  upload([{ name: 'img', maxCount: 1 }, { name: 'imgLinks' }]),
  updateContentById
);
router.delete('/content/:id', auth, deleteContentById);

// Contents.
router.get('/contents', auth, getContentsSelf);

module.exports = router;
