// db.games.find({"userId":ObjectId("5524cd9d47e4fda94c504963")}).count()
var userModel = require("./models/userModel.js").userModel;
var gameModel = require("./models/gameModel.js").gameModel;

var responder;

var getGraph = function getGraph(userName, serverName, graphName, res){
	/*
	Given user name, server and GRAPH name
	Will pass information on to appropriate grapher
	*/
	responder = res;
	if(graphName == "24hours"){
		getUserAndGraph(userName, serverName, getPlayerGames24);
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
function getPlayerGames24(userData){
	/*
	Given a user, will get all the games they have played in the last 24 hours
	*/
	console.log("Private give me " + userData._id + " games in the last 24 hours!");
	// current datetime
	var now = new Date();
	// date time 24 hours ago
	var yesterday = new Date();
	yesterday.setHours(yesterday.getHours() - 24);

	gameModel.find({$and: [{"userId":userData._id}, {dateTime: {$gt: yesterday, $lt: now}}]}).sort({dateTime: -1}).exec(function (err, res){
		if(err) return console.log(err);
		analyzePlayerGames24(userData, res, now);
	});
	
}
function analyzePlayerGames24(userData, gameData, now){
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
		console.log("Date - "  + game.dateTime);
		var gameDate = game.dateTime;
		var hoursAgo = Math.ceil(getHoursBetween(gameDate, now));
		var duration = Math.round(game.duration / 60);
		tempGraphData[hoursAgo-1] += duration;
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