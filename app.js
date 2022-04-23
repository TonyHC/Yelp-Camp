const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utilities/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
require('dotenv').config()

const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review.js');
const userRoutes = require('./routes/user');

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
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'aplaceholdersecretfornow',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if(!['/login', '/register', '/'].includes(req.originalUrl)) {
        // Store the url path of requested page 
        req.session.returnTo = req.originalUrl; 
    }

    res.locals.flashMessages = [
        {
            key: 'success',
            value: req.flash('success')
        },
        {
            key: 'danger',
            value: req.flash('error')
        }
    ];
    res.locals.currentUser = req.user;
    next();
});

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
    res.render('home');
});

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