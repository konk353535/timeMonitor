
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

// Stat manager for retrieving stats
var statManager = require("./statManager.js");

// Testing out championTotalManager
var championTotals = require("./championTotalManager.js");

// userCounter to get number of users
var userCounter = require('./userCounter.js');

var graphManager = require('./graphManager.js');


var compareManager = require('./compareManager.js');

app.get('/countUsers', function(req,res){

	// Send to counter to send to client
	userCounter.getCount(res);

});

app.post('/championTotals', function(req,res){

	var playerObj = req.body;
	
	var server = playerObj.server;
	var username = playerObj.name;

	username = username.toLowerCase();
	// Remove spaces
	username = username.replace(/\s+/g, '');

	championTotals.championsUser(username, server, res);
});

app.post('/stat', function(req,res){

	var statOptions = req.body;
	var username = statOptions.name;

	username = username.toLowerCase();
	// Remove spaces
	username = username.replace(/\s+/g, '');

	statManager.getStats(username, statOptions, res);
})


app.get('/', function (req, res) {	
	res.send('Hello World');
})

app.get('/user/:sName/:serName/:timePeriod', function(req, res){

	if(req.params.timePeriod == "Today"){
		res.sendFile(__dirname + '/public/userToday.html');
	} else if(req.params.timePeriod == "ThisWeek") {
		res.sendFile(__dirname + '/public/userWeek.html');
	} else if(req.params.timePeriod == "ThisMonth"){
		res.sendFile(__dirname + '/public/userMonth.html');
	} else {
		res.sendFile(__dirname + '/public/user.html');
	}

})

app.get('/compare', function(req, res){
	res.sendFile(__dirname + '/public/compare.html');
})

app.post('/graph', function(req,res){

	var graphInfo = req.body;

	var server = graphInfo.server;
	var username = graphInfo.name;

	username = username.toLowerCase();
	// Remove spaces
	username = username.replace(/\s+/g, '');

	graphManager.getGraph(username, server, graphInfo, res);
})

app.post('/newPlayer', function (req, res) {
	var username = req.body.name;
	var server = req.body.server;
	var offset = req.body.reqOffset;

	userAddManager.addUser(username, server, offset, res);
});

app.listen(3000);

console.log("Listening on port 3000");

/* Compare Code In Works 
var baseUser = {
	summonerName: "iyvy",
	serverName: "oce"
};

var otherUsers = 
[{summonerName: "jeffanator", server: "oce"},
{summonerName: "omnarino", server: "oce"}];

compareManager.compareGraph(baseUser, otherUsers);
*/