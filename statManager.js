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
            // User Found
            if(statType == "recordDay"){
                recordDay(null, userData, responder);
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
    console.log("Record Day ID = " + userData._id);

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
        var recordGame = res[0];
        var recordSeconds = recordGame.totalSeconds;
        var recordMinutes = Math.round(recordSeconds / 60);
        console.log(res);
        console.log("Record Day - " + recordMinutes + "m");
    })

}

module.exports = {
    getStats: getStats
}