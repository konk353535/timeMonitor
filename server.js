// Config file for apiKey ect
var config = require('./config/config');

var express = require('express')
var app = express()

// body Parser so we can read data sent from client
var bodyParser = require('body-parser');

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Request for API calls
var request = require('request');

// Require Mongoose DB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/timeMonitor');
// Connect to Mongoose DB
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
	console.log("Connected to MongoDB");
});
 
var userModel = require("./models/userModel.js").userModel;
var gameModel = require("./models/gameModel.js").gameModel;



app.get('/', function (req, res) {
	res.send('Hello World')
})

app.post('/newPlayer', function (req, res) {
	console.log("Captain transmission recieved - Private Name - " + req.body.name + " - Battalion - "  + req.body.server);
	getSummonerId(req.body.name, req.body.server);
	res.send("Roger that private, info recieved");
});

// New function takes Summoner_Name + Server_Name
// Returns Summoner_ID or err

function getSummonerId(summonerName, serverName){
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
		summonerName: summonerNameNew,
		updated: false,
		lastMatchId: 25
	});

	// Will update or insert the user, depending if there already a new user or not
	// update(conditions for update, what to update, updateorinsert: true, callback)
	userModel.update({summonerId: summonerID, server: serverName}, {summonerName: summonerNameNew}, {upsert: true}, function (err, newUser) {
	  if (err) return console.error(err);
	  console.log("User Added/Updated");
	});
}
getUsersToUpdate();
function getUsersToUpdate(){
	// Will get a list of users who haven't had there match history read in the last 4 hours
	userModel.find({updated: false}).sort({summonerId: 1}).exec(function (err, userData) {
	  if (err) return console.error(err);
	  console.log(userData);
	});
}

function addGame(newMatchId, newDuration, newChampion, newPosition){
	/*
	Given data will add game to db
	*/
	var newGame = new gameModel({
		  matchId: newMatchId
		, dateTime  :  new Date()
		, duration   :   newDuration
		, champion :  newChampion
		, position : newPosition
	});

	newGame.save(function (err, newGame) {
		if (err) return console.error(err);
		// Successfully added game to db
		console.log("New Game Added");
	});
}

/*
gameModel.find(function (err, gameData) {
  // Error
  if (err) return console.error(err);
  gameData = gameData[0];
  date = new Date(gameData["dateTime"]);
  console.log(date.getTime());
});
*/

app.listen(3000)
console.log("Listening on port 3000");