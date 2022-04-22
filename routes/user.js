const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsyncError = require('../utilities/catchAsyncError');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegisterForm)
    .post(catchAsyncError (users.register));

router.route('/login')
    .get(users.renderLoginForm)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

router.get('/logout', users.logout);
    
module.exports = router;