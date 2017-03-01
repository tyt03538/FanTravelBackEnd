// user.js

// BASE SETUP
// =============================================================================
var express = require('express');
var router = express.Router();              // get an instance of the express Router
var async = require('async');

// Related Schema
// =============================================================================
var User = require('../app/models/user');

router.route('/')
    // create a user (accessed at POST http://localhost:8080/api/user)
    .post(function(req, res) {
        console.log("a new user is going to be created");

        var user = new User();      // create a new instance of the User model

        if(typeof req.body.email !== 'undefined' && req.body.email)
        {
            user.email = req.body.email;
        } else {
            res.status(400).json({"message":"email of the user cannot be empty"});
            return;
        }

        if(typeof req.body.preferences !== 'undefined' && req.body.preferences)
        {
            for (var i = 0; i < req.body.preferences.length; i++) {
                user.preferences.push(req.body.preferences[i]);
            };
        } else {
            user.preferences = [];
        }

        if(req.body.passport == null) {
            user.passport.number = '';
            user.passport.expiryDate = '';
            user.passport.nationality = '';
        } else {
            user.passport.number        = ((req.body.passport.number == null)? '' : req.body.passport.number);
            user.passport.expiryDate    = ((req.body.passport.expiryDate == null)? '' : req.body.passport.expiryDate);
            user.passport.nationality   = ((req.body.passport.nationality == null)? '' : req.body.passport.nationality);
        }

        user.lastName           = ((req.body.lastName == null)? '' : req.body.lastName);
        user.title              = ((req.body.title == null)? '' : req.body.title);
        user.loginToken         = ((req.body.loginToken == null)? '' : req.body.loginToken);
        user.firstName          = ((req.body.firstName == null)? '' : req.body.firstName);
        user.friends            = ((req.body.friends == null)? [] : req.body.friends);
        user.pendingTrips       = ((req.body.pendingTrips == null)? [] : req.body.pendingTrips);
        user.confirmedTrips     = ((req.body.confirmedTrips == null)? [] : req.body.confirmedTrips);

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

router.route('/updatePreferences/:email')
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

router.route('/updateProfile/:email')
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

                if(typeof req.body.passport !== 'undefined' && req.body.passport) {
                    if(req.body.passport.nationality !== 'undefined' && req.body.passport.nationality) {
                        user.passport.nationality = req.body.passport.nationality;
                    }

                    if(req.body.passport.number !== 'undefined' && req.body.passport.number) {
                        user.passport.number = req.body.passport.number;
                    }

                    if(req.body.passport.expiryDate !== 'undefined' && req.body.passport.expiryDate) {
                        user.passport.expiryDate = req.body.passport.expiryDate;
                    }
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

router.route('/:email')

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

router.route('/login/:email')

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

// This method to get the full names of the user in the name list
router.route('/getFriendName')

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

// This method is to search users in the whole profile database
router.route('/searchUser')
    .post(function(req,res) {
        if (req.body.searchPhase == null) {
            res.status(400).json({"message":"search phase cannot be null"});
            return;
        } else {
            if (req.body.searchPhase == "") {
                res.status(400).json({"message":"search phase cannot be empty string"});
                return;
            }
        }

        function checkEmailExistinArray(array, item) {
          for (var i = 0; i < array.length; i++) {
            if (array[i].email === item) {
              return true;
            }
          }

          return false;
        }

        User.find(function(err, user){
            var searchSuggestions = [];
            var numSuggestions = 5;

            for (var i = 0; i < user.length; i++) {
                // if the user email contains the search phase
                // index is to locate the position of the substring
                if( user[i].email.indexOf( req.body.searchPhase ) == 0 ) {
                    if( searchSuggestions.length < numSuggestions) {
                        var fullName = user[i].firstName + " " + user[i].lastName
                        var responseItem = {
                                        "email": user[i].email,
                                        "name": fullName
                                    }

                        searchSuggestions.push(responseItem);
                    }
                }
            }

            if( searchSuggestions.length < numSuggestions ) {
              for (var i = 0; i < user.length; i++) {
                  // if the user email contains the search phase
                  // index is to locate the position of the substring
                  if( user[i].email.indexOf( req.body.searchPhase ) != -1 ) {
                    if( user[i].email.indexOf( req.body.searchPhase ) + req.body.searchPhase.length == user[i].email.length ) {
                        if( searchSuggestions.length < numSuggestions) {
                            if ( !checkEmailExistinArray(searchSuggestions, user[i].email) ) {
                              var fullName = user[i].firstName + " " + user[i].lastName
                              var responseItem = {
                                              "email": user[i].email,
                                              "name": fullName
                                          }

                              searchSuggestions.push(responseItem);
                            }
                        }
                    }
                  }
              }
            }

            if( searchSuggestions.length < numSuggestions ) {
              for (var i = 0; i < user.length; i++) {
                  // if the user email contains the search phase
                  // index is to locate the position of the substring
                  if( user[i].email.indexOf( req.body.searchPhase ) != -1 ) {
                      if( searchSuggestions.length < numSuggestions) {
                        if ( !checkEmailExistinArray(searchSuggestions, user[i].email) ) {
                          var fullName = user[i].firstName + " " + user[i].lastName
                          var responseItem = {
                                          "email": user[i].email,
                                          "name": fullName
                                      }

                          searchSuggestions.push(responseItem);
                        }
                      }
                  }
              }
            }

            // Continue to search the full name \
            // if the number of email matches is less than numSuggestion
            /*
            if( searchSuggestions.length < numSuggestions) {
                for (var i = 0; i < user.length; i++) {
                    var fullName = user[i].firstName + " " + user[i].lastName;

                    if (fullName.indexOf(req.body.searchPhase) > -1) {
                        if( searchSuggestions.length < numSuggestions) {
                            var responseItem = {
                                            "email": user[i].email,
                                            "name": fullName
                                        }

                            searchSuggestions.push(responseItem);
                        }
                    }
                }
            }
            */

            if(searchSuggestions.length > 0) {
                res.status(200).json(searchSuggestions);
            } else {
                res.status(404).json({"message" : "no matches in the database"});
            }
        })
    })

router.route('/addUserAsFriend/:email')
    .post(function(req, res){
        if(req.body.userList == null) {
            res.status(400).json({"message":"userList cannot be empty"});
        }

        var allAdded = true;
        var friendAdded = 0;
        async.eachSeries(req.body.userList, function(email, next){
            var conditions = {"email":email};

            if (email == req.params.email) {
              allAdded = false;
              next();
            } else {
              User.findOne(conditions, function(err, user){
                  if (err) {
                      res.status(500).send(err);
                  }

                  if(user !== null) {
                      // if the friend to add is not in the friend list
                      if(user.friends.indexOf(req.params.email) == -1) {
                          user.friends.push(req.params.email);
                          user.save(function(err){
                              if(err) {
                                  res.status(500).send(err);
                              }
                          })

                          var conditions = {"email":req.params.email};
                          User.findOne(conditions, function(err, user){
                              user.friends.push(email);
                              user.save(function(err){
                                  if(err) {
                                      res.status(500).send(err);
                                  }
                              })
                              friendAdded++;
                              next();
                          })
                      } else {
                          // the friend is already in the list
                          allAdded = false;
                          next();
                      }
                  } else {
                      // the friend cannot be found
                      allAdded = false;
                      next();
                  }
              });
            }
        }, function(err) {
            if(allAdded) {
                res.status(200).json({"message":"all users in the list are successfully added"});
            } else
                if(friendAdded > 0) {
                    res.status(207).json({"message":"only some users in the list are successfully added"});
                } else {
                    res.status(400).json({"message":"none of the friends in the list are successfully added"});
                }
        })
    })

router.route('/deleteFriend/:email')
    .post(function(req, res) {
        if(req.body.userList == null) {
            res.status(400).json({"message":"friend to be deleted cannot be null or undefined"});
        }

        if(req.body.userList.length == 0) {
           res.status(400).json({"message":"the of friends is empty"});
        }

        var conditions = {"email":req.params.email};
        var deletionList = req.body.userList;

        User.findOne(conditions, function(err, user) {
            var allDeleted = true;
            var numDeleted = 0;

            // Delete the friend email in the list
            for (var i = 0; i < deletionList.length; i++) {
                var deleteIndex = user.friends.indexOf(deletionList[i]);

                if(deleteIndex > -1) {
                    user.friends.splice(deleteIndex, 1);

                    var conditions = {"email":deletionList[i]};
                    User.findOne(conditions, function(err, user) {
                        var deleteIndex = user.friends.indexOf(req.params.email);

                        user.friends.splice(deleteIndex, 1);
                        user.save(function(err){
                            if(err) {
                                res.status(500).send(err);
                            }
                        })
                    });
                    numDeleted++;
                } else {
                    allDeleted = false;
                }
            }

            user.save(function(err) {
                if(err) {
                    res.status(500).send(err);
                }

                if(allDeleted) {
                    res.status(200).json({"message":"all friends deleted successfully"});
                } else
                    if(numDeleted > 0) {
                        res.status(207).json({"message":"some friends cannot be deleted"});
                    } else {
                        res.status(400).json({"message":"none of the friends are deleted"});
                    }
            });
        });
    })

module.exports = router;
