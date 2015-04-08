// Config file for apiKey ect
var config = require('./config/config');
// Express
var express = require('express')
var app = express()
// body Parser so we can read data sent from client
var bodyParser = require('body-parser');
// Define where to pull front end docs from
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

// Cron manager to reset users every 4 hours
// Update a user every 5 minutes
var cronManager = require("./cronManager.js");
 
//var userModel = require("./models/userModel.js").userModel;
//var gameModel = require("./models/gameModel.js").gameModel;

var userAddManager = require("./userAddManager.js");


app.get('/', function (req, res) {
	res.send('Hello World')
})

app.post('/newPlayer', function (req, res) {
	console.log("Captain transmission recieved - Private Name - " + req.body.name + " - Battalion - "  + req.body.server);
	userAddManager.addUser(req.body.name, req.body.server);
	res.send("Roger that private, info recieved");
});


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