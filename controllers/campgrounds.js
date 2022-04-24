const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary/config');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const mapboxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({accessToken: mapboxToken});

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});

    res.render('campgrounds/index', {
        campgrounds: campgrounds
    });
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();

    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(file => ({ url: file.path, filename: file.filename }));
    campground.author = req.user._id;
    campground.geometry = geoData.body.features[0].geometry;
    await campground.save();
    
    req.flash('success', 'Successfully created new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.showCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id)
        .populate({
            path: 'reviews',
            options: {
                limit: 10,
                sort: { rating: -1 },
                skip: (req.query.page - 1) * 10
            },
            populate: {
                path: 'author'
            }
        }).populate('author');

    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/details', {
        campground: campground
    });
}

module.exports.updateCampground = async (req, res) => {
    let campground = null;

    if (!req.files.length > 0) {
        campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground});
        
        if (req.body.deleteImages) {
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }

            await campground.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
        }
        
        req.flash('success', 'Successfully updated campground info');
    } else {
        campground = await Campground.findById(req.params.id);
        campground.images.push(...req.files.map(file => ({ url: file.path, filename: file.filename })));
        await campground.save();
        req.flash('success', 'Successfully uploaded campground images');
    }

    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}

module.exports.renderEditForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/edit', {
        campground: campground
    });
}

module.exports.renderImageUploadForm = async (req, res) => {
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }

    res.render('campgrounds/imageUpload', {
        campground: campground
    });
}