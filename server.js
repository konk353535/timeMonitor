// Express
var express = require('express')
var app = express()

// body Parser so we can read data sent from client
var bodyParser = require('body-parser');

// Define where to pull front end docs from
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Require Mongoose DB
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/timeMonitor');
// Connect to Mongoose DB
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
	console.log("Connected to MongoDB");
});

// Cron manager to reset users every x hours/minutes
// Cron manager to update user every x second/minutes
var cronManager = require("./cronManager.js");

// User add manager to handle new user posts
var userAddManager = require("./userAddManager.js");

var statManager = require("./statManager.js");



app.post('/stat', function(req,res){

	var playerObject = req.body;
	var playerName = playerObject.name;

	// lowercase playerName
	playerName = playerName.toLowerCase();

	statManager.getStats(playerName, req.body.server, req.body.statType, res);
})


app.get('/', function (req, res) {
	res.send('Hello World');
})

app.get('/user/:sName/:serName/', function(req, res){
	console.log(req.params);
	console.log("Summ Name: " + req.params.sName);
	console.log("Server Name: " + req.params.serName);
	res.sendFile(__dirname + '/public/user.html');
})

app.post('/graph', function(req,res){
	var graphManager = require('./graphManager.js');
	var graphManagerOne = graphManager;

	var playerObject = req.body;
	var playerName = playerObject.name;

	// lowercase playerName
	playerName = playerName.toLowerCase();

	console.log("HERE -- " + playerName);
	// Req.body contains graphName, clientTimeZoneOffSet, dates
	graphManagerOne.getGraph(playerName, playerObject["server"], req.body, res);
})

app.post('/newPlayer', function (req, res) {
	console.log("Captain transmission recieved - Private Name - " + req.body.name + " - Battalion - "  + req.body.server);
	userAddManager.addUser(req.body.name, req.body.server, req.body.reqOffset, res);
	//res.send("Roger that private, info recieved");
});

app.listen(3000)
console.log("Listening on port 3000");