// db.games.find({"userId":ObjectId("5524cd9d47e4fda94c504963")}).count()
var userModel = require("./models/userModel.js").userModel;
var gameModel = require("./models/gameModel.js").gameModel;

var responder;
var offSet;

var moment = require('moment-timezone');

var getGraph = function getGraph(userName, serverName, graphOptions,  res){
	/*
	Given user name, server and GRAPH name
	Will pass information on to appropriate grapher
	*/
	responder = res;
	offSet = graphOptions.userOffSet;

	if(graphOptions.graphType == "today"){
		getUserAndGraph(userName, serverName, graphOptions, todayGraph);
	}
	else if(graphOptions.graphType == "daysGraph"){
		getUserAndGraph(userName, serverName, graphOptions, daysGraph);
		
	}
	else {
		console.log("Error incorrect graph name specified for getGraph(user, server, graphName, res)");
	}
}

function getUserAndGraph(userName, serverName, graphOptions, graphFunctionName){
	/*
	Gets unique id for user
	Send's user to specified graph function
	*/
	userModel.findOne({"summonerName":userName, "server":serverName}).exec(function (err, userData) {
		if (err) return console.error(err);
		if(userData !== null){
			graphFunctionName(null, userData, graphOptions);
		}
		else{	
			// Invalid summonerName given
			console.log("Error: Specified user could not be found");
			responder.send("Error: Specified user could not be found");
		}
	});	
}

function daysGraph(err, userData, graphOptions){
	/*
	Retrives games by user, between dates given
	*/
	// Date From -> Date To graph (each day = one data point)

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
		analyzeGamesDaysGraph(null, res, userData, startDate, endDate);
	});
}
function analyzeGamesDaysGraph(err, gameData, userData, startDate, endDate){
	/*
	Generates a data series (1 dp = 1 day)
	Given dateFrom - dateTo &
	User's information &
	Game information between dates given
	*/
	
	// How many data points in graph
	var daysBetween = getHoursBetween(startDate, endDate) / 24;
	console.log("Data points = " + daysBetween);

	// Get startdate in clients timezone
	var startDate = moment(startDate).utcOffset(offSet*-1);
	// Log startdate in clients timezone
	console.log(moment(startDate).format());

	var tempGraphData = [];
	for(var i=0;i<daysBetween;i++){
		tempGraphData.push(0);
	}

	gameData.forEach(function(game){
		// Get time in UTC
		var a = moment(game.dateTime).utcOffset(offSet*-1);
		
		console.log(moment(a).format());
		
		// Get what datapoint this is (by getting how many days between this game and startDate)
		var daysFromStartDate = Math.floor(getHoursBetween(startDate, moment(a).format()) / 24);

		console.log("Data Point - " + daysFromStartDate);

		var duration = Math.round(game.duration / 60);
		tempGraphData[daysFromStartDate] += duration;
	});

	responder.send(tempGraphData);
}

function todayGraph(err, userData, graphOptions){
	/*
	Given a user, will get all the games they have played today (in there timezone)
	*/
	console.log("Private give me " + userData._id + " games today!");

	// Step One: Get current time in UTC
	var now = moment().utcOffset(offSet*-1);
	
	var todayFirstMin = now;
	todayFirstMin = moment(todayFirstMin).seconds(00);
	todayFirstMin = moment(todayFirstMin).minutes(00);
	todayFirstMin = moment(todayFirstMin).hours(00);
	todayFirstMin = moment(todayFirstMin).format();
	// convert to javascript date for comparison in mongodb

	var todayLastMin = now;
	todayLastMin = moment(todayLastMin).seconds(59);
	todayLastMin = moment(todayLastMin).minutes(59);
	todayLastMin = moment(todayLastMin).hours(23);
	todayLastMin = moment(todayLastMin).format();
	// convert to javascript date for comparison in mongodb
	
	console.log("Today for client in UTC - " + todayFirstMin + " - " + todayLastMin);

	gameModel.find({$and: [{"userId":userData._id}, {dateTime: {$gt: todayFirstMin, $lt: todayLastMin}}]}).sort({dateTime: -1}).exec(function (err, res){
		if(err) return console.log(err);
		analyzeGamesTodayGraph(userData, res);
	});
	
}
function analyzeGamesTodayGraph(userData, gameData){
	/*
	Given a list of games will slice them into each hour, so we can output to a graph
	*/
	console.log("Analyzing Player - " + userData.summonerName);
	
	// Initalise an array of 24 0's
	// Each point represents a time in the last 24 hours
	// Each value repreents time played in that hours (in minutes)
	var tempGraphData = [];
	for(var i=0;i<24;i++){
		tempGraphData.push(0);
	}

	// Iterate over each game and assign to array for graphing later
	gameData.forEach(function(game){
		// Get time in UTC
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
	dateOne = new Date(dateOne);
	dateTwo = new Date(dateTwo);

	var hours = Math.abs(dateOne.getTime() - dateTwo.getTime()) / (60*60*1000);
	return hours;
}

module.exports = {
	getGraph: getGraph
}