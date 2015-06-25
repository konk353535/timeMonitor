myApp.factory('todayGraphService', function(){
  return {
   /**
      * initalDailyGraph() sets default setting for today graph
      *
      *
    **/
  	inital : function (){

      // Create object to store all info about Today graph
      $scope.todayChart = {};

      // Today graph options
      $scope.todayChart.chartConfig = {
          // Type of graph
          options: {
              chart: {
                  type: 'spline'
              }
          },
          xAxis: {
            type: 'datetime',
            title : {
              text: 'Time'
            },
            // Have a label every 3 hours
            tickInterval: 3 * 3600 * 1000,
            dateTimeLabelFormats : {
              // Only show hour (am/pm)
              hour:"%l %P",
              day:"%l %P",
            }
          },
          yAxis: {
            title : {
              text: 'Mins'
            },
            // Set min so we have no -10 range
            min: 0,
            // Set range to min amnt so 0 isn't vertically aligned
            minRange: 40
          },
          series: [{
              data: []
          }],
          title: {
              text: ''
          },
          

          // Set loading to true until we update the graph
          loading: true
      }
  	},

  	/**
      * updateDailyGraph() 
      * requests server for data to graph the 24 hours graph
      *
    **/
    update: function (fromDate, toDate, statService, $http){

      // Gets clients timezone offset
      var offset = new Date().getTimezoneOffset();

      // Request server for todays graph data
      $http.post('/graph', {

        // Store client's timezone so graph is in there timezone
        userOffSet: offset,
        fromDate: fromDate,
        toDate: toDate,
        // Let server know what type of graph we want
        graphType: "today",

        // Store users name and server
        name: $scope.userName,
        server: $scope.serverName

      }).success(function(response){
        console.log("Day reponse + " + response);
        // Make sure we got graph data, not an error message or null
        if(response && response != "Error: Specified user could not be found"){
          // Store response from server 
          $scope.todayChart.data = response;

          // Empty array for making custom labels
          var customTodayData = [];
          var todayChartData = $scope.todayChart.data;

          for (var i = 0; i < todayChartData.length; i++){
            // For each point load in a date with specific time
            customTodayData[i] = [Date.UTC(2000, 1, 1, i), todayChartData[i]];
          }

          console.log("Today Date Data - " + customTodayData);

          $scope.todayChart.chartConfig.series = [{
            name: 'Mins Played',
            data: customTodayData,
            tooltip : {
              dateTimeLabelFormats : {
                // Make tooltip display 7 am (hr am/pm)
                hour:"%l %P",
                day:"%l %P",
              }
            },

            // Set color of line
            color: '#94e2e4',

            // Marker is a circle not diamond plz
            marker: {
              symbol: "circle"
            }

          }];

          // Data loaded, remove loading overlay
          $scope.todayChart.chartConfig.loading = false;

          // Update today stat now as depedant on today chart data
          statService.getToday(customTodayData);
        }
      });
    }

  }
});