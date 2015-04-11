// Models to interface with Mongo DB
var userModel = require("./models/userModel.js").userModel;
var gameModel = require("./models/gameModel.js").gameModel;

// Needs to be removed, simulatenous requests will screw this up
var offSet;

// Moment so we can modify dates
var moment = require('moment-timezone');


var getGraph = function getGraph(userName, serverName, graphOptions,  responder){
	/*
	The 'manager' of graphManager, given parameters will pass along to functions associated with each graph type

	Given user name, server and GRAPH name
	Will pass information on to appropriate grapher
	*/
	
	// Set offset
	offSet = graphOptions.userOffSet;

	// Check what graph the client wants
	if(graphOptions.graphType == "today"){
		getUserThenGraph(userName, serverName, graphOptions, todayGraph, responder);
	}
	else if(graphOptions.graphType == "daysGraph"){
		getUserThenGraph(userName, serverName, graphOptions, daysGraph, responder);
	}
	else if(graphOptions.graphType == "championDaysGraph"){
		getUserThenGraph(userName, serverName, graphOptions, championDaysGraph, responder);
	}
	else {
	// If client is asking for a graph we don't have, send error
		responder.send("We have an error m8 that graphType doesn't exist");
		console.log("Error incorrect graph name specified for getGraph(user, server, graphName, res)");
	}
}
function getUserThenGraph(userName, serverName, graphOptions, graphFunctionName, responder){
	/*
	Gets id for user from userName and server
	Send's user to specified graph function
	*/

	// Query mongodb for user with name and server
	userModel.findOne({"summonerName":userName, "server":serverName}).exec(function (err, userData) {
		if (err) return console.error(err);
		if(userData !== null){
			// User Found
			graphFunctionName(null, userData, graphOptions, responder);
		}
		else{	
			// Invalid summonerName given
			console.log("Error: Specified user could not be found");
			responder.send("Error: Specified user could not be found");
		}
	});	
}

// Champion Pie Graph Functions (In Development)
function championDaysGraph(err, userData, graphOptions, responder){
	/*
	Retrives games by user, between dates given
	Passes to pieChartAnalyzer
	*/
	var now = moment().utcOffset(offSet*-1);

	// As date's are made by clientside, they are already specified to there timezone
	var startDate = graphOptions.startDate;
	var endDate = graphOptions.endDate;

	console.log("--- Graph Type - daysGraph --- ");
	console.log("Start Date ---> ---> " + startDate);
	console.log("End Date ---> ---> " + endDate);

	// Query Mongo DB
	gameModel.find({$and: [{"userId":userData._id}, {dateTime: {$gt: startDate, $lt: endDate}}]}).sort({dateTime: -1}).exec(function (err, res){
		if(err) return console.log(err);
		// Pass found games to analysis function
		analyzeChampionDaysGraph(null, res, userData, responder);
	});
}
function analyzeChampionDaysGraph(err, gameData, userData, responder){
	/*
	Given a list of games 
	& user Data
	returns list of how much each champion played
	*/
	var championNames = [];

	var championData = [];

	for(var i=0;i<championNames.length;i++){
		championData.push(0);
	}

	gameData.forEach(function(game){		
		championData[game.championId] += 1;
	});

}

// Days Graph Functions
function daysGraph(err, userData, graphOptions, responder){
	/*
	Retrives games by user, between dates given
	*/

	// As date's are made by clientside, they are already specified to there timezone
	var startDate = graphOptions.startDate;
	var endDate = graphOptions.endDate;

	console.log("--- Graph Type - daysGraph --- sDate ->" + startDate + " eDate -> " + endDate);

	// Query Mongo DB for all games between specified dates
	gameModel.find({$and: [{"userId":userData._id}, {dateTime: {$gt: startDate, $lt: endDate}}]}).sort({dateTime: -1}).exec(function (err, res){
		if(err) return console.log(err);
		// Pass found games to analysis function
		analyzeGamesDaysGraph(null, res, userData, startDate, endDate, responder);
	});
}
function analyzeGamesDaysGraph(err, gameData, userData, startDate, endDate, responder){
	/*
	Data Series (1 datapoint = 1 day)
	Given dateFrom - dateTo &
	User's info &
	Game info for given dates
	Data = sum mins grouped by day
	*/
	
	// Get # Datapoints in graph
	var daysBetween = getHoursBetween(startDate, endDate) / 24;

	// Get startdate in clients timezone
	var startDate = moment(startDate).utcOffset(offSet*-1);

	// Log startdate in clients timezone
	console.log("Start date clients time zone - > " + moment(startDate).format());

	// Example: Data = 70m, labels = 3rd April 
	var tempGraphData = [];
	var tempGraphLabels = [];

	var tempDateLabel = startDate;
	
	// Initalise array of 0's for data
	for(var i=0;i<daysBetween;i++){
		tempGraphLabels.push(moment(tempDateLabel).format("MMM Do"));
		// Step forward one day, to generate labels
		tempDateLabel = moment(tempDateLabel).add(1, 'days');
		tempGraphData.push(0);
	}

	gameData.forEach(function(game){
		// Loop over each game

		// set game time to client's timezone
		var a = moment(game.dateTime).utcOffset(offSet*-1);
		
		// Log game time in client's timezone
		console.log(moment(a).format());
		
		// Get what datapoint this is (by getting how many days between this game and startDate)
		var daysFromStartDate = Math.floor(getHoursBetween(startDate, moment(a).format()) / 24);

		console.log("Data Point - " + daysFromStartDate);

		// Log actual minutes to specified datapoint
		var duration = Math.round(game.duration / 60);
		tempGraphData[daysFromStartDate] += duration;
	});

	// Load label and data into json object
	var graphInfo = {data: tempGraphData, labels: tempGraphLabels}
	console.log(graphInfo);
	// push object (label + data) to client
	responder.send(graphInfo);
}

// Today Graph Functions 
function todayGraph(err, userData, graphOptions, responder){
	/*
	Given a user, will get all the games they have played today (in there timezone)
	*/
	console.log("Private give me " + userData._id + " games today!");

	// Step One: Get current time in clients offset (timezone)
	var now = moment().utcOffset(offSet*-1);
	
	var todayFirstMin = now;
	todayFirstMin = moment(todayFirstMin).seconds(00);
	todayFirstMin = moment(todayFirstMin).minutes(00);
	todayFirstMin = moment(todayFirstMin).hours(00);
	todayFirstMin = moment(todayFirstMin).format();
	
	var todayLastMin = now;
	todayLastMin = moment(todayLastMin).seconds(59);
	todayLastMin = moment(todayLastMin).minutes(59);
	todayLastMin = moment(todayLastMin).hours(23);
	todayLastMin = moment(todayLastMin).format();
	
	
	console.log("Today for client - " + todayFirstMin + " - " + todayLastMin);

	// Query Mongo DB for all games between specified dates
	gameModel.find({$and: [{"userId":userData._id}, {dateTime: {$gt: todayFirstMin, $lt: todayLastMin}}]}).sort({dateTime: -1}).exec(function (err, res){
		if(err) return console.log(err);
		analyzeGamesTodayGraph(userData, res, responder);
	});	
}
function analyzeGamesTodayGraph(userData, gameData, responder){
	/*
	Given a list of games will slice them into each hour, so we can output to a graph
	*/
	console.log("Analyzing Player - " + userData.summonerName);
	
	// Initalise an array of 24 0's
	// Each point represents a time in the last 24 hours
	// Each value represents duration (in minutes)
	var tempGraphData = [];
	for(var i=0;i<24;i++){
		tempGraphData.push(0);
	}

	// Iterate over each game and assign to array for graphing later
	gameData.forEach(function(game){
		// Get game time in client's timezone
		var a = moment(game.dateTime).utcOffset(offSet*-1);
		
		console.log(moment(a).format());
		
		var gameDate = a;
		var hour = moment(gameDate).hours();
		var duration = Math.round(game.duration / 60);
		tempGraphData[hour] += duration;
	});

	responder.send(tempGraphData);
}

function getHoursBetween(dateOne,dateTwo){
	/*
	Gets hours between two date objects
	*/
	dateOne = new Date(dateOne);
	dateTwo = new Date(dateTwo);

	var hours = Math.abs(dateOne.getTime() - dateTwo.getTime()) / (60*60*1000);
	return hours;
}

module.exports = {
	getGraph: getGraph
}