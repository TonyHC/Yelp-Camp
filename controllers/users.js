const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/campgrounds');
    }

    res.render('users/register');
}

module.exports.register = async (req, res) => {
    /*
        Override the error handling middleware by using another try-block to handle the error differently.
        If an error occurs during the registration process, flash a error message and redirect user back to the register page.
    */
    try {
        const { username, email, password } = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
       
        // Creates a new session and login the registered user if no error occurred
        req.login(registeredUser, function(err) {
            if (err) {
                return next(err);
            } 

            req.flash('success', 'Successfully created new user');
            res.redirect('/campgrounds');
        });
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/register');
    }
}

module.exports.renderLoginForm = (req, res) => {
    if (req.isAuthenticated()) {
        return res.redirect('/campgrounds');
    }

    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'Welcome to YelpCamp');
    const redirectUrl = req.session.returnTo || '/campgrounds'; // Store either request page url from req.session.returnTo or campgrounds route
    delete req.session.returnTo; // Delete the returnTo field from session
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Successfully logged out');
    res.redirect('/campgrounds');
}