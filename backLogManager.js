/****
	* The purpose of the backLogManager is to contain all the scripts
	* associated with grabbing a users old ranked games. We do this  
	* because only ranked games can be looked back at. Normal games
	* are only seeable on the last 10 games a user has played.
	*
	* The process of getting a users old ranked games will go
	* (1) Check that the user isn't already backlogged
	* (2) Get the users earliest recorded match id
	* (3) Iterate through users ranked games, add games that
		- Match_Id < earliestRecordedMatchId
	* (4) Update users backLogged status
****/

// Models to interface with Mongo DataBase
var userModel = require("./models/userModel.js").userModel;
var gameModel = require("./models/gameModel.js").gameModel;


// Check given user isn't updated
var backLogUser = function verifyUser(userId){






}










// Functions that can be called outside this module
module.exports = {
  backLogUser: backLogUser
}