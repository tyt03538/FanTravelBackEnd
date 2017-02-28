// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');

mongoose.connect('mongodb://localhost:27017/FanTravel'); // connect to our database

// The index router
var indexRouter = require('./routes');

// The matching engine
var matchingEngine = require('./matchingEngine');

// The packageGenerator
var pkgGen = require('./pkgGen.js');
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', indexRouter);

// The following is the periodic function
// It is to check if there are any trips that
// have all schedules collected from the travellers
setInterval(function () {
    console.log('checking status for all the trips');
    matchingEngine.selectPackage();
    console.log('all trips checked - server.js');
}, 3000);

setInterval(function () {
    pkgGen.generate();
}, 60000);


// more routes for our API will happen here

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('The server is listening to ' + port);
