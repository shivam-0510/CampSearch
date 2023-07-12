const User = require('../../models/User')
const express = require('express')
const userRouter = express.Router()
const catchAsync = require('../../utilities/catchAsync')
const passport = require('passport');
const {storeReturnTo} = require('../../middleware')

//REGISTER ROUTE
userRouter.get('/register', (req, res) => {
    res.render('users/register')
})
userRouter.post('/register', catchAsync(async (req, res, next) => {
    try {
        const {
            email,
            username,
            password
        } = req.body;
        const user = new User({
            email,
            username
        });
        const newUser = await User.register(user, password);
        await newUser.save();
        req.login(newUser, err => {
            if (err) {
                return next();
            }
            req.flash('success', 'Welcome!!!')
            res.redirect('/campgrounds');
        })
    } catch (e) {
        req.flash('error', e.message)
        res.redirect('/register')
    }

}))


//LOGIN ROUTE
userRouter.get('/login', (req, res) => {
    res.render('users/login')
})
userRouter.post('/login', storeReturnTo, passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login'
}), catchAsync(async (req, res) => {
    req.flash('success', 'welcome back!')
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}))

//LOGOUT ROUTE
userRouter.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
})
module.exports = userRouter;