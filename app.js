const express = require('express');
const ejs = require('ejs');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const Campground = require('./models/campground');
const Review = require('./models/review');
const ExpressError = require('./utilities/ExpressError');
const catchAsyncError = require('./utilities/catchAsyncError');
const { campgroundSchema, reviewSchema } = require('./schemas');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log("Database connected");
    })
    .catch(err => {
        console.log("Connection error: ", err);
    });

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); // Built-in middleware that runs during request/response lifecycle
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home');
});

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',');
        throw new ExpressError(errorMessage, 400);
    }

    next();
}

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);

    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',');
        throw new ExpressError(errorMessage, 400);
    }

    next();
}

app.get('/campgrounds', catchAsyncError(async (req, res) => {
    const campgrounds = await Campground.find({});

    res.render('campgrounds/index', {
        campgrounds: campgrounds
    });
}));

app.post('/campgrounds', validateCampground,  catchAsyncError(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.get('/campgrounds/:id', catchAsyncError(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');

    res.render('campgrounds/details', {
        campground: campground
    });
}));

app.put('/campgrounds/:id', validateCampground, catchAsyncError(async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(req.params.id, req.body.campground);
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsyncError(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
}));

app.get('/campgrounds/:id/edit', catchAsyncError(async (req, res) => {
    const campground = await Campground.findById(req.params.id);

    res.render('campgrounds/edit', {
        campground: campground
    });
}));

app.post('/campgrounds/:id/reviews', validateReview, catchAsyncError(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);

    campground.reviews.push(review);
    await campground.save();
    await review.save();

    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsyncError(async (req, res) => {
    const { id, reviewId } = req.params;

    const campground = await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}}, {runValidators: true});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/campgrounds/${campground._id}`);
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode)
        .render('error',{
            err: err
        });
});

app.listen(3000, function() {
    console.log("Running on port 3000");
});