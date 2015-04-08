// Config file for apiKey ect
var config = require('./config/config');
// Request for API Calls
var request = require('request');
// Models for DB interaction
var userModel = require("./models/userModel.js").userModel;

// New User Functions
var addUser = function getSummonerId(summonerName, serverName){
	// Request Summoner ID
	request('https://' + serverName + '.api.pvp.net/api/lol/' + serverName + '/v1.4/summoner/by-name/' + summonerName + '?api_key=' + config.apikey , function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log("Data Recievied");
			newUserAdd(response.body, serverName);
		}
		else {
			console.log("Invalid Summoner Name or Server");
		}
	});
}

function newUserAdd(playerJsonData, serverName){
	/*
	Adds new user to db, or update's existing users summoner name (incase of name change)
	*/

	playerData = JSON.parse(playerJsonData);
	// Gets the key needed to access user data
	for (var key in playerData) {
	  if (playerData.hasOwnProperty(key)) {
	    playerKey = key;
	  }
	}
	// Gets user data from JSON object using key
	playerData = playerData[playerKey];

	summonerNameNew = playerData["name"];
	summonerID = playerData["id"];
	console.log("Name: " + summonerNameNew + ", ID: " + summonerID + ", Server: " + serverName);
	

	var newUser= new userModel({
		summonerId: summonerID,
		server: serverName,
		updated: false,
		lastMatchId: 25,
		summonerName: summonerNameNew
	});
	// Because we need newUser clone without the ID, (for updating)
	var upsertData = newUser.toObject();
	delete upsertData._id

	console.log("Sup");
	// Will update or insert the user, depending if there already a new user or not
	// update(conditions for update, what to update, updateorinsert: true, callback)
	userModel.update({summonerId: summonerID, server: serverName}, upsertData, {upsert: true}, function (err, newUser) {
	  if (err) return console.error(err);
	  console.log("User Added/Updated");
	});
}

module.exports = {
	addUser: addUser
}