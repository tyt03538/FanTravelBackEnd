var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var pkgflightSchema   = new Schema({
    destination: String,
    flights: [{
        flightNumber: String,
        departureDate: Date,
        flightDuration: String,
        price: Number,
        departurePort: String,
        arrivalPort: String
      }
    ]
});

pkgflightSchema.options.toJSON = {
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
};

module.exports = mongoose.model('flight', pkgflightSchema);
