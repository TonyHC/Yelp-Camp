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

    for (let i = 0; i < 200; i++) {
        const randomCityNumber = Math.floor(Math.random() * cities.length);
        const randomPrice = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            title: `${randomSampleData(descriptors)} ${randomSampleData(places)}`,
            images: [
                {
                    url: 'https://res.cloudinary.com/tonyhchao/image/upload/v1650675733/YelCamp/zyqnuqsanwmphsc6zqvv.jpg',
                    filename: 'YelCamp/zyqnuqsanwmphsc6zqvv'
                },
                {
                    url: 'https://res.cloudinary.com/tonyhchao/image/upload/v1650675732/YelCamp/ykgi82l34bujisr1gmwq.jpg',
                    filename: 'YelCamp/ykgi82l34bujisr1gmwq'
                }
            ],
            price: randomPrice,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi minus sint officia eaque eius autem excepturi corporis enim beatae harum, est magnam aut minima perspiciatis ad ea vitae laudantium similique.',
            location: `${cities[randomCityNumber].city}, ${cities[randomCityNumber].state}`,
            geometry: {
                type: 'Point',
                coordinates: [cities[randomCityNumber].longitude, cities[randomCityNumber].latitude]
            },
            author: '62617e4a2516363b4c1723cd'
        });
        
        await camp.save();
    }
}

seedDB()
    .then(() => {
        mongoose.connection.close();
    });