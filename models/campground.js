const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

const imageSchema = new mongoose.Schema({
    url: String,
    filename: String
})

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200,h_150');
});

// Allows Mongoose to include virtuals when converting a document to JSON
const opts = { toJSON: { virtuals: true } };

const campgroundSchema = new mongoose.Schema({
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
}, opts);

campgroundSchema.post('findOneAndDelete', async function(campground) {
    if (campground) {
        await Review.deleteMany({
            _id: {
                $in: campground.reviews
            }}
        );
    }
});

campgroundSchema.virtual('properties.popUpMarkUp').get(function() {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>` 
                + `<p>${this.description.substring(0,30)}</p>`;
});

const Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;