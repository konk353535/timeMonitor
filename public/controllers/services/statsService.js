


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
	getWinLoss: function ($http, fromDate, toDate, username, server){

		// Request server for win loss today
		$http.post('/stat', {

		  // Pass server users name and server
		  name: username,
		  server: server,
		  fromDate: fromDate,
		  toDate: toDate,

		  // Store what type of stat we want
		  statType: "winLoss"

		}).success(function(res){

			if(res.status == 404){
				console.log(res);
			}
			console.log(res.wins + "/" + res.losses);
			$scope.stats.wins = res.wins;
			$scope.stats.losses = res.losses;

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
		name: $scope.username,
		server: $scope.server,

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
			name: $scope.username,
			server: $scope.server,

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
	* getTotal uses the given data, and sums it
	*
	*
	**/
	getTotal : function(allDataPoints){

		var sum = 0;

		for (i in allDataPoints) {
			sum += allDataPoints[i];
		}
		console.log("Sum is " + sum);
		$scope.stats.totalMinutes = sum;
	},

	/**
	* Displays the highest win rate champion, for given time period
	*
	*
	**/
	getBestChampion : function(labelData, winData){

		var maxWinRate = -1;
		var maxWinRateI = -1;

		for(var i = 0; i < winData.length; i++){
			var winRate = 
				(winData[i][0]) /
				(winData[i][0] + winData[i][1]);

			if(winRate > maxWinRate){
				maxWinRateI = i;
				maxWinRate = winRate;
			}
			
		}

		$scope.bestChampionName = labelData[maxWinRateI];
		$scope.bestChampionWinRate = maxWinRate * 100;


	},

	/**
	* Displays the most played champion, (# games)
	*
	*
	**/
	getFavouriteChampion : function(labelData, winData){

		var maxGames = -1;
		var maxGamesIndex = -1;

		for(var i = 0; i < winData.length; i++){
			var games = winData[i][0] + winData[i][1];

			if(games > maxGames){
				maxGames = games;
				maxGamesIndex = i;
			}
		}

		$scope.favChampName = labelData[maxGamesIndex];
		$scope.favChampNumGames = maxGames;



	}


}
});