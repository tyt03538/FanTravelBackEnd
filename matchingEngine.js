// matchingEngine.js
// =============================================================================
var async = require('async');

var Trip = require('./app/models/trip');
var Package = require('./app/models/package');
var User = require('./app/models/user');
var destList = require('./destList');

var matchingEngine = {
	cancelOutdatedTrip: function() {
		Trip.find(function(err, trip){
			async.eachSeries(trip, function(trip, next){
				if (trip.period.length > 0) {
					var curDate = new Date();
					if (trip.status != "scheduling" && trip.status != "completed" && trip.period[0].startDate < curDate) {
						trip.status = "cancelled";

						async.eachSeries(trip.travellers, function(user, next){
							var conditions = { email : user.email };

							User.findOne(conditions, function(err, targetUser){
								var indexToDel = targetUser.pendingTrips.indexOf(trip.id);

								targetUser.pendingTrips.splice(indexToDel, 1);

								targetUser.save(function(err){
									if (err) {
										console.log(err);
									}

									next();
								})
							})
						}, function(err){
							if (err) {
								throw err;
							}
						})

						trip.save(function(err){
							if (err) {
								console.log(err);
							}
						});
					}
				}
			}, function(err) {
				if (err) {
					throw err;
				}
			})
		})
	},

	selectPackage: function(){
		console.log("selecting packages");
		Trip.find(function(err, trips){
			if (err) {
				console.log(err);
			}
			console.log(trips.length);
			async.eachSeries(trips, function(trip, callback){
				console.log(trip.id);
				if (trip.status == "pendingPackages") {
					console.log(trip.id+" is ready to be assigned with packages");
					Package.find(function(err, pkg){
						var tmpAssignedPackage = [];
						var totalPkgNum = pkg.length;
						var assignPkgNum = 4;
						var pkgArray = [];

						if (trip.targetDestination == "Anywhere") {
							for (var i = 0; i < assignPkgNum; i++) {
								var pkgIndex;

								do {
									pkgIndex = Math.floor((Math.random() * totalPkgNum));
								} while (pkgArray.indexOf(pkgIndex) != -1);

								pkgArray.push(pkgIndex);
								tmpAssignedPackage.push(pkg[pkgIndex].id);
							};
						} else if (destList.contryList.indexOf(trip.targetDestination) != -1) {
							var cityList;

							for (var i = 0; i < destList.cityList.length; i++) {
								if (destList.cityList[i].region == trip.targetDestination) {
									cityList = destList.cityList[i].cities;
								}
							};

							for (var i = 0; i < assignPkgNum; i++) {
								var pkgIndex;

								do {
									pkgIndex = Math.floor((Math.random() * totalPkgNum));
								} while (!(pkgArray.indexOf(pkgIndex) == -1 && cityList.indexOf(pkg[pkgIndex].destination) != -1));

								pkgArray.push(pkgIndex);
								tmpAssignedPackage.push(pkg[pkgIndex].id);
							}
						} else {
							for (var i = 0; i < assignPkgNum; i++) {
								var pkgIndex;

								do {
									pkgIndex = Math.floor((Math.random() * totalPkgNum));
								} while (!(pkgArray.indexOf(pkgIndex) == -1 && pkg[pkgIndex].destination == trip.targetDestination));

								pkgArray.push(pkgIndex);
								tmpAssignedPackage.push(pkg[pkgIndex].id);
							}
						}

						trip.packageAssigned = tmpAssignedPackage;
						trip.status = "ranking";

						// tailoring the package according to the trip
						for (var i = 0; i < trip.packageAssigned.length; i++) {
							Package.findById(trip.packageAssigned[i], function(err, tgtPkg){
								var startDate = new Date();
								var endDate = new Date();

								if (trip.period.length > 0) {
									var ranNum = Math.floor((Math.random() * trip.period.length));
									var ranDay = Math.floor((Math.random() * 5)) - 2;

									startDate = trip.period[ranNum].startDate;
									endDate = trip.period[ranNum].endDate;

									startDate.setDate(trip.period[ranNum].startDate.getDate() + ranDay);
									endDate.setDate(trip.period[ranNum].endDate.getDate() + ranDay);
									//console.log(ranNum);
									//console.log(ranDay);
									//console.log(startDate);
									//console.log(endDate);
								}

								if (tgtPkg != null) {
									tgtPkg.hotels[0].checkinDate = startDate;
									tgtPkg.hotels[0].checkoutDate = endDate;
									//console.log(tgtPkg.hotels[0].checkinDate);
									//console.log(tgtPkg.hotels[0].checkoutDate);

									tgtPkg.flights[0].departureDate.setFullYear(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
									tgtPkg.flights[1].departureDate.setFullYear(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

									//console.log(tgtPkg.flights[0].departureDate);
									//console.log(tgtPkg.flights[1].departureDate);

									var splitResult = tgtPkg.flights[0].flightDuration.split(":");
									var outhourFlight = parseInt(splitResult[0]);
									var outminsFlight = parseInt(splitResult[1]);
									//console.log(splitResult[0]);
									//console.log(splitResult[1]);

									splitResult = tgtPkg.flights[1].flightDuration.split(":");
									var inhourFlight = parseInt(splitResult[0]);
									var inminsFlight = parseInt(splitResult[1]);
									//console.log(splitResult[0]);
									//console.log(splitResult[1]);

									tgtPkg.flights[0].arrivalDate = new Date();
									tgtPkg.flights[0].arrivalDate.setFullYear(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
									tgtPkg.flights[0].arrivalDate.setHours(tgtPkg.flights[0].departureDate.getHours() + outhourFlight);
									tgtPkg.flights[0].arrivalDate.setMinutes(tgtPkg.flights[0].departureDate.getMinutes() + outminsFlight);

									tgtPkg.flights[1].arrivalDate = new Date();
									tgtPkg.flights[1].arrivalDate.setFullYear(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
									tgtPkg.flights[1].arrivalDate.setHours(tgtPkg.flights[1].departureDate.getHours() + inhourFlight);
									tgtPkg.flights[1].arrivalDate.setMinutes(tgtPkg.flights[1].departureDate.getMinutes() + inminsFlight);

									tgtPkg.markModified('flights');

									tgtPkg.save(function(err){
										if (err) {
											console.log(err);
										}

										callback();
									});
								} else {
									console.log("package not found");
								}

							})
						};


						trip.save(function(err){
							if (err) {
								console.log(err);
							}

							callback();
						})
					})
				}
			}, function(err){
				if (err) {
					throw err;
				}

				console.log('all trips checked - matchingEngine');
			})
		})
	}
};

module.exports = matchingEngine;
