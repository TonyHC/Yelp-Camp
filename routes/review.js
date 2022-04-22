const express = require('express');
const router = express.Router({mergeParams: true});
const Campground = require('../models/campground');
const Review = require('../models/review');
const catchAsyncError = require('../utilities/catchAsyncError');
const { validateReview, validateReviewAuthor, isLoggedIn } = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsyncError(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;

    campground.reviews.push(review);
    await campground.save();
    await review.save();

    req.flash('success', 'Successfully created new review')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', isLoggedIn, validateReviewAuthor, catchAsyncError(async (req, res) => {
    const { id, reviewId } = req.params;

    const campground = await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}, {runValidators: true});
    await Review.findByIdAndDelete(reviewId);

    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${campground._id}`);
}));

module.exports = router;