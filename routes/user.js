const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsyncError = require('../utilities/catchAsyncError');
const User = require('../models/user');

router.route('/register')
    .get((req, res) => {
        res.render('users/register');
    })
    .post(catchAsyncError (async (req, res) => {
        /*
            Override the error handling middleware by using another try-block to handle the error differently.
            If an error occurs during the registration process, flash a error message and redirect user back to the register page.
        */
        try {
            const { username, email, password } = req.body;
            const user = new User({email, username});
            const registeredUser = await User.register(user, password);
            
            req.flash('success', 'Successfully created new user');
            res.redirect('/campgrounds');
        } catch (err) {
            req.flash('error', err.message);
            res.redirect('/register');
        }
    }));

router.route('/login')
    .get((req, res) => {
        res.render('users/login')
    })
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
        req.flash('success', 'Successfully login');
        res.redirect('/campgrounds');
    });

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logged out');
    res.redirect('campgrounds');
})
    
module.exports = router;