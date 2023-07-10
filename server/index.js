const express = require('express')
const server = express();
const path = require('path')
const mongoose = require('mongoose')
const Campground = require('./models/campground')
const Review = require('./models/review')
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const catchAsync = require('./utilities/catchAsync')
const ExpressErr = require('./utilities/ExpressErr')
const {
    campgroundSchema,
    reviewSchema
} = require('./scheams.js')

mongoose.connect('mongodb://localhost:27017/yelp-camp')
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once("open", () => {
    console.log("Database connected");
})

server.engine('ejs', ejsMate)
server.set('view engine', 'ejs')
server.set('views', path.join(__dirname, 'views'))
server.use(express.urlencoded({
    extended: true
}))
server.use(methodOverride('_method'))

const validateCampground = (req, res, next) => {
    const {
        error
    } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join('.')
        throw new ExpressErr(msg, 400)
    } else {
        next();
    }
}

const validateReview = (req, res, next) => {
    const {
        error
    } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join('.')
        throw new ExpressErr(msg, 400)
    } else {
        next();
    }
}

server.get('/', (req, res) => {
    res.render("home")
})

server.get('/makecampground', async (req, res) => {
    const camp = new Campground({
        title: 'My backyard'
    })
    await camp.save();
    res.send(camp);
})

server.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {
        campgrounds
    });
}))

server.get('/campgrounds/new', catchAsync((req, res) => {
    res.render('campgrounds/new')
}))

server.post('/campgrounds/new', validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

server.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', {
        campground
    })
}))

server.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {
        campground
    })
}))

server.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const {
        id
    } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground
    });
    res.redirect(`/campgrounds/${campground._id}`)
}))

server.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const {
        id
    } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

server.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

server.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const {
        id,
        reviewId
    } = req.params
    await Campground.findByIdAndUpdate(id, {
        $pull: {
            reviews: reviewId
        }
    });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
}))

server.all('*', (req, res, next) => {
    next(new ExpressErr("Page not Found", 404))
})

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