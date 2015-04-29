
// Config file for apiKey ect
var config = require('./config/config');
// Request for API Calls
var request = require('request');
// Models for DB interaction
var userModel = require("./models/userModel.js").userModel;
var gameModel = require("./models/gameModel.js").gameModel;
// Converting to UTC
var moment = require('moment-timezone');

// Update User Games Functions
var updateUser = function getUserToUpdate(){

	console.log("Started - " + new Date());
	
	// Will select a list of users to update
	// Must be not new users (lastMatchId > 25) as new users are updated seperately
	userModel.find({updated: false, lastMatchId:{$gt:25}}).sort({lastMatchId: 1}).limit(105).exec(function (err, userData) {
		if (err) return console.error(err);
		// Got the user data commander!
		// Make sure we atleast found one
		console.log("Length - " + userData.length);
		if(userData.length > 0){
			while(userData.length > 0){
				// Lets remove him from the array, so we can use him like an object
				var user = userData[0];
				// Remove from array so we know when we have processed all users
				userData.splice(0, 1);

				scanUserGames(user, null);
			}
			userData = null;
			user = null;
		}
		else{
		// No soilders left to update commander
			console.log("Commander everyone is updated");
		}
	});
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
	// Request last 10 games
	request('https://' + serverName + '.api.pvp.net/api/lol/' + serverName + '/v1.3/game/by-summoner/' + summonerId + '/recent?api_key=' + config.apikey ,
	function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log("Data Recievied - " + user.summonerName);
			analyzeGames(user, JSON.parse(response.body), resToClient);
		}
		else {
			console.log("Invalid Summoner Name or Server" + user.summonerName + " - " + user.server);

			// Run check that user is a legit user

			request('https://' + serverName + '.api.pvp.net/api/lol/' + serverName + '/v1.4/summoner/by-name/' + user.summonerName + '?api_key=' + config.apikey , function (error, response, body) {
				if (!error && response.statusCode == 200) {
					var userData = JSON.parse(response.body);
					// Clearly a legit user
					// Must of no previous games or match v1.3 is down
					updateUserReset(user._id);
				}
				else {
					console.log("Invalid Summoner Name or Server");
				}
			});
		}
	});
}

function updateUserReset(userId){
	userModel.update({"_id":  userId}, { updated: true}, function(err, newInfo){
		if(err) return handleError(err);
		console.log("User Fully Updated");
		console.log("Finished - " + new Date());
	});
}

function analyzeGames(user, gamesData, resToClient){
	var lastMatchId = user.lastMatchId;
	// So we can update the last match id of the player later
	var currentMaxMatchId = 0;
	var gamesData = gamesData.games;
	gamesData.forEach(function(game){
		// To make sure we're only using new games (that we haven't added to DB)
		if(game.gameId > lastMatchId){
			// console.log(game.gameId + " > " + lastMatchId);
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

			if(currentMaxMatchId < matchId){
				currentMaxMatchId = matchId;
			}

			addGame(user, matchId, timePlayed, champion, position, dateCreated,isWin);
		}
		else {
			// console.log(game.gameId + " < " + lastMatchId);
		}
	});
	// Update last match id
	if(currentMaxMatchId > 0){
		console.log("Last game played - " + currentMaxMatchId);
		userModel.update({"_id":  user._id}, { lastMatchId: currentMaxMatchId}, function(err, newInfo){
			if(err) return handleError(err);
			console.log("maxMatchId Updated");
		});
	}
	// Change updated status, so we know we've scanned this user recently
	updateUserReset(user._id);

	// Is this a new user update or not
	if(resToClient !== null){

		// Send graphDataFound to client for regraphing
		resToClient.send("ReGraphPlz");
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
		// Successfully added game to db
		console.log("New Game Added");
	});
	user = null;
}

var resetAllUsers = function resetAllUsers(){
	/*
	Resets all users updated field to false
	*/
	userModel.update({}, {updated: false}, {multi: true}, function (err, numAffected) {
	  if (err) return console.error(err);
	  console.log("Reset Users Updated Field");
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

	    	// Check if new user or not
	    	if(userData.lastMatchId == 25){
	    		console.log(userData);
	    		console.log("lmID" + userData.lastMatchId);
	    		// New User
	    		// 2) If lastMatchId is 25, send this user to update function
  				scanUserGames(userData, resToClient);
	    	}
	    	else {

	    		// Existing User
	    		resToClient.send("UserUpdated");
	    	}
	    }

	});
}


module.exports = {
	updateUser: updateUser,
	resetAllUsers: resetAllUsers,
	updateNewUser : updateNewUser
}