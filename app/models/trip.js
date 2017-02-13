var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var tripSchema   = new Schema({
    tripID: String,
	status: String, // status = scheduling, pendingPackages, ranking, confirming, paying, completed, cancelled
	initiator: String,
	period: [ {startDate : Date, endDate : Date} ],
	travellers: [
		{
			email: String,
			availableDates: [ { startDate: Date, endDate: Date } ],
			packageRank: [ String ],
			packageConfirmation: String, // packageConfirmation = accepted, declined
			paymentStatus: String
		}
	],
	targetDestination: String,
	packageAssigned: [ String ],
	packageChosen: String,
	paymentMethod: String
});

tripSchema.options.toJSON = {
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
};

module.exports = mongoose.model('trip', tripSchema);