const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const catchAsyncError = require('../utilities/catchAsyncError');
const { isLoggedIn } = require('../middleware');
const { validateAuthor, validateCampground } = require('../middleware');

router.route('/')
    .get(catchAsyncError(async (req, res) => {
        const campgrounds = await Campground.find({});

        res.render('campgrounds/index', {
            campgrounds: campgrounds
        });
    }))
    .post(isLoggedIn, validateCampground, catchAsyncError(async (req, res) => {
        const campground = new Campground(req.body.campground);
        campground.author = req.user._id;
        await campground.save();
        
        req.flash('success', 'Successfully created new campground');
        res.redirect(`/campgrounds/${campground._id}`);
    }));

router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

router.route('/:id')
    .get(catchAsyncError(async (req, res) => {
        const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');

        if (!campground) {
            req.flash('error', 'Cannot find that campground!');
            return res.redirect('/campgrounds');
        }

        res.render('campgrounds/details', {
            campground: campground
        });
    }))
    .put(validateCampground, isLoggedIn, validateAuthor, catchAsyncError(async (req, res) => {
        const campground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
        
        req.flash('success', 'Successfully updated campground info')
        res.redirect(`/campgrounds/${campground._id}`);
    }))
    .delete(isLoggedIn, validateAuthor, catchAsyncError(async (req, res) => {
        await Campground.findByIdAndDelete(req.params.id);
        req.flash('success', 'Successfully deleted campground')
        res.redirect('/campgrounds');
    }));

router.get('/:id/edit', isLoggedIn, validateAuthor, catchAsyncError(async (req, res) => {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', {
        campground: campground
    });
}));

module.exports = router;