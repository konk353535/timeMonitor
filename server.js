
// Express
var express = require('express')
var app = express()

// body Parser so we can read data sent from client
var bodyParser = require('body-parser');

// Define where to pull front end docs from
app.use(express.static(__dirname + "/public",{maxAge: 72000*1000}));
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

// userCounter to get number of users
var userCounter = require('./userCounter.js');

// For graphing stuff
var graphManager = require('./graphManager.js');

// backLogManager for getting status of backlogging for users
var backLogManager = require('./backLogManager.js');

app.get('/backloggingStatus/:name/:server', function(req,res){

	var username = req.params.name;
	var server = req.params.server;

	// To Lowercase
	username = username.toLowerCase();
	// Remove spaces
	username = username.replace(/\s+/g, '');

	backLogManager.checkBackloggedStatus(username, server, res);

});

app.get('/countUsers', function(req,res){

	// Cache the result for 4 hours
	res.setHeader('Cache-Control', 'public, max-age=3600000');

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

app.get('/user/:sName/:serName/:timePeriod/:date', function(req, res){

	if(req.params.timePeriod == "day") {
		res.sendFile(__dirname + '/public/userToday.html');
	} else if(req.params.timePeriod == "week") {
		res.sendFile(__dirname + '/public/userWeek.html');
	} else if(req.params.timePeriod == "month") {
		res.sendFile(__dirname + '/public/userMonth.html');
	} else if(req.params.timePeriod == "year") {
		res.sendFile(__dirname + '/public/userYear.html');
	} else {
		res.sendFile(__dirname + '/public/user.html');
	}

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

app.listen(8080);
console.log("Listening on port 8080");