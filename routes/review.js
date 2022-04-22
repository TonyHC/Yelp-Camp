const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsyncError = require('../utilities/catchAsyncError');
const { validateReview, validateReviewAuthor, isLoggedIn } = require('../middleware');
const reviews = require('../controllers/reviews');

router.post('/', isLoggedIn, validateReview, catchAsyncError(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, validateReviewAuthor, catchAsyncError(reviews.deleteReview));

module.exports = router;