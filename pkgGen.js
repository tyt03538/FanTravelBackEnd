var async = require('async');

var Hotel = require('./app/models/hotel');
var Flight = require('./app/models/flight');
var Package = require('./app/models/package')

var pkgGen = {
	generate: function() {
		Package.remove({}, function(err){
			if(err) {
				console.log(err);
			} else {
				Hotel.find(function(err, hotel){
					Flight.find(function(err, flight){
						for (var i = 0; i < flight.length; i++) {
							for (var j = 0; j < hotel.length; j++) {
								if(flight[i].destination == hotel[j].destination) {
									var pkg = new Package();

									pkg.destination			= flight[i].destination;
									pkg.price				= flight[i].flights[0].price * 2 + hotel[j].price;

									var tmpHotel = {
										address			: hotel[j].address,
										price			: hotel[j].price,
										checkinDate		: hotel[j].checkinTime,
										checkoutDate	: hotel[j].checkoutTime,
										name			: hotel[j].name
									}

									pkg.hotels.push(tmpHotel);

									pkg.flights				= flight[i].flights;

									pkg.save(function(err){
										if(err) {
											console.log(err);
										}
									})
								}
							};
						};
					})
				})
			}
		})
		
	}
}

module.exports = pkgGen;
