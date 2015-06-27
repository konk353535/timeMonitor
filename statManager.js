// Models to interface with Mongo DB
var userModel = require("./models/userModel.js").userModel;
var gameModel = require("./models/gameModel.js").gameModel;

// Moment so we can modify dates
var moment = require('moment-timezone');


var getStats = function getStat(userName, statOptions, responder){
    // userName - Given to us correctly formatted (spaces + lowercase)
    // statOptiosn - All other information
    // Responder - so we can send data back to client

    var server = statOptions.server;
    var statType = statOptions.statType;


    // 1) Get user db info
    userModel.findOne({"summonerName":userName, "server":server}).exec(function (err, userData) {
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
                else if(statType == "winLoss"){
                    winLoss(null, userData, statOptions, responder);
                }
            }
        } else{
            // Invalid summonerName given
            console.log("Error: Specified user could not be found");
            responder.status(404);
            responder.send("Error: Specified user could not be found");
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
    var daysBetweenDates = Math.ceil(secondsBetweenDates / 60 / 60 / 24);

    var averageMinsPerDay = Math.round(totalTrackedMinutes / daysBetweenDates);
    responder.send([averageMinsPerDay]);
}

function winLoss(err, userData, statOptions, responder){

    var fromDate = statOptions.fromDate;
    var toDate = statOptions.toDate;

    //var now = moment().utcOffset(userData.offset*-1);

    // Get first minute of today in client's timezone
    var todayFirstMin = fromDate;
    todayFirstMin = moment(todayFirstMin).seconds(00);
    todayFirstMin = moment(todayFirstMin).minutes(00);
    todayFirstMin = moment(todayFirstMin).hours(00);
    todayFirstMin = moment(todayFirstMin).format();

    // Get last minute of today in client's timezone
    var todayLastMin = toDate;
    todayLastMin = moment(todayLastMin).seconds(59);
    todayLastMin = moment(todayLastMin).minutes(59);
    todayLastMin = moment(todayLastMin).hours(23);
    todayLastMin = moment(todayLastMin).format();

    // Get num losses
    gameModel.count(
        {$and: 
            [{"userId":userData._id}, 
            {dateTime: {$gt: todayFirstMin, $lt: todayLastMin}},
            {isWin : false}]
        }).exec(
        function (err, res){

        if(err) return console.log(err);
        var losses = res;
        // num Wins
        gameModel.count(
        {$and: 
            [{"userId":userData._id}, 
            {dateTime: {$gt: todayFirstMin, $lt: todayLastMin}},
            {isWin : true}]
        }).exec(
        function (err, res){

        if(err) return console.log(err);
        var wins = res;
        responder.send({wins:wins, losses:losses});

        });

    });
    


}


module.exports = {
    getStats: getStats
}