const catchAsync = require('../../utilities/catchAsync')
const Campground = require('../../models/campground')
const ExpressErr = require('../../utilities/ExpressErr')
const {
    campgroundSchema
} = require('../../scheams.js');
const {
    cloudinary
} = require('../../cloudinary')

//VALIDATION FOR FORMS
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



//GET ALL CAMPGROUNDS
exports.getCampgrounds = (catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {
        campgrounds
    });
}))

//ADD NEW CAMPGROUND PAGE
exports.newCampground = (catchAsync((req, res) => {
    res.render('campgrounds/new')
}))

//ADD NEW CAMPGROUND POST REQUEST
exports.makeNewCampground = (validateCampground, catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({
        url: f.path,
        filename: f.filename
    }));
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', "Successfully created a new campground")
    res.redirect(`/campgrounds/${campground._id}`)
}))

//GET ONE CAMPGROUND
exports.getOneCampground = (catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews').populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', {
        campground
    })
}))

//EDIT CAMPGROUND PAGE 
exports.editCampground = (catchAsync(async (req, res) => {
    const {
        id
    } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', {
        campground
    })
}))

//EDIT ONE CAMPGROUND PUT REQUEST
exports.editOneCampground = (validateCampground, catchAsync(async (req, res) => {
    const {
        id
    } = req.params;
    const campground = Campground.findByIdAndUpdate(id, {
        ...req.body.campground
    });
    // const imgs = req.files.map(f => ({
    //     url: f.path,
    //     filename: f.filename
    // }));
    //campground.images.push(...imgs);
    await campground.save();
    // if (req.body.deleteImages) {
    //     for (let filename of req.body.deleteImages) {
    //         await cloudinary.uploader.destroy(filename);
    //     }
    //     await campground.updateOne({
    //         $pull: {
    //             images: {
    //                 filename: {
    //                     $in: req.body.deleteImages
    //                 }
    //             }
    //         }
    //     })
    // }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}))

//DELETE CAMPGROUND
exports.deleteCampground = (catchAsync(async (req, res) => {
    const {
        id
    } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}))