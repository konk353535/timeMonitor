// Cron Jobs so we can run preset functions as specific times
var CronJob = require('cron').CronJob;

var userUpdateManager = require("./userUpdateManager.js");

// Reset all users every x time
new CronJob('0 */5 * * * *', function(){
    //console.log('You will see this message every 4 Hours');
    
    var resetter = userUpdateManager.resetAllUsers();
}, null, true, "America/Los_Angeles");

// Update a set of users every x time
new CronJob('0 */5 * * * *', function(){
    //console.log('You will see this message every 5 Minutes');

    var updater = userUpdateManager.updateUser();
}, null, true, "America/Los_Angeles");

