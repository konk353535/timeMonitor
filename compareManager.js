// Models to interface with Mongo DataBase
var userModel = require("./models/userModel.js").userModel;
var gameModel = require("./models/gameModel.js").gameModel;

// Moment to modify dates to specific timezones
var moment = require('moment-timezone');


// Goal is too give a front end graph data for users to
// 	compare themselves to friends

// Given a Base User
// And Other Users

// Generates Data of the set
// [Patt, Jeffanator, Omnarino] 
// [20.2, 40.6, 32.1]

// The timezone in which all games are retrived in is based on the timezone of the base User

// Data Aggregation Frame Work - Last 7 Days

// 1--
// Will get the date in the clients timezone
// Will get the date 7 days ago in the clients-tz

// 2--
// Will change all gameDates by clientsOffset

// 3-- 
// Will select all games from [userGiven, datesGiven]

// 4-- 
// Will group games by user

// 5--
// Output what we find 


var compareGraph = function findBaseUser(baseUser, otherUsers) {

	// First we need the UniqueIds of the baseUser

	// Query mongodb for user with name and server
	userModel.findOne({"summonerName":baseUser.summonerName, "server":baseUser.serverName}).exec(function (err, baseUserData) {

		if (err) return console.error(err);

		processOtherUsers(baseUserData, otherUsers);

	});

}

function processOtherUsers(baseUserData, otherUsers){
	// Get info for all other users
	userModel.find({
		$or: otherUsers
	}).exec(function(err,otherUsersData){
		if(err) console.error(err);
		getAllUsersGames(baseUserData, otherUsersData);
	})




}

function getAllUsersGames(baseUserData, otherUsersData){

	// Get list of all users info we need
	var userList = [{userId: baseUserData._id}];

	otherUsersData.forEach(function(userData){
		userList.push({userId:userData._id});
	});


	// Now in the client's timezone
	var now = moment().utcOffset(baseUserData.offset*-1);

	// Get date one week ago in clients time
	var oneWeekAgo = now;
	oneWeekAgo = moment(oneWeekAgo).seconds(00);
	oneWeekAgo = moment(oneWeekAgo).minutes(00);
	oneWeekAgo = moment(oneWeekAgo).hours(00);
	oneWeekAgo = moment(oneWeekAgo).subtract(6, 'day');
	oneWeekAgo = moment(oneWeekAgo).format();
	oneWeekAgo = new Date(oneWeekAgo);


	gameModel.aggregate([
	// Only use games from given users
    { $match : { $or: userList }},
    { $match : { dateTime: {$gt: oneWeekAgo}}},
    { $group : {
      _id : "$userId",
      totalSeconds : { $sum: "$duration"}}
    },
    { $sort: {totalSeconds: -1} }], function(err,gameData){
    	if(err) console.log(err);

    	formatData(gameData, baseUserData, otherUsersData);
    });
   
}

/**
	*	This function will take gameData
	* User data and format it for output to clients graph
	*
**/

function formatData(usersGameData, baseUserData, otherUsersData){

	var graphList = [];

	// Get list of all users info we need
	var userList = [{userId: baseUserData._id, userName: baseUserData.summonerName}];

	otherUsersData.forEach(function(userData){
		userList.push({userId:userData._id, userName: userData.summonerName});
	});

	usersGameData.forEach(function(userGameData){
		
		userList.forEach(function(userData){
			if(userGameData._id.toString() == userData.userId.toString()){
				graphList.push({
					name: userData.userName, 
					totalSeconds: userGameData.totalSeconds})
			}
		});
	});

	console.log(graphList);
}

module.exports = {
  compareGraph: compareGraph
}