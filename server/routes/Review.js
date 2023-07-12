const express = require('express');
const reviewRouter = express.Router({ mergeParams: true });
const reviewController = require('../controllers/Reviews/Review');

reviewRouter.post('/', reviewController.addReview)
.delete('/:reviewId', reviewController.deleteReview)

module.exports=reviewRouter

