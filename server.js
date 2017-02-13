// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var async      = require('async');

mongoose.connect('mongodb://localhost:27017/FanTravel'); // connect to our database

var User = require('./app/models/user')
var Trip = require('./app/models/trip')
var Package = require('./app/models/package')
// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log(Date() + req.ip + ' is calling to the server.');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

router.route('/_health')
    .get(function(req, res) {
        res.status(200).json({"healthCheck":"OK"});
    })

router.route('/user')
    // create a user (accessed at POST http://localhost:8080/api/user)
    .post(function(req, res) {
        console.log("a new user is going to be created");

        var user = new User();      // create a new instance of the User model

        if(typeof req.body.lastName !== 'undefined' && req.body.lastName)
        {
            user.lastName = req.body.lastName;    
        } else {
            user.lastName = ''
        }

    	if(typeof req.body.title !== 'undefined' && req.body.title)
    	{
    	    user.title = req.body.title;
    	} else {
    	    user.title = '';
    	}
        
        if(typeof req.body.email !== 'undefined' && req.body.email)
        {
            user.email = req.body.email;    
        } else {
            res.status(400).json({"message":"email of the user cannot be empty"});
            return;
        }

        if(typeof req.body.loginToken !== 'undefined' && req.body.loginToken)
        {
            user.loginToken = req.body.loginToken;    
        } else {
            user.loginToken = '';
        }
        
        if(typeof req.body.firstName !== 'undefined' && req.body.firstName)
        {
            user.firstName = req.body.firstName;
        } else {
            user.firstName = '';
        }
    	
        if(typeof req.body.preferences !== 'undefined' && req.body.preferences)
        {
            for (var i = 0; i < req.body.preferences.length; i++) {
                user.preferences.push(req.body.preferences[i]);
            };  
        } else {
            user.preferences = [];
        }

        if(typeof req.body.friends !== 'undefined' && req.body.friends)
        {
            user.friends = req.body.friends;
        } else {
            user.friends = [];
        }

    	
    	if(typeof req.body.pendingTrips !== 'undefined' && req.body.pendingTrips)
        {
            user.pendingTrips = req.body.pendingTrips;    
        } else {
            user.pendingTrips = [];
        }

        if(typeof req.body.confirmedTrips !== 'undefined' && req.body.confirmedTrips)
        {
            user.confirmedTrips = req.body.confirmedTrips;    
        } else {
            user.confirmedTrips = [];
        }

        // save the user and check for errors
        var conditions = {"email":user.email};
        User.findOne(conditions, function(err,testUser) {
            if(err) {
                res.status(500).send(err)
            }

            if(testUser) {
                res.status(403).json({"message":"user with the same email already exists"});
            } else {
                user.save(function(err) {
                    if (err)
                        res.status(500).send(err);
                    console.log("A new user with ID: " + user.email + " is created!");
                    res.status(200).json({ message: 'User created!' });
                });
            }
        })
    })

    // get all the user (accessed at GET http://localhost:8080/api/user)
    .get(function(req, res) {
        console.log("call to get all users is received");
        User.find(function(err, user) {
            if (err)
                res.status(500).send(err);

            res.status(200).json(user);
        });
    });

router.route('/user/updatePreferences/:email')
    // Update the travel preference of the newly created user
    .post(function(req, res) {
	if(req.body.preferences == null) {
	    res.status(400).json({"message":"user preferences cannot be undefined"});
	    return;
	}

        var conditions = {"email":req.params.email};
        User.findOne(conditions, function(err, user) {
            if (err) {
                res.status(500).send(err);
            }

            if (user) {
                if (req.body.preferences.length == 0) {
                    user.preferences=[];
                } else {
                    for (var i = 0; i < req.body.preferences.length; i++) {
                        if (user.preferences.length == 0) {
                            user.preferences.push(req.body.preferences[i]);
                        } else {
                            var updated = false;

                            for (var j = 0; j < user.preferences.length; j++) {
                                if(user.preferences[j].prefID == req.body.preferences[i].prefID) {
                                    user.preferences[j].pref = req.body.preferences[i].pref;
                                    updated = true;
                                }

                            }

                            if(!updated) {
                                user.preferences.push(req.body.preferences[i]);
                            }
                        }
                    };
                }
                

                user.save(function(err) {
                    if (err) {
                        res.status(500).send(err);
                        return;
                    }

                    res.status(200).json({"message":"user preferences successfully updated"});
                });
            } else {
                res.status(404).json({"message":"user not found"});
            }
        })
    }) 

router.route('/user/updateProfile/:email')
    // update the profile of a user (accessed at POST http://localhost:8080/api/user/updateProfile)
    .post(function(req, res) {
        console.log("User Profile: " + req.params.email + " is going to be updated.");

        var conditions = {"email":req.params.email};

        User.findOne(conditions, function(err,user) {
            if (err) {
                res.status(500).send(err);
            }

            if (user == null) {
                res.status(404).json({"message":"user not found"});
            } else {
                if(typeof req.body.lastName !== 'undefined' && req.body.lastName) {
                    user.lastName = req.body.lastName;    
                }

                if(typeof req.body.title !== 'undefined' && req.body.title) {
                    user.title = req.body.title;
                }
                
                if(typeof req.body.email !== 'undefined' && req.body.email) {
                    user.email = req.body.email;    
                }

                if(typeof req.body.loginToken !== 'undefined' && req.body.loginToken) {
                    user.loginToken = req.body.loginToken;    
                }
                
                if(typeof req.body.firstName !== 'undefined' && req.body.firstName) {
                    user.firstName = req.body.firstName;
                }
                
                if(typeof req.body.preferences !== 'undefined' && req.body.preferences) {
                    for (var i = 0; i < req.body.preferences.length; i++) {
                        user.preferences.push(req.body.preferences[i]);
                    };
                }

                if(typeof req.body.friends !== 'undefined' && req.body.friends) {
                    user.friends = req.body.friends;
                }
                
                if(typeof req.body.pendingTrips !== 'undefined' && req.body.pendingTrips) {
                    user.pendingTrips = req.body.pendingTrips;    
                }

                if(typeof req.body.confirmedTrips !== 'undefined' && req.body.confirmedTrips) {
                    user.confirmedTrips = req.body.confirmedTrips;    
                }

                user.save(function(err) {
                    if(err) {
                        res.status(500).send(err);
                    }

                    console.log("Profile successfully updated!");
                    res.status(200).json({"message":"user profile updated!"});
                })
            }
        })
    });

router.route('/user/:email')

	// get the user with that email
	.get(function(req, res) {
        var conditions = {"email":req.params.email};
		User.findOne(conditions, function(err, user) {
			if (err) {
                res.status(500).send(err);
            }

            if(user) {
                res.status(200).json(user.toJSON());    
            } else {
                res.status(404).json({"message":"user not found"});
            }
			
		});
	})

router.route('/user/login/:email')

    // login the user with that email and check the provided token matching with the one in db
    .post(function(req, res) {
        var email = "email"
        var queryParam = {};
        queryParam[email]= req.params.email;
        User.findOne(queryParam, function(err, user) {
            if (err)
                res.status(500).send(err);

            if (!user)
                res.status(401).json({"message":"username or password incorrect"});
            else
                if (user.loginToken != req.body.loginToken)
                {
                    res.status(401).json({"message":"username or password incorrect"});;
                } else {
                    res.status(200).json({"email":user.email});
                }
        });
    })

router.route('/user/getFriendName')
    
    // receive an array of user email and return an array containing tuples of email and full name
    .post(function(req, res) {
        var numFriends = req.body.friendList.length;
        var result = [];
        var reqResult = true;
        var processed = 0;
        
        req.body.friendList.forEach(function(friend) {
            var conditions = {"email": friend};
            
            User.findOne(conditions, function(err,user) {
                if(user !== null) {
                    var fullName = user.firstName + " " + user.lastName;
                    result.push({"email":friend, "name": fullName});
                } else {
                    reqResult = false;
                }
                
                processed++;
                
                if (processed == numFriends) {
                    if(reqResult) {
                        res.status(200).json(result);
                    } else {
                        res.status(400).json({"message":"At least one of the email not found in system"})
                    }
                }
            })
        })
    })

router.route('/trip')
    
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

router.route('/trip/:tripID')
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

router.route('/trip/updatePackageRank/:tripID')
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

router.route('/trip/updatePackageConfirmation/:tripID')
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
                            if(req.body.packageConfirmation == "declined") {
                                trip.status = "cancelled";
                            }
                        }

                        if(trip.travellers[i].packageConfirmation === "declined") {
                            if(req.body.packageConfirmation === "accepted") {
                                trip.travellers[i].packageConfirmation = "accepted";

                                var allAccepted = true;
                                for (var i = 0; i < trip.travellers.length; i++) {
                                    if(trip.travellers[i].packageConfirmation === "declined") {
                                        allAccepted = false;
                                    }
                                };
                                
                                if(allAccepted) {
                                    trip.status = "paying";
                                }
                            } else {
                                res.status(400).json({"message":"positive packageConfirmation already provided for this traveller"});
                                return;
                            }
                        }

                        if(trip.travellers[i].packageConfirmation === "accepted") {
                            res.status(400).json({"message":"positive packageConfirmation already provided for this traveller"});
                            return;
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
                    if(allHaveConfirmation && trip.status!== 'cancelled') {
                        trip.status = 'paying';
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

router.route('/trip/updatePeriod/:tripID')
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
	
router.route('/package')
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

router.route('/package/:packageID')
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

// the following is the periodic function to check if there are any trips that have all schedules collected from the travllers
setInterval(function () { 
    console.log('checking status for all the trips');

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
}, 3000); 

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);
