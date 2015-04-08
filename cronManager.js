// Cron Jobs so we can run preset functions as specific times
var CronJob = require('cron').CronJob;
// updateManager so we can call functions needed from our crons (interface with userUpdateManager object)
var userUpdateManager = require("./userUpdateManager.js");


// Reset all users every 4 hours
new CronJob('0 0 */4 * * *', function(){
    console.log('You will see this message every 4 Hours');
    userUpdateManager.resetAllUsers();
}, null, true, "America/Los_Angeles");

// Reset a users every 5 minutes
new CronJob('0 */5 * * * *', function(){
    console.log('You will see this message every 5 Minutes');
    userUpdateManager.updateUser();
}, null, true, "America/Los_Angeles");




// Update a user every 5 minutes (max users with this = 240 / 5 = 48 users)
// Update a user every 5 seconds (max users with this = 240 / 0.1 = 2400 users)