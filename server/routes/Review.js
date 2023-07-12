const express = require('express');
const reviewRouter = express.Router({ mergeParams: true });
const reviewController = require('../controllers/Reviews/Review');
const {isLoggedIn}=require('../middleware')

reviewRouter.post('/', isLoggedIn,reviewController.addReview)
.delete('/:reviewId', isLoggedIn,reviewController.deleteReview)

module.exports=reviewRouter

