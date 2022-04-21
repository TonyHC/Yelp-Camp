const Campground = require('./models/campground');
const { campgroundSchema } = require('./schemas');
const ExpressError = require('./utilities/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be logged in');
        return res.redirect('/login');
    }

    next();
}

module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);

    if (error) {
        const errorMessage = error.details.map(el => el.message).join(',');
        throw new ExpressError(errorMessage, 400);
    }

    next();
}

module.exports.validateAuthor = async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
        
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/campgrounds/${campground._id}`);
    }

    next();
}