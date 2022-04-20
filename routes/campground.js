const express = require('express');
const router = express.Router();
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');
const ExpressError = require('../utilities/ExpressError');
const catchAsyncError = require('../utilities/catchAsyncError');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',');
        throw new ExpressError(errorMessage, 400);
    }

    next();
}

router.route('/')
    .get(catchAsyncError(async (req, res) => {
        const campgrounds = await Campground.find({});

        res.render('campgrounds/index', {
            campgrounds: campgrounds
        });
    }))
    .post(validateCampground, catchAsyncError(async (req, res) => {
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    }));

router.get('/new', (req, res) => {
    res.render('campgrounds/new');
});

router.route('/:id')
    .get(catchAsyncError(async (req, res) => {
        const campground = await Campground.findById(req.params.id).populate('reviews');

        res.render('campgrounds/details', {
            campground: campground
        });
    }))
    .put(validateCampground, catchAsyncError(async (req, res) => {
        const campground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
        res.redirect(`/campgrounds/${campground._id}`);
    }))
    .delete(catchAsyncError(async (req, res) => {
        await Campground.findByIdAndDelete(req.params.id);
        res.redirect('/campgrounds');
    }));

router.get('/:id/edit', catchAsyncError(async (req, res) => {
    const campground = await Campground.findById(req.params.id);

    res.render('campgrounds/edit', {
        campground: campground
    });
}));

module.exports = router;