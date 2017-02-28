var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var flightSchema = new Schema({
	flightNumber: String,
	departureDate: Date,
	arrivalDate: Date,
	flightDuration: String,
	price: Number,
	departurePort: String,
	arrivalPort: String
});

var hotelSchema = new Schema({
	name: String,
	checkinDate: Date,
	checkoutDate: Date,
	price: Number,
	address: String
})

var packageSchema = new Schema({
	packageID: String,
	destination: String,
	price: Number,
	flights: [
		flightSchema
	],
	hotels: [
		hotelSchema
	]
});

packageSchema.options.toJSON = {
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
};

module.exports = mongoose.model('package', packageSchema);
