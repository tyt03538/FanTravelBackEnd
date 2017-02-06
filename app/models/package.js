var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var flightSchema = new Schema({
	flightNumber: String,
	departureDate: Date,
	arrivalDate: Date,
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
	pid: String,
	dest: String,
	price: Number,
	flights: [
		flightSchema
	],
	hotels: [
		hotelSchema
	]
});

module.exports = mongoose.model('package', packageSchema);
