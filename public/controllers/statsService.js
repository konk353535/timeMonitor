


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
	getStatAverageDay: function (allGraphDataPoints){
    /*
    ----------------------
    Old getStatAverageDay asked server for average day,
    Put extra load on server
    ----------------------
		// Request server for average day (mins)
		$http.post('/stat', {

      // Pass server userName and server
			name: $routeParams["userName"],
			server: $routeParams["userServer"],

      // Store what type of stat i want
			statType: "averageDay"

		}).success(function(res){

			// Display number given from server to the page
			$scope.stats.averageDayMinutes = res[0];

		});
    */

    // To get the mean we get total / numPoints
    var totalHours = 0;
    var numPoints = 0;

    for(var i = 0; i < allGraphDataPoints.length; i++){
      totalHours += allGraphDataPoints[i];
      numPoints++;
    }

    console.log("Total Hours " + totalHours);
    console.log("Total Points " + numPoints);

    // Calculate the average, *60 as stats are given as minutes and converted to hours using angular js and allGraphDataPoints are in hour
    $scope.stats.averageDayMinutes = (totalHours / numPoints) * 60;
    	
  	},

	/**
	* getStatToday Gets the total played time today
	* Don't have to req server as already have today information 
	* From the 24 hour graph
	*
	**/
	getStatToday: function (){
		
		var totalMins = 0;

	// Get all time played today from 24 hour graph
		var todayDataPoints = $scope.todayChart.data;
		
	// Sum all datapoints
		for (var i = 0; i < todayDataPoints.length; i++){
			totalMins += todayDataPoints[i];
		}

	// Load Calculated sum to page
		$scope.stats.todayMinutes = totalMins;
	}

	}
});