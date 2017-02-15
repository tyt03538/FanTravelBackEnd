// trip.js

// BASE SETUP
// =============================================================================
var express = require('express');
var router = express.Router();              // get an instance of the express Router

// Related Schema
// =============================================================================
var User = require('../app/models/user');
var Trip = require('../app/models/trip');
var Package = require('../app/models/package');

router.route('/')
    // create a trip (accessed at POST http://localhost:8080/api/trip)
    .post(function(req, res) {
        
        var trip = new Trip();      // create a new instance of the User model
        reqResult = true;
        
        trip.tripID = '',
        trip.status = 'scheduling';

        if (typeof req.body.initiator !== 'undefined' && req.body.initiator)
        {
            trip.initiator = req.body.initiator;
        } else {
            res.status(400).json({"message":"initiator field empty in the object"});
            return;
        }

        if (typeof req.body.period !== 'undefined' && req.body.period)
        {
            if (req.body.period[0].startDate == null) {
                // res.status(400).json({"message":"period.startDate not present in the request body"});
                // return;
            }

            if (req.body.period[0].endDate == null) {
                // res.status(400).json({"message":"period.endDate not present in the body"});
                // return;
            }

            trip.period = req.body.period;
        } else {
            trip.period = '';
        }

        if (typeof req.body.travellers !== 'undefined' && req.body.travellers)
        {
            trip.travellers = req.body.travellers;
        } else {
            res.status(400).json({"message":"travellers field empty in the object"});
            return;
        }

        if (typeof req.body.targetDestination !== 'undefined' && req.body.targetDestination)
        {
            trip.targetDestination = req.body.targetDestination;
        } else {
            trip.targetDestination = '';
        }

        if (typeof req.body.paymentMethod !== 'undefined' && req.body.paymentMethod)
        {
            trip.paymentMethod = req.body.paymentMethod;
        } else {
            trip.paymentMethod = '';
        }

        trip.packageAssigned = [];
        trip.packageChosen = [];

        // save the user and check for errors
        trip.save(function(err) {
            if (err) {
                res.status(500).send(err);
            }
        });

	var numTraveller = trip.travellers.length;
	var processed = 0;
	var reqResult;
	
	trip.travellers.forEach(function(user) {
            var conditions={"email":user.email};
            
            User.findOne(conditions, function(err, user) {
                if( user !== null )
                {
                    user.pendingTrips.push(trip.id);
                    user.save(function(err) {
                        if (err)
                            res.status(500).send(err);
                    });
                }
                else
                {
                    reqResult = false;
                }
				
		processed++;
				
		if(processed == numTraveller)
		{
			if (reqResult)
			{
				responseBody = {"tripID":trip.id};
				res.status(200).json(responseBody);    
			} else {
				res.status(400).json({"message":"At least one of the travellers do not exist"});
				conditions = {"_id":trip.id};
				Trip.find(conditions).remove().exec();
			}
		};
            });
        });
    })
    
    // retrieve all the trips exist in the database
    .get(function(req, res) {
        Trip.find(function(err, trip) {
            if (err)
                res.status(500).send(err);

            for (var i = 0; i < trip.length; i++) {
                trip[i].tripID = trip[i].id;
            };

            res.status(200).json(trip);
        });
    })

router.route('/:tripID')
    .get(function(req, res) {
        var conditions = {"_id":req.params.tripID};

        Trip.findOne(conditions, function(err, trip) {
            if(err) {
                res.status(400).send(err);
            }

            if(trip) {
                trip.tripID = req.params.tripID;
                res.status(200).json(trip.toJSON());
            } else {
                res.status(404).json({"message":"trip not found"});
            }
        })
    })

router.route('/updatePackageRank/:tripID')
    .post(function(req, res) {
        conditions={"_id":req.params.tripID};

        if(req.body.email == null) {
            res.status(401).json({"message":"user email cannot be null or undefined"});
            return;
        }

        if(req.body.packageRank == null) {
            res.status(401).json({"message":"package rank is not specified in the request body"});
            return;
        }

        Trip.findOne(conditions, function(err, trip) {
            if(err) {
                res.status(500).send(err);
            }

            var updated = false;
            var allHaveRank = true;
            if(trip) {
                for (var i = 0; i < trip.travellers.length; i++) {
                    if(trip.travellers[i].email == req.body.email) {
                        trip.travellers[i].packageRank = req.body.packageRank;
                        updated = true;
                    }

                    if(trip.travellers[i].packageRank.length == 0) {
                        allHaveRank = false;
                    }
                };

                if(!updated) {
                    res.status(400).json({"message":"travller specified not found in the trip"});
                    return;
                } else {
                    if(allHaveRank) {
                        var rankingScore = [];
                        for (var i = 0; i < trip.packageAssigned.length; i++) {
                            rankingScore[i] = 0;
                        };

                        for (var i = 0; i < trip.travellers.length; i++) {
                           for (var j = 0; j < trip.travellers[i].packageRank.length; j++) {
                                for (var k = 0; k < trip.packageAssigned.length; k++) {
                                    if(trip.travellers[i].packageRank[j] == trip.packageAssigned[k]) {
                                        rankingScore[k] += trip.packageAssigned.length - j;
                                    };
                                };
                            };
                        };

                        var max = 0;

                        for (var i = 0; i < rankingScore.length; i++) {
                            if(rankingScore[i] > max) {
                                max = rankingScore[i];
                                trip.packageChosen = trip.packageAssigned[i];
                            };

                        };
                        trip.status = "confirming";        
                    }

                    trip.save(function(err) {
                        if(err) {
                            res.status(500).send(err);
                        }

                        res.status(200).json({"message":"packageRank updated successfully for the specified traveller"});
                    })
                }
            } else {
                res.status(404).json({"message":"trip not found"});
            }
        })
    })

router.route('/updatePackageConfirmation/:tripID')
    .post(function(req, res) {
        var conditions = {"_id": req.params.tripID};

        if(req.body.packageConfirmation == null) {
            res.status(400).json({"message":"packageConfirmation cannot be null or undefined"});
            return;
        }

        if(req.body.email == null) {
            res.status(400).json({"message":"user email cannot be null or undefined"});
            return;
        }

        Trip.findOne(conditions, function(err, trip){
            if(err) {
                res.status(500).send(err);
            }

            if(trip) {
                var travellerUpdated = false;
                var allHaveConfirmation = true;
                for (var i = 0; i < trip.travellers.length; i++) {
                    if(trip.travellers[i].email === req.body.email) {
                        if(trip.travellers[i].packageConfirmation === "") {
                            trip.travellers[i].packageConfirmation = req.body.packageConfirmation;
                        } else {
                            if(trip.travellers[i].packageConfirmation === "declined") {
                                if(req.body.packageConfirmation == "accepted") {
                                    trip.travellers[i].packageConfirmation = "accepted";
                                } else {
                                    res.status(400).json({"message":"positive packageConfirmation already provided for this traveller"});
                                    return;
                                }
                            } else {
                                if(trip.travellers[i].packageConfirmation === "accepted") {
                                    res.status(400).json({"message":"positive packageConfirmation already provided for this traveller"});
                                    return;
                                }
                            }
                        }

                        travellerUpdated = true;
                    }

                    if(trip.travellers[i].packageConfirmation === "") {
                        allHaveConfirmation = false;
                    }
                };

                if(!travellerUpdated) {
                    res.status(404).json({"message":"specified traveller not found"});
                } else {
                    if(allHaveConfirmation) {
                        for (var i = 0; i < trip.travellers.length; i++) {
                            if(trip.travellers[i].packageConfirmation == "declined") {
                                trip.status = "cancelled";
                            }
                        };

                        if(trip.status == "cancelled") {
                            trip.travellers.forEach(function(user){
                                conditions = {"email":user.email};

                                User.findOne(conditions, function(err, targetUser){
                                    for (var i = 0; i < targetUser.pendingTrips.length; i++) {
                                        if(targetUser.pendingTrips[i] == trip.id) {
                                            targetUser.pendingTrips.splice(i,1);
                                        }
                                    };

                                    targetUser.save(function(err){
                                        if(err) {
                                            res.status(500).send(err);
                                        }
                                    })
                                });
                            });
                        }

                        if(trip.status !== "cancelled") {
                            trip.status = 'paying';
                        }
                    }

                    trip.save(function(err){
                        if(err) {
                            res.status(500).send(err);
                        }

                        res.status(200).json({"message":"packageConfirmation updated successfully"});
                    })
                }
            } else {
                res.status(404).json({"message":"trip not found"});
            }
        })
    })

router.route('/updatePeriod/:tripID')
    .post(function(req, res) {
        var conditions = {"_id":req.params.tripID};

        if(req.body.availableDates == null) {
            res.status(401).json({"message":"new schedule cannot be null or undefined"});
            return;
        }

        if(req.body.email == null) {
            res.status(401).json({"message":"user email cannot be null or undefined"});
            return;
        }

        Trip.findOne(conditions, function(err, trip) {
            if(err) {
                res.status(400).send(err);
            }

            if(trip) {
                // Insert the available date in the traveller records
                var travellerUpdated = false;
                for (var i = 0; i < trip.travellers.length; i++) {
                    if( trip.travellers[i].email === req.body.email ) {
                        // Push the request body dates into the travller record
                        travellerUpdated = true;
						trip.travellers[i].availableDates = [];
                        for (var j = 0; j < req.body.availableDates.length; j++) {
                            trip.travellers[i].availableDates.push(req.body.availableDates[j]);
                        }

                        // sort the individual avail. dates
                        trip.travellers[i].availableDates.sort(function(a, b) { return a.startDate - b.startDate });
                        var indexToRemove = [];

                        // merge the date
                        for (var j = 0; j <  trip.travellers[i].availableDates.length-1; j++) {
                            // The period with smaller startDate encapsulate the next period, i.e.
                            // s-------------e
                            //     s------e
                            if( trip.travellers[i].availableDates[j].endDate >=  trip.travellers[i].availableDates[j+1].endDate) {
                                trip.travellers[i].availableDates[j+1].startDate =  trip.travellers[i].availableDates[j].startDate;
                                trip.travellers[i].availableDates[j+1].endDate =  trip.travellers[i].availableDates[j].endDate;
                                indexToRemove.push(j);
                            } else {
                                // The period overlaps with next period, i.e.
                                // s-------------e
                                //            s--------e
                                if( trip.travellers[i].availableDates[j].endDate >=  trip.travellers[i].availableDates[j+1].startDate) {
                                    trip.travellers[i].availableDates[j+1].startDate =  trip.travellers[i].availableDates[j].startDate;
                                    indexToRemove.push(j);
                                } else {
                                    // The period does not overlap with next period, i.e.
                                    // s-------------e
                                    //                   s--------e
                                    // Do nothing
                                }
                            }
                        };

                        // Remove the merged period
                        for (var j = 0; j < indexToRemove.length; j++) {
                            delete  trip.travellers[i].availableDates[indexToRemove[j]];
                        };

                        for (var j = 0; j <  trip.travellers[i].availableDates.length; j++) {
                            if ( trip.travellers[i].availableDates[j] == null) {         
                                 trip.travellers[i].availableDates.splice(j, 1);
                                j--;
                            }
                        }
                    }
                };

                if(!travellerUpdated) {
                    res.status(400).json({"message":"traveller specified not found in the trip"});
                    return;
                }

                // Check if all travellers have specified the period
                var allHaveSchedule = true;
                for (var i = 0; i < trip.travellers.length; i++) {
                    if( trip.travellers[i].availableDates.length == 0) {
                        allHaveSchedule = false;
                    }
                }

                // If all travellers have specified schedules then merge all the period and save to the trip period field
                if(allHaveSchedule) {
                    trip.period = [];
                    var tmpPeriod = [];
                    for (var i = 0; i < trip.travellers.length; i++) {
                        for (var j = 0; j < trip.travellers[i].availableDates.length; j++) {
                            tmpDates={
                                "email":trip.travellers[i].email,
                                "startDate":trip.travellers[i].availableDates[j].startDate,
                                "endDate":trip.travellers[i].availableDates[j].endDate
                            }
                            tmpPeriod.push(tmpDates);
                        }
                    };

                    // Merge the trip period
                    tmpPeriod.sort(function(a, b) { return a.startDate - b.startDate });
                    var indexToRemove = [];

                    console.log(tmpPeriod);

                    for (var i = 0; i < tmpPeriod.length-1; i++) {
                        // The period with smaller startDate encapsulate the next period, i.e.
                        // s-------------e
                        //     s------e
                        if(tmpPeriod[i].endDate >= tmpPeriod[i+1].endDate) {
                            indexToRemove.push(i);
                        } else {
                            // The period overlaps with next period, i.e.
                            // s-------------e
                            //            s--------e
                            if(tmpPeriod[i].endDate >= tmpPeriod[i+1].startDate) {
                                tmpPeriod[i+1].endDate = tmpPeriod[i].endDate;
                                indexToRemove.push(i);
                            } else {
                                // The period does not overlap with next period, i.e.
                                // s-------------e
                                //                   s--------e
                                indexToRemove.push(i);
                            }
                        }
                    };

                    // Remove the merged period
                    for (var i = 0; i < indexToRemove.length; i++) {
                        delete tmpPeriod[indexToRemove[i]];
                    };

                    for (var i = 0; i < tmpPeriod.length; i++) {
                        if (tmpPeriod[i] == null) {         
                            tmpPeriod.splice(i, 1);
                            i--;
                        }
                    }

                    trip.period = tmpPeriod;

                    trip.status = "pendingPackages";
                }

                // Save the trip with updated periods
                trip.save(function(err) {
                    if(err) {
                        res.status(500).send(err);
                    }

                    res.status(200).json({"message":"trip period successfully updated"});
                });
                

            } else {
                res.status(404).json({"message":"trip not found"});
            }
        })
    })

module.exports = router;
