// db.games.find({"userId":ObjectId("5524cd9d47e4fda94c504963")}).count()
var userModel = require("./models/userModel.js").userModel;
var gameModel = require("./models/gameModel.js").gameModel;

var responder;
var offSet;

var moment = require('moment');

var getGraph = function getGraph(userName, serverName, graphName, timeZoneOffSet, res){
	/*
	Given user name, server and GRAPH name
	Will pass information on to appropriate grapher
	*/
	responder = res;
	offSet = timeZoneOffSet;

	if(graphName == "today"){
		getUserAndGraph(userName, serverName, todayGraph);
	}
	else {
		console.log("Error incorrect graph name specified for getGraph(user, server, graphName, res)");
	}
}

function getUserAndGraph(userName, serverName, graphFunctionName){
	/*
	Gets unique id for user
	Send's user to specified graph function
	*/
	userModel.findOne({"summonerName":userName, "server":serverName}).exec(function (err, userData) {
		if (err) return console.error(err);
		if(userData !== null){
			graphFunctionName(userData);
		}
		else{	
			// Invalid summonerName given
			console.log("Error: Specified user could not be found");
			responder.send("Error: Specified user could not be found");
		}
	});	
}
function todayGraph(userData){
	/*
	Given a user, will get all the games they have played today (in there timezone)
	*/
	console.log("Private give me " + userData._id + " games today!");

	// Step One: Get current time in UTC
	var now = moment();
	var currentDateClient = now.utcOffset(offSet*-1);

	var todayFirstMin = currentDateClient;
	todayFirstMin = moment(todayFirstMin).seconds(00);
	todayFirstMin = moment(todayFirstMin).minutes(00);
	todayFirstMin = moment(todayFirstMin).hours(00);
	// convert to javascript date for comparison in mongodb
	todayFirstMin = moment(todayFirstMin).toDate();

	var todayLastMin = currentDateClient;
	todayLastMin = moment(todayLastMin).seconds(59);
	todayLastMin = moment(todayLastMin).minutes(59);
	todayLastMin = moment(todayLastMin).hours(23);
	// convert to javascript date for comparison in mongodb
	todayLastMin = moment(todayLastMin).toDate();
	
	console.log("Today for client in UTC - " + todayFirstMin + " - " + todayLastMin);

	gameModel.find({$and: [{"userId":userData._id}, {dateTime: {$gt: todayFirstMin, $lt: todayLastMin}}]}).sort({dateTime: -1}).exec(function (err, res){
		if(err) return console.log(err);
		analyzeGamesTodayGraph(userData, res, now);
	});
	
}
function analyzeGamesTodayGraph(userData, gameData, now){
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
		var a = moment(game.dateTime);
		
		// Get time in clients timezone
		var clientDate = {
			utc: moment(a.utc()).format(),
			offset: offSet
		};
		var clientDate2 = moment.utc(clientDate.utc).zone(clientDate.offset).toDate();
			
		var gameDate = clientDate2;
		var hour = gameDate.getHours();
		var duration = Math.round(game.duration / 60);
		tempGraphData[hour] += duration;
	});

	responder.send(tempGraphData);
}
function getHoursBetween(dateOne,dateTwo){
	var hours = Math.abs(dateOne - dateTwo) / (60*60*1000);
	return hours;
}

module.exports = {
	getGraph: getGraph
}