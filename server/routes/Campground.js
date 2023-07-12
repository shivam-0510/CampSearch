const express = require('express');
const campgroundRouter = express.Router();
const campgroundController = require('../controllers/Campgrounds/Campground');
const {
    isLoggedIn,
    isAuthor
} = require('../middleware')

campgroundRouter.get('/', campgroundController.getCampgrounds)
    .get('/new', isLoggedIn, campgroundController.newCampground)
    .post('/new', isLoggedIn, campgroundController.makeNewCampground)
    .get('/:id', campgroundController.getOneCampground)
    .get('/:id/edit', isLoggedIn, isAuthor, campgroundController.editCampground)
    .put('/:id', isLoggedIn, isAuthor, campgroundController.editOneCampground)
    .delete('/:id', isLoggedIn, isAuthor, campgroundController.deleteCampground)

module.exports = campgroundRouter