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
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const { scriptSrcUrls, styleSrcUrls, connectSrcUrls, fontSrcUrls } = require('./helmet/contentSecurityPolicy');
const MongoStore = require('connect-mongo');
require('dotenv').config()

const campgroundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review.js');
const userRoutes = require('./routes/user');

const db_url = process.env.MONGO_ATLAS_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(db_url)
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

const sessionSecret = process.env.SESSION_SECRET || 'aplaceholdersecretfornow';

app.use(session({
    secret: sessionSecret,
    store: MongoStore.create({
        mongoUrl: db_url,
        touchAfter: 24 * 60 * 60
    }),
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7),
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

app.use(flash());
app.use(mongoSanitize({ replaceWith: '_' }));
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin'},
    contentSecurityPolicy: {
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/tonyhchao/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        }
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    if (!['/login', '/register', '/'].includes(req.originalUrl)) {
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
        .render('error', {
            err: err
        });
});

const port = process.env.PORT || 3000;

app.listen(port, function() {
    console.log(`Serving on port ${port}`);
});