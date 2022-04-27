const express = require('express');
const router = express.Router();
const catchAsyncError = require('../utilities/catchAsyncError');
const { isLoggedIn } = require('../middleware');
const { validateAuthor, validateCampground, validateSearchQuery } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer');
const { storage } = require('../cloudinary/config');
const upload = multer({ storage })

router.route('/')
    .get(validateSearchQuery, catchAsyncError(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground , catchAsyncError(campgrounds.createCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsyncError(campgrounds.showCampground))
    .patch(isLoggedIn, validateAuthor, upload.array('image'), validateCampground, catchAsyncError(campgrounds.updateCampground))
    .delete(isLoggedIn, validateAuthor, catchAsyncError(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, validateAuthor, catchAsyncError(campgrounds.renderEditForm));

router.get('/:id/imageUpload', isLoggedIn, validateAuthor, catchAsyncError(campgrounds.renderImageUploadForm));

module.exports = router;