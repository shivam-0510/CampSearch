const express = require('express');
const campgroundRouter = express.Router();
const campgroundController = require('../controllers/Campgrounds/Campground');
const {
    isLoggedIn,
    isAuthor
} = require('../middleware')
const multer=require('multer')
const { storage } = require('../cloudinary');
const upload=multer({storage})

campgroundRouter.get('/', campgroundController.getCampgrounds)
    .get('/new', isLoggedIn, campgroundController.newCampground)
    .post('/new', isLoggedIn, upload.array('image'),campgroundController.makeNewCampground)
    .get('/:id', campgroundController.getOneCampground)
    .get('/:id/edit', isLoggedIn, isAuthor, campgroundController.editCampground)
    .put('/:id', isLoggedIn, isAuthor, upload.array('image'),campgroundController.editOneCampground)
    .delete('/:id', isLoggedIn, isAuthor, campgroundController.deleteCampground)

module.exports = campgroundRouter