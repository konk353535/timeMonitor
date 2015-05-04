
// This file will get the number of users in our database

// Models to interface with Mongo DB
var userModel = require("./models/userModel.js").userModel;

var getCount = function getCount(resToClient){

	userModel.count({}).exec(function(err,countData){
		resToClient.send([countData]);
	});

}

module.exports = {
    getCount: getCount
}