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

// Converting to UTC
var moment = require('moment-timezone');

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

		var oldestRecordedGame = gameData[0].matchId;
		var summonerId = user.summonerId;
		var server = user.server;

		var indexFrom = 1500;
		var indexTo = 1515;

		var errorCount = 0;

		getOldGames(user, oldestRecordedGame, summonerId, server, indexFrom, 
			indexTo, errorCount)
	});
}

function getOldGames(user, oldestRecordedGame, summonerId, server, indexFrom, indexTo, errorCount){


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

			var gamesData = JSON.parse(response.body);
			var numberOfKeys = Object.keys(gamesData).length;

			indexFrom += 15;
			indexTo += 15;

			if(numberOfKeys == 0){
				// Scan complete
				console.log("indexFrom =" + indexFrom + "err =" + errorCount);

				// Update users backLogged status
				userBackLogged(user);
			} else {

				// Pass to analysis function
				analyzeGameSet(user, gamesData, oldestRecordedGame);

				// Keep scanning
				getOldGames(user, oldestRecordedGame, summonerId, server, indexFrom, indexTo, errorCount);
			}

		} else {
			// Has there been too many errors to keep going?
			
			if(errorCount >= 150){
				// Don't Rerequest url
			} else {
				// Rerequest given url
				getOldGames(user, oldestRecordedGame, summonerId, server, indexFrom, indexTo, errorCount+1);
			}
		}
	});
	
}

function analyzeGameSet(user, gamesData, oldestRecordedGame){

	// Get the array of games
	var gamesData = gamesData["matches"];

	// Iterate through each game
	gamesData.forEach(function(game){
		
		if(game.matchId < oldestRecordedGame){

			var participants = game.participants[0];

			var stats = participants["stats"];
			var timeline = participants["timeline"];

			var matchId = game.matchId;
			var timePlayed = game.matchDuration;
			var champion = participants.championId;
			var dateCreated = game.matchCreation;

			var position = timeline.lane;

			var isWin = stats.winner;

			if(position == "TOP"){
				position = 1;
			} else if(position == "MIDDLE"){
				position = 2;
			} else if(position == "JUNGLE"){
				position = 3;
			} else if(position == "BOTTOM"){
				position = 4;
			} else {
				position = 0;
			}

			addGame(user, matchId, timePlayed, champion, position, 
				dateCreated, isWin)


		} else {
			// This game has already been recorded

		}
	});

}

function addGame(user, newMatchId, newDuration, newChampion, newPosition, dateCreated, isWin){
	/*
	Given data will add game to db
	*/

	// Format date so that it is UTC timezone
	var dateCreatedUtc = moment.tz(dateCreated, "UTC").format();
	console.log("DateCreated - " + dateCreatedUtc);

	var newGame = new gameModel({
		matchId: newMatchId,
		dateTime  :  dateCreatedUtc,
		duration   :   newDuration,
		champion :  newChampion,
		position : newPosition,
		server : user.server,
		userId : user._id,
		isWin : isWin
	});

	newGame.save(function (err, newGame) {
		if (err) return console.error(err);
	});
	user = null;
}

function userBackLogged(user){
	userModel.update({"_id": user._id}, { backLogged: true}, function(err,res){

		if(err) return handleError(err);

		console.log(user.summonerName + " backlogged");
	});
}

// Functions that can be called outside this module
module.exports = {
  backLogUser: backLogUser
}