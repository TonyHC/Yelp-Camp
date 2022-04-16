const mongoose = require('mongoose');
const cities = require('./cities');
const { descriptors, places } = require('./seedHelper');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp')
    .then(() => {
        console.log("Database connected");
    })
    .catch(err => {
        console.log("Connection error: ", err);
    });

const randomSampleData = (array) => {
    return array[Math.floor(Math.random() * array.length)];
}

const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 50; i++) {
        const randomCityNumber = Math.floor(Math.random() * cities.length);
        const camp = new Campground({
            title: `${randomSampleData(descriptors)} ${randomSampleData(places)}`,
            location: `${cities[randomCityNumber].city}, ${cities[randomCityNumber].state}`
        });
        
        await camp.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    });