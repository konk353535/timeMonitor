
// Config file for apiKey ect
var config = require('./config/config');
// Request for API Calls
var request = require('request');
// Models for DB interaction
var userModel = require("./models/userModel.js").userModel;
var gameModel = require("./models/gameModel.js").gameModel;

// Update User Games Functions
var updateUser = function getUserToUpdate(){
	// Will get a list of users who haven't had there match history read in the last 4 hours
	userModel.find({updated: false}).sort({summonerId: -1}).limit(1).exec(function (err, userData) {
		if (err) return console.error(err);
		// Got the user data commander!
		// Make sure we atleast found one
		if(userData.length > 0){
			// Lets remove him from the array, so we can use him like an object
			user = userData[0];
			scanUserGames(user);
		}
		else{
		// No soilders left to update commander
			console.log("Commander everyone is updated");
		}
	});	
}
function scanUserGames(user){
	/*
	Make request for specified user's match history (using game v1.3 API)
	*/
	summonerId = user.summonerId;
	serverName = user.server;
	// Request last 10 games
	request('https://' + serverName + '.api.pvp.net/api/lol/' + serverName + '/v1.3/game/by-summoner/' + summonerId + '/recent?api_key=' + config.apikey , 
	function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log("Data Recievied");
			analyzeGames(user, JSON.parse(response.body));
		}
		else {
			console.log("Invalid Summoner Name or Server");
		}
	});
}

function analyzeGames(user, gamesData){
	lastMatchId = user.lastMatchId;
	// So we can update the last match id of the player later
	currentMaxMatchId = 0;
	gamesData = gamesData.games;
	gamesData.forEach(function(game){
		// To make sure we're only using new games (that we haven't added to DB)
		if(game.gameId > lastMatchId){
			console.log(game.gameId + " > " + lastMatchId);
			stats = game.stats;

			matchId = game.gameId;
			timePlayed = stats.timePlayed;
			champion = game.championId;
			position = stats.playerPosition;
			dateCreated = game.createDate;
			if(position === undefined){
				position = 0;
			}

			if(currentMaxMatchId < matchId){
				currentMaxMatchId = matchId;
			}

			addGame(user, matchId, timePlayed, champion, position, dateCreated);
		}
		else {
			console.log(game.gameId + " < " + lastMatchId);
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
	userModel.update({"_id":  user._id}, { updated: true}, function(err, newInfo){
		if(err) return handleError(err);
		console.log("User Fully Updated");
	});
}

function addGame(user, newMatchId, newDuration, newChampion, newPosition, dateCreated){
	/*
	Given data will add game to db
	*/
	var newGame = new gameModel({
		  matchId: newMatchId
		, dateTime  :  new Date(dateCreated)
		, duration   :   newDuration
		, champion :  newChampion
		, position : newPosition
		, server : user.server
		, userId : user._id
	});

	newGame.save(function (err, newGame) {
		if (err) return console.error(err);
		// Successfully added game to db
		console.log("New Game Added");
	});
}



module.exports = {
	updateUser: updateUser
}