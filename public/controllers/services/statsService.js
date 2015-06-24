


myApp.factory('statService', function(){
  return {
  	/**
      * Using data from the allGraph grabs the best day for the user
      *
  	**/
    recordDay: function (allGraphDataPoints){
      	Array.prototype.max = function() {
	  		return Math.max.apply(null, this);
		}

		$scope.stats.recordDayMinutes = allGraphDataPoints.max()*60;
    },

	/**
	* getWinLossToday() requests the number of wins and losses for today
	*
	*
	**/
	getWinLossToday: function (userName, userServer, $http){

		// Request server for win loss today
		$http.post('/stat', {

		  // Pass server users name and server
		  name: userName,
		  server: userServer,

		  // Store what type of stat we want
		  statType: "winLossDay"

		}).success(function(res){

		  $scope.stats.winsToday = res.wins;
		  $scope.stats.lossesToday = res.losses;

		});
	},

	/**
	* getStatAverageDay() Requests server for the average hours, player spends 
	* per day Total Tracked time / (Days between oldest game and today) 
	*
	*
  	**/
	getStatAverageDay: function ($http){
    

		// Request server for average day (mins)
		$http.post('/stat', {

      	// Pass server userName and server
		name: $scope.userName,
		server: $scope.serverName,

      	// Store what type of stat i want
		statType: "averageDay"

		}).success(function(res){

			// Display number given from server to the page
			$scope.stats.averageDayMinutes = res[0];

		});
    	
  	},

	/**
	* getStatRecordDay() Requests server for most hours played on a single day
	* Once server responds, displays stat on page
	*
	**/
	getStatRecordDay: function ($http){

		// Request server for most played day (time(hr) + date)
		$http.post('/stat', {

	      	// Pass server users name and server
			name: $scope.userName,
			server: $scope.serverName,

	      	// Store what type of stat we want
			statType: "recordDay"

		}).success(function(res){

			console.log("Stat - " + res);
				
	    	// Set # minutes played on record day
	    	$scope.stats.recordDayMinutes = res.recordMinutes;
				
	    	// Create date of recordDay
	    	var recordDate = new Date();
			recordDate.setFullYear(res.year);
			recordDate.setMonth(res.month - 1);
			recordDate.setDate(res.day);
				
	    	// Show date of recordDay on page
	      	$scope.stats.recordDayDate = recordDate;

		});
	},

	/**
	* getToday uses the given today data, and sums it
	*
	*
	**/
	getToday : function(todayDataPoints){
		console.log(todayDataPoints);

		var sum = 0;

		for (i in todayDataPoints) {
			sum += todayDataPoints[i][1];
		}

		$scope.stats.todayMinutes = sum;
	}


}
});