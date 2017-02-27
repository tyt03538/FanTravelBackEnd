var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var hotelSchema   = new Schema({
    "destination": String,
    "name": String,
    "checkinTime": Date,
    "checkoutTime": Date,
    "price": Number,
    "address": String
});

hotelSchema.options.toJSON = {
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
};

module.exports = mongoose.model('hotel', hotelSchema);
