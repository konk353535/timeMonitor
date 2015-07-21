
// Config file for apiKey ect
var config = require('./config/config');

// Request for API Calls
var request = require('request');

// Models for DB interaction
var userModel = require("./models/userModel.js").userModel;
var gameModel = require("./models/gameModel.js").gameModel;

// Converting to UTC
var moment = require('moment-timezone');

// Keeps a tally of how many users we are currently updating
var updateNumber = 0;

// Update User Games Functions
var updateUser = function getUserToUpdate(){

	// Only update if last update is completed
	if(updateNumber <= 0){
		
		// Grab Users to update
		userModel.find({updated: false, lastMatchId:{$ne:25}})
		.sort({lastMatchId: -1})
		.limit(150)
		.exec(function (err, userData) {

			if (err) return console.error(err);
			
			if(userData.length > 0){
				updateNumber += userData.length;
				while(userData.length > 0){
					var user = userData[0];
					userData.splice(0, 1);
					scanUserGames(user, null);
				}
				userData = null;
				user = null;
			} else {
				console.log("Everyone is updated");
			}

		});
	} else {
		console.log("Can't update yet still - " + updateNumber);
	}
}
function scanUserGames(user, resToClient){
	/*
	Make request for specified user's match history (using game v1.3 API)
	Pass games found onto an analyzer
	---- Work Around ----
	If 404 returned, check that this is a legit user, if they are then set updated=true (some people have no games on the api server, so even thought they are a user
	they will return a 404 for recent games as they have none
	*/

	var summonerId = user.summonerId;
	var serverName = user.server;

	var matchHistoryUrl = 'https://' + serverName 
	+ '.api.pvp.net/api/lol/' + serverName 
	+ '/v1.3/game/by-summoner/' + summonerId 
	+ '/recent?api_key=' + config.apikey;


	// Request last 10 games
	request( matchHistoryUrl,
	function (error, response, body) {

		if (!error && response.statusCode == 200) {
			analyzeGames(user, JSON.parse(response.body), resToClient);
		} else {
			
			var checkUserExistsUrl = 'https://' + serverName 
			+ '.api.pvp.net/api/lol/' + serverName 
			+ '/v1.4/summoner/by-name/' + user.summonerName 
			+ '?api_key=' + config.apikey;

			request(checkUserExistsUrl , function (error, response, body) {

				if (!error && response.statusCode == 200) {
					// Legit user
					var userData = JSON.parse(response.body);

					// Must of no previous games or match v1.3 is down
					updateNumber -= 1;
					updateUserReset(user._id);
				} else {
					console.log("Err: Invalid Summoner Name or Server!");

					// Flag user for not being legit
					updateNumber -= 1;
				}
			});
		}
	});
}

function updateUserReset(userId){
	userModel.update({"_id": userId}, { updated: true}, function(err, newInfo){

		if(err) return handleError(err);

		if(updateNumber == 0){
			console.log("Finished - " + new Date());
		}
	});
}

function analyzeGames(user, gamesData, resToClient){
	var lMatchId = user.lastMatchId;
	var newMatchId = [];


	// So we can update the last match id of the player later
	var currentMaxMatchId = 0;

	var gamesData = gamesData.games;

	gamesData.forEach(function(game){

		// To make sure we're only using new games
		if(game.gameId > lMatchId[0] && lMatchId.indexOf(game.gameId) == -1){

			// console.log(game.gameId + " > " + lMatchId);
			var stats = game.stats;

			var matchId = game.gameId;
			var timePlayed = stats.timePlayed;
			var champion = game.championId;
			var position = stats.playerPosition;
			var dateCreated = game.createDate;
			var isWin = stats.win;

			if(position === undefined){
				position = 0;
			}

			newMatchId.push(matchId);

			addGame(user, matchId, timePlayed, champion, position, dateCreated,isWin);
		}
		else {
			// console.log(game.gameId + " < " + lastMatchId);
		}
	});

	// Update last match ids
	if(newMatchId.length > 0){
		
		var numOldGames = lMatchId.length;
		var numNewGames = newMatchId.length;

		// Remove smallest old id's
		for(var i = 0; i < numOldGames+numNewGames-10; i++){
			lMatchId.shift();
		}

		for(var i = 0; i < numNewGames; i++){
			lMatchId.push(newMatchId.pop());
		}

		lMatchId.sort(function(a,b){
			return a-b;
		});		


		userModel.update({"_id":  user._id}, { lastMatchId: lMatchId}, function(err, newInfo){
			if(err) return handleError(err);
		});

	}

	updateUserReset(user._id);

	// Is this a new user being updated?
	if(resToClient !== null){

		// Tell client to regraph
		resToClient.send("ReGraphPlz");
	} else {
		updateNumber -= 1;
	}
	
	gamesData = null;
	user = null;
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

var resetAllUsers = function resetAllUsers(){
	/*
	Resets all users updated field to false
	*/
	userModel.update({}, {updated: false}, {multi: true}, 
		function (err, numAffected) {

	  if (err) return console.error(err);

	  console.log("All users updated reset");

	});
}

var updateNewUser = function updateNewUser(summonerId, userServer, resToClient){
	// Multi-Step Process
	// 1) Find this user in mongodb, if lastMatchId is not 25, end(res updated)
  	userModel.findOne({"summonerId":summonerId, "server":userServer}).exec(
	function (err, userData) {
	    if (err) return console.error(err);

	    // Found the user
	    if(userData !== null){

	    	if(userData.lastMatchId[0] == 25){

	    		// New User (Update Matches Now)
  				scanUserGames(userData, resToClient);
	    	} else {

	    		// Existing User
	    		resToClient.send("User Updated");
	    	}
	    }

	});
}


module.exports = {
	updateUser: updateUser,
	resetAllUsers: resetAllUsers,
	updateNewUser : updateNewUser
}