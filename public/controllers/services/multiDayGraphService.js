myApp.factory('multiDayGraphService', function(){
  return {  
    /**
      * initalMultiDayGraph() Initalizes setting for Week graph
      *
      *
      *
    **/
  	inital: function (){
  		
      // Object to store all info for weekChart in one place
      $scope.weekChart = {};

      // week graph options
      $scope.weekChart.chartConfig = {
          options: {
              chart: {
                  type: 'spline'
              }
          },
          xAxis: {
                  type: 'datetime',
                  title : {
                    text: 'Date'
                  }
          },
          yAxis: {
            title : {
              text: 'Mins'
            },

            // Min y-value of 0 so no negative range (can't have -time)
            min: 0
          },
          series: [{
              data: []
          }],
          title: {
              text: ''
          },

          // Loading true as we don't have data yet
          loading: true
      }
  	},

    /**
      * updateMultiDayGraph Requests server for data for weekGraph
      * Once recieves weekGraph data, updates graph to display new info
    **/
  	update: function ($http){

      // Get current date for client
  		var n = new Date();

  		var fromDate = new Date(
        n.getFullYear(), (n.getMonth()), n.getDate(), 0, 0, 0, 0);
  		var toDate = new Date(
        n.getFullYear(), (n.getMonth()), n.getDate(), 23, 59, 99, 99);

      // Set From date (date 7 days ago)
      // Set To date (end of today)
  		toDate.setDate(fromDate.getDate());
  		fromDate.setDate(fromDate.getDate() - 6);

      // Store timezone for server
  		var offset = new Date().getTimezoneOffset();

  		// Request server for mutli day graph data
  		$http.post('/graph', {

        // Store timezone so server get's client's timezone days
  			userOffSet: offset,

        // What graph do we want
  			graphType: "daysGraph",

        // Date's to graph
  			startDate: fromDate,
  			endDate: toDate,

        // Users name and server
  			name: $scope.userName,
  			server: $scope.serverName

  		}).success(function(response){
  			
        if(response && response != "Error: Specified user could not be found"){

          // Store server reponse
          graphInfo = response;

          // Output response
    			console.log(graphInfo.data);
    			console.log(graphInfo.labels);

    			$scope.weekChart.chartConfig.series = [{
            // Time interval is 24 hours (day)
            pointInterval: 24 * 3600 * 1000,

            // Name on tooltip is Hours Played: Value
            name: 'Mins Played',

            // Date to start labels from
            pointStart: Date.UTC(
              fromDate.getFullYear(),
              fromDate.getMonth(),
              fromDate.getDate()),

            // Set graph data to data from server
            data: graphInfo.data,
            
            // Set color of line
            color: '#94e2e4',

            // Marker is a circle not diamond plz
            marker: {
              symbol: "circle"
            }

          }];

          // Remove loading overlay as we've loaded stuff
          $scope.weekChart.chartConfig.loading = false;
        }
  		});
  	}
  }
});