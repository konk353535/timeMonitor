myApp.factory('multiDayGraphService', function(){
  return {  
    /**
      * initalMultiDayGraph() Initalizes setting for line graph
      *
      *
      *
    **/
  	inital: function (type){
  	
      if(type == "week"){

        // Object to store all info for weekChart in one place
        $scope.weekChart = {};

        // week graph options
        $scope.weekChart.chartConfig = {
            options: {
                chart: {
                    type: 'column',
                    height: 300
                },
                plotOptions : {
                  column : {
                    pointPadding: 0,
                    groupPadding: 0.15
                  }
                }
            },
            xAxis: {
                    type: 'datetime',
                    title : {
                      text: 'Date'
                    },
                    dateTimeLabelFormats : {
                      day: "%a"
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
      } else if(type == "month"){

        // Object to store all info for weekChart in one place
        $scope.weekChart = {};

        // week graph options
        $scope.weekChart.chartConfig = {
            options: {
                chart: {
                    type: 'column',
                    height: 300
                },
                plotOptions : {
                  column : {
                    pointPadding: 0,
                    groupPadding: 0.0
                  }
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

      }

  	},

    /**
      * updateMultiDayGraph Requests server for data for weekGraph
      * Once recieves weekGraph data, updates graph to display new info
    **/
  	update: function ($http, fromDate, toDate, statService){

  		var fromDate = new Date(fromDate.getFullYear(), 
                              fromDate.getMonth(), 
                              fromDate.getDate(), 
                              0, 0, 0, 0);

  		var toDate = new Date(toDate.getFullYear(), 
                            toDate.getMonth(), 
                            toDate.getDate(), 
                            23, 59, 59, 99);

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
  			name: $scope.username,
  			server: $scope.server

  		}).success(function(response){
  			
        if(response && response != "Error: Specified user could not be found"){

          // Store server reponse
          graphInfo = response;

          // Output response
    			console.log(graphInfo.data);

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
            color: '#cd6066',

            // Marker is a circle not diamond plz
            marker: {
              symbol: "circle"
            }

          }];

          // Remove loading overlay as we've loaded stuff
          $scope.weekChart.chartConfig.loading = false;

          // Update total statistic
          statService.getTotal(graphInfo.data);
        } else {
          console.log("Error + " + response)
        }
  		}).
      error(function(response){
        $scope.errors.push(response);
      });;
  	}
  }
});