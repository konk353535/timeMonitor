var mongoose = require("mongoose");

// Mongoose User Schema
// Define schema
var UserSchema = mongoose.Schema({
    summonerId  :  { type: Number, index: true},
    server  :  { type: String},
    summonerName   :  { type: String },
    updated :  { type: Boolean, default: false },
    lastMatchId : { type: Array, default: [25]},
    offset : {type: Number},
    backLogged : {type: Boolean, default: false}
});

var userModel = mongoose.model('users', UserSchema);

module.exports = {
	userModel: userModel
}