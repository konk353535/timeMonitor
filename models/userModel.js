var mongoose = require("mongoose");

// Mongoose User Schema
// Define schema
var UserSchema = mongoose.Schema({
    summonerId  :  { type: Number, index: true}
  , server  :  { type: String}
  , summonerName   :  { type: String }
  , updated :  { type: Boolean, default: false }
  , lastMatchId : { type:Number, default: 25}
  , offset : {type: Number}
});

var userModel = mongoose.model('users', UserSchema);

module.exports = {
	userModel: userModel
}