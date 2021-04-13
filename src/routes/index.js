// Imports.
const express = require('express');

// Middlewares.
const { auth } = require('../middlewares/auth');
const { uploadFile, uploadFiles } = require('../middlewares/upload');

// Router.
const router = express.Router();

// Controllers.
const { login, register, validate } = require('../controllers/auth');
const { updateSelf, deleteSelf } = require('../controllers/user');
const {
  addTemplate,
  getAllTemplates,
  getTemplateById,
} = require('../controllers/template');
const { uploadImage } = require('../controllers/upload');
const {
  addContent,
  getContent,
  getContentsByUserId,
  deleteContentById,
} = require('../controllers/templatecontent');

// Auth routes.
router.get('/validate', auth, validate);
router.post('/login', login);
router.post('/register', register);

// Self routes.
router.patch('/user', auth, updateSelf);
router.delete('/user', auth, deleteSelf);

// Template routes.
router.get('/template/:id', auth, getTemplateById);
router.post('/template', auth, uploadFile('img'), addTemplate);

// Templates routes.
router.get('/templates', auth, getAllTemplates);

// Content routes.
router.get('/content/:id', getContent);
router.post('/content', auth, addContent);
router.delete('/content/:id', auth, deleteContentById);

// Contens routes.
router.get('/contents/:id', auth, getContentsByUserId);

// Upload routes.
router.post('/upload-file', uploadFile('img'), uploadImage);
// router.post('/upload-files', uploadFiles('img'), uploadImage);

module.exports = router;
