var async = require('async');

var Hotel = require('./app/models/hotel');
var Flight = require('./app/models/flight');
var Package = require('./app/models/package')

var pkgGen = {
  generate: function() {
    Hotel.find(function(err, hotel){
      Flight.find(function(err, flight){
        console.log(hotel.length);
        console.log(flight.length);
      })
    })
  }
}

module.exports = pkgGen;
