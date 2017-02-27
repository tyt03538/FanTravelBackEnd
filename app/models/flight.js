var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var flightSchema   = new Schema({
    "destination": String,
    "flights": [{
        "flightNumber": String,
        "departureDate": Date,
        "flightDuration": Date,
        "price": Number,
        "departurePort": String,
        "arrivalPort": String
      }
    ]
});

flightSchema.options.toJSON = {
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
};

module.exports = mongoose.model('hotel', flightSchema);
