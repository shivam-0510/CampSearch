const express = require('express')
const server = express();
const path = require('path')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressErr = require('./utilities/ExpressErr')
const campgroundRouter = require('./routes/Campground')
const reviewRouter = require('./routes/Review')
const session=require('express-session')
const flash=require('connect-flash')
const passport=require('passport')
const localStrategy=require('passport-local')
const User=require('./models/User')
const userRouter=require('./routes/auth/User')

//MONGODB CONNECTION
mongoose.connect('mongodb://localhost:27017/yelp-camp')
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once("open", () => {
    console.log("Database connected");
})

//ENABLING EJS
server.engine('ejs', ejsMate)
server.set('view engine', 'ejs')

//PATH VIEWS DIRECTORY
server.set('views', path.join(__dirname, 'views'))
server.use(express.urlencoded({
    extended: true
}))
server.use(methodOverride('_method'))
server.use(express.static(path.join(__dirname, 'public')))

//SESSION CONFIGURATION
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
server.use(session(sessionConfig))
server.use(flash());

server.use(passport.initialize())
server.use(passport.session())
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

server.use((req, res, next) => {
    res.locals.currentUser=req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})



//CAMPGROUNDS ROUTE
server.use('/campgrounds', campgroundRouter)

//REVIEW ROUTE
server.use('/campgrounds/:id/reviews', reviewRouter)

//USER ROUTE
server.use('/',userRouter);

//IF ANY PAGE IN NOT VALID OR FOUND
server.all('*', (req, res, next) => {
    next(new ExpressErr("Page not Found", 404))
})

//ERROR MIDDLEWARE
server.use((err, req, res, next) => {
    const {
        statusCode = 500
    } = err;
    if (!err.message) err.message = "Something went wrong"
    res.status(statusCode).render('error', {
        err
    });
})

server.listen(3000, () => {
    console.log("SERVER STARTED AT PORT 3000")
})