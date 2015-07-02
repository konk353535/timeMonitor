// Config file for apiKey ect
var config = require('./config/config');
// Request for API Calls
var request = require('request');
// Models for DB interaction
var userModel = require("./models/userModel.js").userModel;

// User Updater so we can quickly update new users
var userUpdateManager = require("./userUpdateManager.js");

// New User Functions
var addUser = function getSummonerId(summonerName, serverName, offset, res){

	// Request Summoner ID
	request('https://' + serverName + '.api.pvp.net/api/lol/' + serverName + '/v1.4/summoner/by-name/' + summonerName + '?api_key=' + config.apikey , function (error, response, body) {
		if (!error && response.statusCode == 200) {
			userData = JSON.parse(response.body);
			console.log("Data Recievied - ");
			newUserAdd(userData, serverName, offset, res);
		}
		else {
			console.log("Invalid Summoner Name or Server");
			res.status(404).send("Error, invalid summoner name or server");
		}
	});
}

function newUserAdd(playerData, serverName, offset, resToClient){
	/*
	Adds new user to db, or update's existing users summoner name (incase of name change)
	*/

	// Gets the key needed to access user data
	for (var key in playerData) {
	  if (playerData.hasOwnProperty(key)) {
	    playerKey = key;
	  }
	}

	// Gets user data from JSON object using key
	playerData = playerData[playerKey];

	var summonerNameNew = playerData["name"];

	// Make sure lower case
	summonerNameNew = summonerNameNew.toLowerCase();

	// Remove spaces
	summonerNameNew = summonerNameNew.replace(/\s+/g, '');

	var summonerID = playerData["id"];

	console.log("Name: " + summonerNameNew + ", ID: " + summonerID + ", Server: " + serverName);


	// Run mongoDb Query to check if this is existing/new user
	userModel.findOne({"summonerId":summonerID, "server":serverName}).exec(
	function (err, userData) {
	    if (err) res.status(500).send(err);
	    if(userData !== null && userData.lastMatchId > 25){
	    	// Existing User
	    	updateUser(summonerID, serverName, summonerNameNew, offset, resToClient);
	    } else {
	    	// New User
	    	newUser(summonerID, serverName, summonerNameNew, offset, resToClient);
	    }
	});


}

function newUser (summonerID, serverName, summonerNameNew, offset, resToClient) {

	var newUser= new userModel({
		summonerId: summonerID,
		server: serverName,
		summonerName: summonerNameNew,
		offset: offset
	});



	userModel.create(newUser, function (err, newUser) {

	  if (err) res.status(500).send(err);
	  userUpdateManager.updateNewUser(summonerID, serverName, resToClient);

	});

}

function updateUser (summonerID, serverName, summonerNameNew, offset, resToClient) {

	userModel.update({summonerId: summonerID,server: serverName},
	{summonerName:summonerNameNew, offset:offset}, function (err, newUser) {

	  if (err) return console.error(err);
	  console.log("User Updated");
	  resToClient.send("User Updated");

	});
}

module.exports = {
	addUser: addUser
}