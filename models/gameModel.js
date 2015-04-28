var mongoose = require("mongoose");

// Mongoose User Schema
// Define schema
var GameSchema = mongoose.Schema({
  matchId  :  { type: Number, index: true},
  dateTime  :  { type: Date},
  duration   :  { type: Number },
  champion :  { type: Number },
  position : {type: Number},
  server : {type: String},
  userId : {type: mongoose.Schema.ObjectId, ref: 'UserSchema'},
  isWin : {type: Boolean}
  // top = pos 1, role 4
  // mid = pos 2, role 4
  // JG = pos 3
  // Supp = pos 4, role 2
  // Adc = pos 4, role 3
});

var gameModel = mongoose.model('games', GameSchema);

module.exports = {
	gameModel: gameModel
}