var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var pkghotelSchema   = new Schema({
    destination: String,
    name: String,
    checkinTime: Date,
    checkoutTime: Date,
    price: Number,
    address: String
});

pkghotelSchema.options.toJSON = {
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
};

module.exports = mongoose.model('hotel', pkghotelSchema);
