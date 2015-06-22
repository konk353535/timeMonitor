



// Access Controller for graph page
myApp.controller("todayChartCtrl", ['$rootScope', '$http', '$routeParams', 'utilityService' ,'statService', function ($rootScope, $http, $routeParams, utilityService, statService) {

  // Only scope we want is the rootScope
	$scope = $rootScope;

  // Set default select value to oce
  $scope.player = {server: "oce", name: ""};

  // Object so all our stats live in one place
	$scope.stats = {};

  // If we have pulled users name and server from url
	if($routeParams.userName){
    // Add/Update this user
    addUser();

    // Set userName so we can display on page
		$rootScope.userName = $routeParams.userName;

    // Store server incase we need to re-request data
    $rootScope.serverName = $routeParams.userServer;

    $rootScope.serverNameFormatted = utilityService.serverFormat($rootScope.serverName);

    updateAllGraphsAndStats();
  }
  else {
    // Initalize all graphs
    initalDailyGraph();
    initalAllGraph();
    initalMultiDayChampGraph();
    initalMultiDayGraph();
  }




  function updateAllGraphsAndStats(){
    // Request W/L stats from server
    statService.getWinLossToday($rootScope.userName, $rootScope.serverName, $http);

    // Request 4 different graphs data
    updateDailyGraph();
    updateAllGraph();
    updateMultiDayChampGraph();
    updateMultiDayGraph();

    getChampionTotals();
  }



  function getChampionTotals(){

    // Request server for 10 most played champions
    $http.post('/championTotals', {

      // Pass server users name and server
      name: $routeParams["userName"],
      server: $routeParams["userServer"],

    }).success(function(res){

      console.log("championTotals - " + res);

      // Set championTotals to returned array
      $scope.championTotals = res;

      // res format
      // ["Annie", 5265]
      // Number is in seconds

    });
  }












  /**
    * initalDailyGraph() sets default setting for today graph
    *
    *
  **/
	function initalDailyGraph(){

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
	}

	/**
    * updateDailyGraph() 
    * requests server for data to graph the 24 hours graph
    *
  **/
  function updateDailyGraph(){

    // Gets clients timezone offset
    var offset = new Date().getTimezoneOffset();

    // Request server for todays graph data
    $http.post('/graph', {

      // Store client's timezone so graph is in there timezone
      userOffSet: offset,

      // Let server know what type of graph we want
      graphType: "today",

      // Store users name and server
      name: $routeParams["userName"],
      server: $routeParams["userServer"]

    }).success(function(response){

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
        statService.getStatToday();
      }
    });
  }

  

	function initalAllGraph(){
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
	}

  /**
    * updateAllGraph() Requests server for all data
    * Each datapoint is a day
    *
    *
  **/
	function updateAllGraph(){

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
			name: $routeParams["userName"],
			server: $routeParams["userServer"]

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

          // -1 from firstGameDateMonth, as it is in standard month format 1 = january, where Date.UTC wants format 0 = january
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

  

  /**
    * initalMultiDayGraph() Initalizes setting for Week graph
    *
    *
    *
  **/
	function initalMultiDayGraph(){
		
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
	}

  /**
    * updateMultiDayGraph Requests server for data for weekGraph
    * Once recieves weekGraph data, updates graph to display new info
  **/
	function updateMultiDayGraph(){

    // Get current date for client
		var n = new Date();
		var fromDate = new Date(
      n.getFullYear(), (n.getMonth()), n.getDate(), 0, 0, 0, 0);
		var toDate = new Date(
      n.getFullYear(), (n.getMonth()), n.getDate(), 0, 0, 0, 0);

    // Set From date (date 7 days ago)
    // Set To date (end of today)
		toDate.setDate(fromDate.getDate() + 1);
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
			name: $routeParams["userName"],
			server: $routeParams["userServer"]

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

  /**
    * initalMultiDayChampGraph() initalizes graph settings for pie graph
    *
  **/
  function initalMultiDayChampGraph(){

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

  }

  /**
    * updateMultiDayChampGraph() request server for champion played data
    * Once recieves graph the data given on a pie chart
    *
  **/
	function updateMultiDayChampGraph(){

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

      // Users name and password
			name: $routeParams["userName"],
			server: $routeParams["userServer"]

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

  /**
    * addUser() attempts to add/update this user
    *
    *
  **/
  function addUser(){
    var offset = new Date().getTimezoneOffset();

    var requestInfo = {
        name : $routeParams.userName,
        server: $routeParams.userServer,
        reqOffset : offset
    };

    $http.post('/newPlayer', requestInfo).success(function(response){
        console.log(response);
        if(response == "ReGraphPlz"){
          updateAllGraphsAndStats();
        }
    });
  }


}]);




