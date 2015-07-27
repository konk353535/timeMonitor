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

// Config file for apiKey ect
var config = require('./config/config');

// Request for API Calls
var request = require('request');

// Check given user isn't updated
var backLogUser = function verifyUser(userId){

  userModel.findOne({"_id":userId}).exec(function (err, user) {

  	if (err) console.log("Error in backLogManager - " + err);
  	
  	if(user && user.lastMatchId[0] !== 25 && user.backLogged === false){
  		// Send valid user to get earliestRecordedMatchId
  		getEarliestGame(user);
  	}

  });
}

function getEarliestGame(user){

	gameModel.find({userId : user._id})
			 .sort({matchId : 1})
			 .limit(1)
			 .exec(function(err,gameData){

		if(err) console.log(err);

		var oldestRecordedGame = gameData.matchId;
		var summonerId = user.summonerId;
		var server = user.server;

		var indexFrom = 2100;
		var indexTo = 2115;

		var errorCount = 0;

		getOldGames(oldestRecordedGame, summonerId, server, indexFrom, 
			indexTo, errorCount)
	});
}

function getOldGames(oldestRecordedGame, summonerId, server, indexFrom, indexTo, errorCount){


	// Iterate until we get 200 res + empty response
	var matchHistoryUrl = 'https://' + server
	+ '.api.pvp.net/api/lol/' + server 
	+ '/v2.2/matchhistory/' + summonerId 
	+ '?beginIndex=' + indexFrom 
	+ '&endIndex=' + indexTo
	+ '&api_key=' + config.apikey;

	console.log(matchHistoryUrl);

	// Request up to 15 games
	request( matchHistoryUrl,
	function (error, response, body) {
		if(error) console.log(error)

		if (!error && response.statusCode == 200) {

			var gameData = JSON.parse(response.body);
			var numberOfKeys = Object.keys(gameData).length;

			indexFrom += 15;
			indexTo += 15;

			if(numberOfKeys == 0){
				// Scan complete
				console.log("indexFrom =" + indexFrom + "err =" + errorCount);
			} else {
				// Keep scanning
				getOldGames(oldestRecordedGame, summonerId, server, indexFrom, indexTo, errorCount);
			}

		} else {
			// Inc error count by one

			// Has there been too many errors to keep going?
			
			// Rerequest given url
			getOldGames(oldestRecordedGame, summonerId, server, indexFrom, indexTo, errorCount+1);
		}
	});
	

}



// Functions that can be called outside this module
module.exports = {
  backLogUser: backLogUser
}