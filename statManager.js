// Models to interface with Mongo DB
var userModel = require("./models/userModel.js").userModel;
var gameModel = require("./models/gameModel.js").gameModel;

// Moment so we can modify dates
// var moment = require('moment-timezone');


var getStats = function getStat(userName, userServer, statType, responder){
    // userName/userServer - Given users NAME and SERVER
    // statType - Type of stat
    // Responder - so we can send data back to client

    /*
    Goal of Function
    1)Get user db info
    2)Send to specified statType
    3)Specified statType responds to client with correct information
    */

    // 2) Store specified function to pass to, based on statType



    // 1) Get user db info
    userModel.findOne({"summonerName":userName, "server":userServer}).exec(function (err, userData) {
        if (err) return console.error(err);
        if(userData !== null){
            // Check user has some data
            if(userData.lastMatchId > 25){

                // User Found
                if(statType == "recordDay"){
                    recordDay(null, userData, responder);
                }
                else if(statType == "averageDay"){
                    averageDay(null, userData, responder);
                }
            }
        }
        else{
            // Invalid summonerName given
            console.log("Error: Specified user could not be found");
            //responder.send("Error: Specified user could not be found");
        }
    });

};

function recordDay(err, userData, responder){
    console.log("RecordDay stat request");

    gameModel.aggregate([
        // Only use games from this user
        { $match : { userId : userData._id}},
        // Sync game time's to users timezone
        { $project : { gameTimeLocal: { $subtract : [ "$dateTime", userData.offset*1000*60] } , duration : "$duration"} }, // this is (-4)
        { $group : {
           _id : { year: { $year : "$gameTimeLocal" }, month: { $month : "$gameTimeLocal" },day: { $dayOfMonth : "$gameTimeLocal" }},
           totalSeconds : { $sum: "$duration"},
           count : { $sum : 1 }}
        },
        { $sort: {totalSeconds: -1}
        },
        { $limit: 1}],
    function (err, res){
        if(err);
        console.log(res);
        var recordGame = res[0];

        var recordMinutes = Math.round(recordGame.totalSeconds / 60);

        var recordDateObject = recordGame._id;

        var statData = {
            recordMinutes : recordMinutes,
            year: recordDateObject.year,
            month: recordDateObject.month,
            day: recordDateObject.day
        }

        responder.send(statData);

        // Flush variables ain't using em :( anymore
        recordGame = null;
        recordMinutes = null;
        recordDateObject = null;
        statData = null;
    })

}

function averageDay(err, userData, responder){
    /*
    Calculate average time spent /day by getting totalTimePlayed / Diff(earliestGameTracked, latestGameTracked)
    Welcome to callback HELL !!!! ><> -|- <>< ||||-- ><> ><> ><> --|||| <>< <>< <><
    */
    console.log("------------- AverageDay stat request ---------------");

    // Get totalGameDuration
    gameModel.aggregate([
    { $match : { userId : userData._id}},
    { $group : {
        _id : {},
       totalTimeSeconds : { $sum : "$duration" }}
    }],
    function (err, res){
        if(err){console.log(err);}
        console.log(res);

        // Store totalTrackedTime
        var totalGameStats = res[0];
        var totalTrackedMinutes = Math.round(totalGameStats.totalTimeSeconds/60);

        // Get Latest Game
        gameModel.findOne({userId : userData._id}).sort({dateTime: -1}).exec(function(err,res){
            if(err){console.log(err);}
            var latestGame = res.dateTime;

            // Get Earliest Game
            gameModel.findOne({userId : userData._id}).sort({dateTime: 1}).exec(function(err,res){
                if(err){console.log(err);}

                console.log("Earliest Game - " + res.dateTime);
                console.log("Latest Game - " + latestGame);
                console.log("totalTrackedMinutes - " + totalTrackedMinutes);

                averageDayOutputter(res.dateTime, latestGame, totalTrackedMinutes, responder);
            })

        })

    });
}

function averageDayOutputter(firstGame, lastGame, totalTrackedMinutes, responder){
    /*
    Given users first and last game
    Aswell as total duration tracked
    Outputs to clients there average time played each day
    */

    // Gets total days the user has been tracked for
    var secondsBetweenDates = Math.abs(Math.round(firstGame-lastGame)/1000);
    var daysBetweenDates = Math.round(secondsBetweenDates / 60 / 60 / 24);
    if(daysBetweenDates < 1){
        daysBetweenDates = 1;
    }

    var averageMinsPerDay = Math.round(totalTrackedMinutes / daysBetweenDates);
    responder.send([averageMinsPerDay]);
}


module.exports = {
    getStats: getStats
}