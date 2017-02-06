var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var packageSchema   = new Schema({
    packageID: String,
    destination: String,
    ImageURL: String,
    price: {
		total: Float,
		flight: Float,
		hotel: FLoat
	}
    flights:[
		{
			flightNumber: String,
			departureDate: String,
			arrivalDate: String
		}
	]
    hotels:[
		{
			hotelName: String,
			checkinDate: String,
			checkoutDate: String,
		}
	}
    availableDate: [ {startDate : String, endDate : String} ],
    targetDestination: String,
    schColStatus:  [ {uid : String, provided : Boolean} ],
    packageAssigned: String,
    packageChosen: String
});

module.exports = mongoose.model('package', packageSchema);
