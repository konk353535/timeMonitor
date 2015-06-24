
myApp.factory('allGraphService', function(){
  return {
	inital: function (){
	    // Object to store all info for AllGraph
			$scope.allChart = {};

			// All graph options
			$scope.allChart.chartConfig = {
			    options: {
			        chart: {
			            type: 'spline',
	                // Zoomable on the x-axis
			            zoomType: 'x'
			        }
			    },
			    xAxis: {
	                // set xAxis to datetime, so we can use timesteps
			            type: 'datetime',
			            title : {
			            	text: 'Date'
			            },
	                // Set max zoom to 4 data points (4 days)
			            minRange: 1 * 24 * 3600000 
			    },
			    yAxis: {
			    	title : {
			    		text: 'Hours'
			    	},
	          // Min 0 so we don't have -10 range, (can't have negative time)
			    	min: 0
			    },
			    series: [{
			        data: []
			    }],
			    title: {
			        text: ''
			    },

	        // Set loading to true, as we haven't found data yet
			    loading: true
			}
		},

	  /**
	    * updateAllGraph() Requests server for all data
	    * Each datapoint is a day
	    *
	    *
	  **/
		update: function (statService, $http){

			var offset = new Date().getTimezoneOffset();

			var now = new Date();

			// Request server for all tracked days graph data
			$http.post('/graph', {

	      		// Useroffset so server know's my timezone
				userOffSet: offset,

				// Let server know what graphType we want
	      		graphType: "allGraph",

	     		// Send Year, Month, Day of client
				clientYear: now.getFullYear(),
				clientMonth: (now.getMonth()+1),
				clientDay: now.getDate(),

	      		// User name and server
				name: $scope.userName,
				server: $scope.serverName

			}).success(function(response){

	      	if(response && response != "Error: Specified user could not be found"){

	        	// Store server response
	  			graphInfo = response;

	  			console.log("AllChart Data - " + graphInfo.dataPoints);

	  			$scope.allChart.chartConfig.series = [{
	          
	          	// Each point is 24 hours
	          	pointInterval: 24 * 3600 * 1000,

	          	// Name of tooltip Eg on hover Hours Played : Value
	          	name: 'Hours Played',

	          	// -1 from firstGameDateMonth, as it is in standard month format 	1 = january, where Date.UTC wants format 0 = january
	          	pointStart: Date.UTC(graphInfo.firstGameDateYear, graphInfo.firstGameDateMonth-1, graphInfo.firstGameDateDay),

	          	// Load in dataPoints
	  			data: graphInfo.dataPoints,

	          	// Set color of line
	          	color: '#94e2e4',

	          	// Marker is a circle not diamond plz
	          	marker: {
	            	symbol: "circle"
	          	}

	  			}];

		        // Have datapoints, set loading to false
		        $scope.allChart.chartConfig.loading = false;
		      
		        statService.recordDay(response.dataPoints);
		        statService.getStatAverageDay(response.dataPoints);
	      	}
			});
		}
	}
});