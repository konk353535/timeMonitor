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
mongoose.connect('mongodb://localhost/champions');
// Connect to Mongoose DB
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log("Connected to MongoDB");
});
 
app.get('/', function (req, res) {
  res.send('Hello World')
})

app.post('/newPlayer', function (req, res) {
  console.log("Captain transmission recieved - Private Name - " + req.body.name + " - Battalion - "  + req.body.server);
  res.send("Roger that private, info recieved");
});

// New function takes Summoner_Name + Server_Name
// Returns Summoner_ID or err

 function getSummonerId(summonerName, serverName){
	// Request Games From Dev Challenge End Point
	request('https://oce.api.pvp.net/api/lol/oce/v4.1/game/ids?beginDate=' + epoch_timer + '&api_key=' + config.apikey , function (error, response, body) {
		if (!error && response.statusCode == 200) {
			console.log(body);
			// Once game list recieved, pass to game handler
			Game_Manager(null, body, Game_Extractor);
		}
	});
 }

app.listen(3000)
console.log("Listening on port 3000");