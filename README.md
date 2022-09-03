# Yelp-Camp
This is a simplified version of Yelp for campgrounds only in the United States. 
All the campground data is stored using MongoDB Atlas.

## How to build and run the image using Docker
- Change to the directory containing the Dockerfile and .dockerignore
- Run the following Docker command to build the Docker image: 
  - `docker build -t yelp-camp .`
- Enter this Docker command after the image is built to run the image in a Docker container:
  - `docker run --name yelp-camp -d -p 3000:3000 yelp-camp:latest`

## Visit web application
Visit [Yelp-Camp](http://localhost:3000) to access the web app

## Features
  - Anyone can view the list of campgrounds, a campground in more detail, reviews, and the map marking the locations of campgrounds
  - Search for campgrounds by their name using the search bar
  - Infinite scrolling was implemented on the campgrounds index page
    - The first 10 campgrounds are loaded initially
    - Once a user scrolls down this page enough, the next 10 or remaining campgrounds are loaded 
  - To post a new campground or review, a user must sign up by entering a username, password, and email
  - Only authenticated users associated with the posted campgrounds or reviews have the authority to edit or delete
    - In addition, the user can upload additional images to the own campground post

## How was it built
  - Designed the frontend using HTML, CSS, Bootstrap 5, jQuery
  - The backend relies on Express.js with Node.js and EJS
  - MongoDB Atlas is used to store the campgrounds, reviews, sign-up, and session data
  - Use the following packages plus custom middleware to implement user authentication and authorization:
    - ```expression-session```
    - ```passport``` 
    - ```passport-local```
    - ```passport-local-mongoose```
    - ```connect-mongo```
    - ```connect-flash ```
  - Client-side validation is handled by Bootstrap 5 form validation
  - Server-side validation is handled by the combination of ```joi``` and ```html-santiize``` packages along with custom middleware
  - The cluster-map and map use the ```@mapbox/mapbox-sdk``` to load all geoJSON points based on the campground's location
  - Use the following packages along with built-in middleware to handle managing and uploading images on the cloud:
    - ```multer```
    - ```multer-storage-cloudinary```
    - ```cloudinary``` 