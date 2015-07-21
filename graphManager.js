
// Models to interface with Mongo DataBase
var userModel = require("./models/userModel.js").userModel;
var gameModel = require("./models/gameModel.js").gameModel;

// staticManager to convert Champ_ID to Champ_Name
var staticManager = require("./staticApiManager.js");

// Needs to be removed, simulatenous requests will screw this up
var offSet;

// Moment to modify dates to specific timezones
var moment = require('moment-timezone');


/**
  * getGraph() passes to specific graph Function
  * based on graphOptions.graphType
  *
  * @param {String} userName The name of the user in lowercase
  * @param {String} serverName The server the user is on
  * @param {Object} graphOption Contains user's time offSet and holds start and end date's, generated on client's timezone for 7 Day line & pie
  * @param {Object} responder So we can send data back to client who made req
  */
var getGraph = function getGraph(userName, serverName, graphOptions, 
  responder) {


  

  // Set offset
  offSet = graphOptions.userOffSet;

  if (graphOptions.graphType == "today") {
    getUserThenGraph(userName, serverName, graphOptions, todayGraph, 
      responder);
  } else if (graphOptions.graphType == "championDaysGraph") {
    getUserThenGraph(userName, serverName, graphOptions, championDaysGraph, responder);
  } else if (graphOptions.graphType == "daysGraph") {
    getUserThenGraph(userName, serverName, graphOptions, daysGraph, responder);
  } else if (graphOptions.graphType == "allGraph") {
    getUserThenGraph(userName, serverName, graphOptions, allGraph, responder);
  } else {
    responder.status(404).send(
      "We have an error m8 that graphType doesn't exist");

  }

}

/**
  * getUserThenGraph() gets user data from database
  * Based on graphFunctionName passes userData to specified graph function
  *
  * @param {String} userName The name of the user in lowercase
  * @param {String} serverName The server the user is on
  * @param {Object} graphOption Contains user's time offSet and holds start and end date's, generated on client's timezone for 7 Day line & pie
  * @param {Object} responder So we can send data back to client who made req
  */
function getUserThenGraph(userName, serverName, graphOptions, graphFunctionName, responder) {

  // Query mongodb for user with name and server
  userModel.findOne({"summonerName":userName, "server":serverName}).exec(function (err, userData) {

    if (err) responder.status(500).send("Error: graphManager+getUser -" + err);

    if(userData !== null){
      // User Found

      // Check if user has some data for graphing (25 is default lastMatchID)
      // When updating a users game lastMatchId is updated to a much higher number
      if(userData.lastMatchId[0] > 25){
        graphFunctionName(null, userData, graphOptions, responder);
      }
      else {
        // Let client know that this user is new, attempt to re-request data
        responder.send("Error: Specified user could not be found");
      }
    } else {

      // Invalid summonerName given
      responder.status(404).send("Adding new user, please wait");
    }

  });
}

/**
  * championDaysGraph() gets games for user
  * Between dates given
  * Passes gameData found to analyzeChampionDaysGraph()
  *
  * @param {String} err For error information ???
  * @param {Object} userData Contains _id 
  * @param {Object} responder So we can send data back to client who made req
**/
function championDaysGraph(err, userData, graphOptions, responder){

  var now = moment().utcOffset(graphOptions.userOffSet*-1);

  // Date's made by clientside, already in there timezone
  var startDate = graphOptions.startDate;
  var endDate = graphOptions.endDate;

  // Query Mongo DB
  gameModel.find(
  {$and: [{"userId":userData._id}, 
    {dateTime: {$gt: startDate, $lt: endDate}}]
  }).sort(
  {dateTime: -1}
  ).exec(function (err, res) {

    if(err) responder.status(500).send("Error - " + err);

    // Pass found games to analysis function
    analyzeChampionDaysGraph(null, res, userData, responder);

  });

}

/**
  * analyzeChampionDaysGraph() Calculates how many times a given user has
  * played a champion in the time period specified in graphOptions 
  * Usually 7 Days
  *
  * @param {String} err Contains 
  * @param {Array} gameData Contains multiple game's each with data about the 
  *   game, (DateGame, GameDuration, Match_ID, ect (See gameModel))
  * @param {Object} userData Details about this user (_id, 
  *   summonerId, summonerName, summonerServer, see userModel for more info)
  * @param {Object} responder So we can send data back to client who made req
**/
function analyzeChampionDaysGraph(err, gameData, userData, responder){

  // Store Id's of champion's found here
  var championIds = [];

  // Store duration of game's played for champion
  var championGameCounts = [];

  var championWinCounts = [];

  // Iterate for each game
  gameData.forEach(function(game){

    if(championIds.indexOf(game.champion) > -1){

      // This champion is already in the list, so add to previous duration
      var champIdIndex = championIds.indexOf(game.champion);
      var duration =  Math.round(game.duration / 3600 * 100) / 100;

      championGameCounts[champIdIndex] = Math.round(
        (championGameCounts[champIdIndex] + duration) * 100) / 100;

      if(game.isWin){
        championWinCounts[champIdIndex][0] += 1;
      } else {
        championWinCounts[champIdIndex][1] += 1;
      }
      
    } else {

      // This champion is not in the list, add it
      championIds.push(game.champion);

      // Find What index to push duration to
      var champIdIndex = championIds.indexOf(game.champion);
      var duration = Math.round(game.duration / 3600 * 100) / 100;

      championGameCounts[champIdIndex] = duration;

      if(game.isWin){
        // champion W/L
        championWinCounts[champIdIndex] = [1,0];
      } else {
        // champion W/L
        championWinCounts[champIdIndex] = [0,1];
      }

    }

  });

  // Convert list of champ ID's to champ Names
  var championNames = staticManager.getChampNames(championIds);

  // Store Champion Names & Champion Durations in object
  var championPieInfo = {
                        data: championGameCounts, 
                        labels: championNames, 
                        winData: championWinCounts};

  // Send Names and Counts to client, so it can draw a pritty graph
  responder.send(championPieInfo);
}

/**
  *
  * daysGraph() gets games for user
  * Between dates given
  * Passes gameData found to analyzeGamesDaysGraph()
  *
  * @param {String} err Holds error information
  * @param {Object} userData Details about this user (_id, 
  *   summonerId, summonerName, summonerServer, see userModel for more info)
  * @param {Object} graphOptions Details for graphing (userOffset, 
  *   startDate, endDate)
  * @param {Object} responder So we can send data back to client who made req
  *
**/
function daysGraph(err, userData, graphOptions, responder){

  // Date's made by clientside, already in there timezone
  var startDate = graphOptions.startDate;
  var endDate = graphOptions.endDate;

  // Query Mongo DB for all games between specified dates
  gameModel.find({
    $and: [{"userId":userData._id}, 
    {dateTime: {$gt: startDate, $lt: endDate}}]
  }).sort(
    {dateTime: -1}
  ).exec(
  function (err, res){

    if(err) responder.status(500).send("Error - " + err);

    // Pass found games to analysis function
    analyzeGamesDaysGraph(
      null, res, graphOptions, userData, startDate, endDate, responder);

  });

}

/**
  *
  * analyzeGamesDaysGraph() Calculates time played each day, 
  * Between two dates in the clients timezone 
  * Usually 7 Days
  *
  * @param {String} (err) Contains error information
  * @param {Array} (gameData) Contains multiple game's each with data about 
  *   the game, (DateGame, GameDuration, Match_ID, ect (See gameModel))
  * @param {Object} (userData) Details about this user (_id, 
  *   summonerId, summonerName, summonerServer, see userModel for more info)
  * @param {Date} (startDate) Details dateFrom for date range
  * @param {Date} (endDate) Details dateTo for date range
  * @param {Object} (responder) So we can send data back to client who made req
**/
function analyzeGamesDaysGraph(err, gameData, graphOptions, userData, startDate, endDate, responder){

  // Get # Datapoints in graph
  var daysBetween = getHoursBetween(startDate, endDate) / 24;

  // Get startdate in clients timezone
  var startDate = moment(startDate).utcOffset(graphOptions.userOffSet*-1);


  // tempGraphData is in minutes
  var tempGraphData = [];

  // The first label is the first day
  var tempDateLabel = startDate;

  // Initalise array of 0's for data
  for(var i=0;i<daysBetween;i++){
    tempGraphData.push(0);
  }

  // Loop over each game
  gameData.forEach(function(game){
  
    // set gameTime to client's timezone
    var a = moment(game.dateTime).utcOffset(graphOptions.userOffSet*-1);

    // Get what datapoint this is (gameDate - startDate)
    var daysFromStartDate = Math.floor(getHoursBetween(startDate, moment(a).format()) / 24);

    // Log actual minutes to specified datapoint
    var duration = Math.round(game.duration / 60);
    tempGraphData[daysFromStartDate] += duration;

  });

  // Load label and data into object
  var graphInfo = {data: tempGraphData}

  // push object (label + data) to client
  responder.send(graphInfo);
}

/**
  *
  * todayGraph() given a user will get all the game's they've played in there 
  * timezone today. Passes game's found to analyzeGamesTodayGraph()
  *
  * @param {String} (err) Contains error infromation
  * @param {Object} (userData) Details about this user (_id, 
  *   summonerId, summonerName, summonerServer, see userModel for more info)
  * @param {Object} (graphOptions) Details for graphing (userOffset, 
  *   startDate, endDate)
  * @param {Object} (responder) So we can send data back to client who made req
  *
**/
function todayGraph(err, userData, graphOptions, responder){

  // Get first minute of today in client's timezone
  var todayFirstMin = graphOptions.fromDate;

  // Get last minute of today in client's timezone
  var todayLastMin = graphOptions.toDate;

  // Query Mongo DB for all games between specified dates
  gameModel.find(
  {$and: 
    [{"userId":userData._id}, 
    {dateTime: {$gt: todayFirstMin, $lt: todayLastMin}}
    ]
  }).sort({
    dateTime: -1
  }).exec(
  function (err, res){
    
    if(err) responder.status(500).send("Error - " + err);
    
    analyzeGamesTodayGraph(userData, graphOptions, res, responder);
  });

}

/**
  * analyzeGamesTodayGraph() Given a list of games will slice them into each our hour so we can out put to a graph
  * 
  *
  * @param {Object} (userData) Details about this user (_id, 
      summonerId, summonerName, summonerServer, see userModel for more info)
  * @param {Object} (graphOptions) Details for graphing (userOffset, 
      startDate, endDate)
  * @param {Array} (gameData) Contains multiple game's each with data about 
      the game, (DateGame, GameDuration, Match_ID, ect (See gameModel))
  * @param {Object} (responder) So we can send data back to client who made req
  *
**/
function analyzeGamesTodayGraph(userData, graphOptions, gameData, responder){

  // Each point represents a time today (Client's Today)
  // Each value represents duration (in mins)
  var tempGraphData = [];
  for(var i=0;i<24;i++){
    tempGraphData.push(0);
  }

  // Iterate over each game
  gameData.forEach(function(game){

    // Get game time in client's timezone
    var gameDate = moment(game.dateTime).utcOffset(graphOptions.userOffSet*-1);

    var hour = moment(gameDate).hours();
    var duration = Math.round(game.duration / 60);
    tempGraphData[hour] += duration;
  
  });

  // Send data to client for graphing
  responder.send(tempGraphData);

}

/**
  *
  * allGraph() grabs all the games the user has played, grouping them by day 
  *   in client's timzone
  * Will select earliest game's date and graph from that date to the current 
  *   date (for the client)
  *
  * @param {String} (err) Contains error information ???
  * @param {Object} (userData) Details about this user (_id, 
  *   summonerId, summonerName, summonerServer, see userModel for more info)
  * @param {Object} (graphOptions) Details for graphing (userOffset, 
  *   startDate, endDate)
  * @param {Object} (responder) So we can send data back to client who made req
  *
**/
function allGraph(err, userData, graphOptions, responder){

  // Get all games from this user
  gameModel.aggregate([

    // Only use games from this user
    { $match : { userId : userData._id}},

    // Sync game time's to users timezone
    { $project : { 
      gameTimeLocal: { $subtract : [ "$dateTime", userData.offset*1000*60] } , 
      duration : "$duration"} 
    },
    { $group : {

      // Group by date
      _id : { 
        year: { $year : "$gameTimeLocal" }, 
        month: { $month : "$gameTimeLocal" },
        day: { $dayOfMonth : "$gameTimeLocal" }
      },
      totalSeconds : { $sum: "$duration"}}
    },
    { $sort: {_id: 1} }],
    function (err, res){
      // If there is an error output it to console
      if(err) console.log("Error - " + err);
      // If games found, pass to analyzeAllGraph
      analyzeAllGraph(userData, res, graphOptions, responder);
  })
}

/**
  *
  * analyzeAllGraph() Given a list of dates with corresponding durations in 
  * seconds, Generates an array of ata, each point is a date
  * value of point is duration in hours
  *
  * @param {Object} (userData) Details about this user (_id, 
  *   summonerId, summonerName, summonerServer, ect (see userModel))
  * @param {Array} (gameData) Contains multiple game's each with data about 
  *   the game, (DateGame, GameDuration, Match_ID, ect (See gameModel))
  * @param {Object} (graphOptions) Details for graphing (userOffset, 
  *   startDate, endDate)
  * @param {Object} (responder) So we can send data back to client who made req
  *
**/
function analyzeAllGraph(userData, gameData, graphOptions, responder){

  // Get date in epoch UTC for first game played
  var firstGame = gameData[0];
  var firstGameDates = firstGame._id
  var firstGameDate = Date.UTC(firstGameDates.year, firstGameDates.month-1, firstGameDates.day);

  // Get date in epoch UTC for client's current time zone
  var clientNowDate = Date.UTC(graphOptions.clientYear, graphOptions.clientMonth-1, graphOptions.clientDay);

  // Milliseconds in a day for getting the days between two dates
  var oneDay = 24*60*60*1000;

  // totalDaysBetween firstGameDate and Now + 1
  var totalDataPoints = Math.round(Math.abs((
    firstGameDate - clientNowDate)/(oneDay))) + 1;

  var allGraphDataPoints = [];

  // Initalize all points to 0
  for(var i = 0; i < totalDataPoints; i++){
    allGraphDataPoints[i] = 0;
  }

  // Loop over each game
  gameData.forEach(function(game){
    
    var dateInfo = game._id;

    // -1 from gameDateObjects, as it is in standard month format 1 = january, where Date.UTC wants format 0 = january
    var gameDate = Date.UTC(dateInfo.year, dateInfo.month-1, dateInfo.day);

    // Get datapoint number (days since firstGameDate of this gameDate)
    var daysFromStartDate = Math.round(Math.abs((firstGameDate - gameDate)/(oneDay)));

    // Log actual minutes to specified datapoint
    var durationHours = Math.round(game.totalSeconds / 60) / 60;

    // Round to 2 dp
    durationHours = Math.round(durationHours * 100) / 100;
    allGraphDataPoints[daysFromStartDate] = durationHours;
  });

  var graphInfo = {

    // highchart needs inital date for labels
    firstGameDateYear : firstGameDates.year,
    firstGameDateMonth : firstGameDates.month,
    firstGameDateDay : firstGameDates.day,
    dataPoints : allGraphDataPoints

  }

  // Output graph to client for graphing
  responder.send(graphInfo);

}

/**
  *
  * getHoursbetween() Gets hours between two dates objects
  *
  * @param {Date} (dateOne) First date
  * @param {Date} (dateTwo) Second date
  *
  * @return {Number} (hours) Hours between the two dates
  *
**/
function getHoursBetween(dateOne,dateTwo){
  
  dateOne = new Date(dateOne);
  dateTwo = new Date(dateTwo);

  var hours = Math.abs(dateOne.getTime() - dateTwo.getTime()) / (60*60*1000);
  return hours;
}





module.exports = {
  getGraph: getGraph
}