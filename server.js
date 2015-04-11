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


app.get('/', function (req, res) {
	res.send('Hello World');
})

app.post('/graph', function(req,res){
	var graphManager = require('./graphManager.js');
	var graphManagerOne = graphManager;
	// Req.body contains graphName, clientTimeZoneOffSet, dates
	graphManagerOne.getGraph("iyvy", "oce", req.body, res);
})

app.post('/newPlayer', function (req, res) {
	console.log("Captain transmission recieved - Private Name - " + req.body.name + " - Battalion - "  + req.body.server);
	userAddManager.addUser(req.body.name, req.body.server);
	res.send("Roger that private, info recieved");
});

app.listen(3000)
console.log("Listening on port 3000");