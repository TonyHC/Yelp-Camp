const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const catchAsyncError = require('../utilities/catchAsyncError');
const { isLoggedIn } = require('../middleware');
const { validateAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');

router.route('/')
    .get(catchAsyncError(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsyncError(campgrounds.createCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(catchAsyncError(campgrounds.showCampground))
    .put(validateCampground, isLoggedIn, validateAuthor, catchAsyncError(campgrounds.updateCampground))
    .delete(isLoggedIn, validateAuthor, catchAsyncError(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, validateAuthor, catchAsyncError(campgrounds.renderEditForm));

module.exports = router;