
// Models to interface with Mongo DataBase
var userModel = require("./models/userModel.js").userModel;
var gameModel = require("./models/gameModel.js").gameModel;

// staticManager to convert Champ_ID to Champ_Name
var staticManager = require("./staticApiManager.js");


var championsUser = function getUserData(userName, serverName, resToClient) {

  // Query mongodb for user with name and server
  userModel.findOne({"summonerName":userName, "server":serverName}).exec(function (err, userData) {

  	// If error occurs with request
    if (err) return console.error(err);

    // User Found
    if (userData !== null) {

      // Check if user has some data for graphing (25 is default lastMatchID)
      if (userData.lastMatchId > 25) {
        getChampionData(userData, resToClient);
      } else {

        // Let client know that this user is new, attempt to re-request data
        responder.send("Error: Specified user could not be found");
      }
    } else {

      // Invalid summonerName given
      console.log("Error: Specified user could not be found");
      responder.send("Error: Specified user could not be found");
    }

  });
}

function getChampionData(userData, resToClient) {

	// Get all games from this user
	gameModel.aggregate([

	// Only use games from this user
	{ $match : { userId : userData._id}},


	{ $group : {

	  // Group by Champion
	  _id : "$champion",

	  // Sum Played time for each champion
	  totalSeconds : { $sum: "$duration"}}
	},
	{ $sort: {totalSeconds: -1} },
	{ $limit: 8 }],
	function (err, res){

	  // If there is an error output it to console
	  if(err) console.log("Error - " + err);

	  // If champion totals found, send to formatter
	  championDataFormat(res, resToClient);
	})
}

function championDataFormat(championsData, resToClient){

	console.log(championsData);

	var formattedData = [];
	// { _id = champion id, totalSeconds = totalSeconds}
	
	championsData.forEach(
		function(championData){

			if(championData._id === ""){
				formattedData.push(["Total", championData.totalSeconds]);
			}
			else {

				var championName = staticManager.getChampNames(
					[championData._id]);

				formattedData.push(
					{name: championName[0], 
					seconds : championData.totalSeconds}
				);
			}

		}
	);

	resToClient.send(formattedData);

	formattedData = null;
	championsData = null;
}


module.exports = {
	championsUser: championsUser
}

// Will return a list of champion names
// Plus total time tracked on champion
// Aggregate Flow
// All games for user X
// Group by champion
// Order by sum duration
// Convert champion_id to names
// Show in minutes (angular can do heavy lifting to hours)
// load array to front end ["Annie", 230],["Wukong", 562]