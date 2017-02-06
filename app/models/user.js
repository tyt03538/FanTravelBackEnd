var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var userSchema   = new Schema({
    email: String,
    title: String,
    loginToken: String,
    firstName: String,
    lastName: String,
    preferences: [  {
                        prefID : String,
                        pref:[ String ]
                    } ],
    friends: [ String ],
    pendingTrips: [ String ],
    confirmedTrips: [ String ]
});

userSchema.options.toJSON = {
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
  }
};

module.exports = mongoose.model('user', userSchema);
