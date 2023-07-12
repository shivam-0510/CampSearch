const express = require('express');
const campgroundRouter = express.Router();
const campgroundController = require('../controllers/Campgrounds/Campground');

campgroundRouter.get('/', campgroundController.getCampgrounds)
    .get('/new', campgroundController.newCampground)
    .post('/new', campgroundController.makeNewCampground)
    .get('/:id', campgroundController.getOneCampground)
    .get('/:id/edit', campgroundController.editCampground)
    .put('/:id', campgroundController.editOneCampground)
    .delete('/:id', campgroundController.deleteCampground)

module.exports = campgroundRouter