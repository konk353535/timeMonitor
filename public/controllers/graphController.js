
// Access Controller for graph page
myApp.controller("todayChartCtrl", ['$rootScope', '$http', '$routeParams', 'utilityService' ,'statService', 'todayGraphService', 'allGraphService', function ($rootScope, $http, $routeParams, utilityService, statService, todayGraphService, allGraphService) {

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

    // Output full server name (oce = Oceanic ect)
    $rootScope.serverNameFormatted = utilityService.serverFormat($rootScope.serverName);

    // Req all graphs and stats
    updateAllGraphsAndStats();
  }
  else {

    // Initalize all graphs
    todayGraphService.initalDailyGraph();
    allGraphService.initalAllGraph();
    initalMultiDayChampGraph();
    initalMultiDayGraph();
  }

  function updateAllGraphsAndStats(){
    
    // Request W/L stats from server
    statService.getWinLossToday($rootScope.userName, $rootScope.serverName, $http);

    // Request 4 different graphs data
    todayGraphService.updateDailyGraph(statService, $http);
    allGraphService.updateAllGraph(statService, $http);
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