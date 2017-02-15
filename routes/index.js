// user.js

// BASE SETUP
// =============================================================================
var express = require('express');
var router = express.Router();              // get an instance of the express Router
var userRoutes = require('./user');
var tripRoutes = require('./trip');
var packageRoutes = require('./package');

// ROUTES FOR THE USER API
// =============================================================================
// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log(Date() + req.ip + ' is calling to the server.');
    next(); // make sure we go to the next routes and don't stop here
});

router.route('/_health')
    .get(function(req, res) {
        res.status(200).json({"healthCheck":"OK"});
    })

// ROUTES TO OTHER SUB-ROUTERS
// =============================================================================
router.use('/user', userRoutes);
router.use('/trip', tripRoutes);
router.use('/package', packageRoutes);

module.exports = router;
