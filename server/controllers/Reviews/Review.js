const catchAsync = require('../../utilities/catchAsync')
const Review = require('../../models/review')
const Campground = require('../../models/campground')
const ExpressErr = require('../../utilities/ExpressErr')
const { reviewSchema } = require('../../scheams.js');

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

//ADD REVIEW
exports.addReview = (validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

//DELETE REVIEW
exports.deleteReview = (catchAsync(async (req, res) => {
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
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
}))