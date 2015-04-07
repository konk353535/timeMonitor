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
	// Check if we already have this user in the db

	var newUser= new userModel({
		summonerId: summonerID,
		server: serverName,
		summonerName: summonerNameNew,
		updated: false,
		lastMatchId: 25
	});

	newUser.save(function (err, newUser) {
	  if (err) return console.error(err);
	  console.log("User Added");
	});
}

app.listen(3000)
console.log("Listening on port 3000");