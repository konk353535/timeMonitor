myApp.factory('championPieGraphService', function(){
  return {    
    /**
      * initalMultiDayChampGraph() initalizes graph settings for pie graph
      *
    **/
    inital: function (){

      // Object to store all info for ChampGraph
      $scope.champChart = {};

      // Champion Multi Day graph options
      $scope.champChart.chartConfig = {
          options: {
              chart: {

                  // Pie charts are cool!
                  type: 'pie'
              }
          },
          title: {

            // Don't need no man, or title
            text: ''
          },
          plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    // Black theme
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
          },

          // Haven't got data from server yet, so still loading
          loading: true
      }

    },
    /**
      * updateMultiDayChampGraph() request server for champion played data
      * Once recieves graph the data given on a pie chart
      *
    **/
  	update: function ($http){

      // Get current date for client
  		var n = new Date();
  		var fromDate = new Date(
        n.getFullYear(), (n.getMonth()), n.getDate(), 0, 0, 0, 0);
  		var toDate = new Date(
        n.getFullYear(), (n.getMonth()), n.getDate(), 23, 59, 59, 99);


  		toDate.setDate(fromDate.getDate() + 1);
  		fromDate.setDate(fromDate.getDate() - 6);

      // Store users timezone
  		var offset = new Date().getTimezoneOffset();

  		// Request server for mutli day graph data
  		$http.post('/graph', {

        // Pass users timezone to server
  			userOffSet: offset,

        // Tell server what graphType we want
  			graphType: "championDaysGraph",

        // Store dates for server to use
  			startDate: fromDate,
  			endDate: toDate,

        // Users name and server
  			name: $scope.userName,
  			server: $scope.serverName

  		}).success(function(response){

        if(response && response != "Error: Specified user could not be found"){

          // Store server response
    			graphInfo = response;

          // Output server reponse
    			console.log("Pie Champion Data - " + graphInfo.data);
    			console.log("Pie Champion Labels - " + graphInfo.labels);
            
          // Variables for custom array to send to highcharts
          var graphData = graphInfo.data;
          var labelData = graphInfo.labels;
          var seriesData = [];

          for(var i = 0; i < graphData.length; i++){
            // Each data point is [label, value]
            seriesData[i] = [labelData[i], graphData[i]];
          }

          $scope.champChart.chartConfig.series = [{
            
            // Size and innersize to make it a doughnut (cut out the middle)
            size: '60%',
            innerSize: '50%',
            
            // Type of chart is pie
            type: 'pie',

            // Tooltip is Hours Played: Value
            name: 'Hours Played',

            // Load in data from server response
            data: seriesData

          }];
    			
          // It's Loaded okay
          $scope.champChart.chartConfig.loading = false;
        }
  		});
  	}
  }
});