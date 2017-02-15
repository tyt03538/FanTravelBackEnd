// matchingEngine.js
// =============================================================================
var async = require('async');

var Trip = require('./app/models/trip');
var Package = require('./app/models/package');

var matchingEngine = {
	selectPackage: function(){
		Trip.find(function(err, trips){
		    if (err) {
		        console.log(err);
		    }

		    async.eachSeries(trips, function(trip, callback){
		        if (trip.status == "pendingPackages") {
		            console.log(trip.id+" is ready to be assigned with packages");
		            Package.find(function(err, pkg){
		                var tmpAssignedPackage = [];
		                for (var i = 0; i < pkg.length; i++) {
		                    tmpAssignedPackage.push(pkg[i].id);
		                };

		                trip.packageAssigned = tmpAssignedPackage;
		                trip.status = "ranking";

		                trip.save(function(err){
		                    if (err) {
		                        console.log(err);
		                    }
		                })
		            })
		        }
		        callback();
		    }, function(err){
		        if (err) {
		            throw err;
		        }

		        console.log('all trips checked');
		    })
		})
	}
};

module.exports = matchingEngine;
