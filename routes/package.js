// trip.js

// BASE SETUP
// =============================================================================
var express = require('express');
var router = express.Router();              // get an instance of the express Router

// Related Schema
// =============================================================================
var Package = require('../app/models/package');
var Hotel = require('../app/models/hotel');
var Flight = require('../app/models/flight');

router.route('/')
	.post(function(req, res){
		var pkg = new Package();      // create a new instance of the Package model

        pkg.packageID = "";
        pkg.destination = req.body.destination;
        pkg.price = req.body.price;
        pkg.flights = req.body.flights;
        pkg.hotels = req.body.hotels;

        pkg.save(function(err){
            if(err) {
                res.status(500).send(err);
            }

            res.status(200).json({"packageID":pkg.id});
        })
	})

    .get(function(req, res){
        Package.find(function(err, pkg){
            if (err) {
                res.status(500).send(err);
            }

            for (var i = 0; i < pkg.length; i++) {
                pkg[i].packageID = pkg[i].id;
            };

            res.status(200).json(pkg);
        })
    })

router.route('/:packageID')
    .get(function(req, res){
        conditions={"_id": req.params.packageID};

        Package.findOne(conditions, function(err, pkg){
            if (err) {
                res.status(500).send(err);
            }

            if(pkg) {
                pkg.packageID = pkg.id;
                res.status(200).json(pkg.toJSON());
            } else {
                res.status(404).json({"message":"package not found"});
            }
        })
    })

router.route('/hotel/_upload')
		.post(function(req, res){
				var hotelsToInsert = req.body.hotels;
				var processed = 0;

				for (var i = 0; i < hotelsToInsert.length; i++) {
						var hotel = new Hotel();

						hotel.destination = hotelsToInsert[i].destination;
						hotel.name = hotelsToInsert[i].name;
						hotel.checkinTime = hotelsToInsert[i].checkinTime;
				    hotel.checkoutTime = hotelsToInsert[i].checkoutTime;
				    hotel.price = hotelsToInsert[i].price;
				    hotel.address = hotelsToInsert[i].address;

						hotel.save(function(err){
								if(err) {
										res.status(500).send(err);
								}

								processed++;

								if(processed == hotelsToInsert.length) {
										res.status(200).json({"message":"all hotels inserted successfully"});
								}
						})
				}
		})

router.route('/hotel/_retrieve')
		.get(function(req, res){
				Hotel.find(function(err, hotel){
						if(err) {
								res.status(500).send(err);
						}

						res.status(200).json(hotel);
				})
		})

router.route('/flight/_upload')
		.post(function(req, res){
				var flightsToInsert = req.body.flights;
				var processed = 0;

				for (var i = 0; i < flightsToInsert.length; i++) {
						var flight = new Flight();

						flight.destination 	= flightsToInsert[i].destination;
						flight.flights 			= flightsToInsert[i].flights;

						flight.save(function(err){
								if(err) {
										res.status(500).send(err);
								}

								processed++;

								if(processed == flightsToInsert.length) {
										res.status(200).json({"message":"all flights inserted successfully"});
								}
						})
				}
		})

router.route('/flight/_retrieve')
		.get(function(req, res){
				Flight.find(function(err, flight){
						if(err) {
								res.status(500).send(err);
						}

						res.status(200).json(flight);
				})
		})

module.exports = router;
