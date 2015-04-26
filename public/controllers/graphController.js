

var myApp = angular.module('myCharts', ["chart.js", "ngRoute", "highcharts-ng"]);

// Access specific chart controller
myApp.controller("todayChartCtrl", ['$rootScope', '$http', '$routeParams', function ($rootScope, $http, $routeParams) {

	$scope = $rootScope;
	$scope.stats = {};


	console.log($routeParams);

	initalDailyGraph();

	if($routeParams.userName){
		$rootScope.userName = $routeParams.userName;

		getStatRecordDay();
		getStatAverageDay();

		updateDailyGraph();
		updateAllGraph();
	}

	function getStatRecordDay(){
		// Request server for most played day
		$http.post('/stat', {
			name: $routeParams["userName"],
			server: $routeParams["userServer"],
			statType: "recordDay"
		}).success(function(res){
			console.log("Stat - " + res);
			$scope.stats.recordDayMinutes = res.recordMinutes;
			var recordDate = new Date();
			recordDate.setFullYear(res.year);
			recordDate.setMonth(res.month - 1);
			recordDate.setDate(res.day);
			$scope.stats.recordDayDate = recordDate;
		});
	}
	function getStatAverageDay(){
		// Request server for most average day
		$http.post('/stat', {
			name: $routeParams["userName"],
			server: $routeParams["userServer"],
			statType: "averageDay"
		}).success(function(res){
			console.log("AvgMinDay - " + res);
			$scope.stats.averageDayMinutes = res[0];
		});
	}

	function getStatToday(){
		// Sum today chart for total playTime today
		var totalMins = 0;
		var todayDataPoints = $scope.todayChart.data[0];
		console.log(todayDataPoints);
		for (var i = 0; i < todayDataPoints.length; i++){
			totalMins += todayDataPoints[i];
		}

		$scope.stats.todayMinutes = totalMins;
	}


	function initalDailyGraph(){
		$scope.todayChart = {};

		// Today graph options
		$scope.todayChart.labels = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2','3','4','5','6','7','8','9','10','11'];
		$scope.todayChart.series = ['Last 24 Hours'];
		$scope.todayChart.data= [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
		$scope.todayChart.options = {
		      showTooltips: true,
		      bezierCurve: true,
		      pointDot: true
		    };
	}
	initalAllGraph();

	function initalAllGraph(){
		$scope.allChart = {};

		var data = [];

		// Today graph options
		$scope.allChart.chartConfig = {
		    options: {
		        chart: {
		            type: 'spline',
		            zoomType: 'x'
		        }
		    },
		    xAxis: {
		            type: 'datetime',
		            title : {
		            	text: 'Date'
		            },
		            minRange: 4 * 24 * 3600000 // four days
		    },
		    yAxis: {
		    	title : {
		    		text: 'Hours'
		    	},
		    	min: 0
		    },
		    series: [{
		        data: data
		    }],
		    title: {
		        text: 'All Time Tracked'
		    },

		    loading: false
		}
	}
	function updateAllGraph(){

		var offset = new Date().getTimezoneOffset();

		var now = new Date();

		// Request server for all tracked days graph data
		$http.post('/graph', {
			userOffSet: offset,
			graphType: "allGraph",
			clientYear: now.getFullYear(),
			clientMonth: (now.getMonth()+1),
			clientDay: now.getDate(),
			name: $routeParams["userName"],
			server: $routeParams["userServer"]
		}).success(function(response){
			graphInfo = response;

			console.log("AllChart Data - " + graphInfo.dataPoints);

			$scope.allChart.chartConfig.series = [{
			            pointInterval: 24 * 3600 * 1000,
			            name: 'Hours Played',
			            // -1 from firstGameDateMonth, as it is in standard month format 1 = january, where Date.UTC wants format 0 = january
			            pointStart: Date.UTC(graphInfo.firstGameDateYear, graphInfo.firstGameDateMonth-1, graphInfo.firstGameDateDay),
				data: graphInfo.dataPoints
			}];
		});
	}

	function updateDailyGraph(){
		// Gets clients timezone offset
		var offset = new Date().getTimezoneOffset();

		// Request server for todays graph data
		$http.post('/graph', {
			userOffSet: offset,
			graphType: "today",
			name: $routeParams["userName"],
			server: $routeParams["userServer"]
		}).success(function(response){
			$scope.todayChart.data = [response];
			// Update total today played time after we recieve data for today chart
			getStatToday();
		});
	}



	if($routeParams.userName){
		initalMultiDayGraph();
		updateMultiDayGraph();
	}
	else {
		initalMultiDayGraph();
	}

	$scope.getGraph = function(){
		console.log($scope.weekChart.data);
	}

	function initalMultiDayGraph(){
		/*
		Still have to update this functions commenting and spacing (need datepicker)
		Controller for multi day (7 days atm) bar chart
		*/
		$scope.weekChart = {};

		// Mutli day Inital graph options
		$scope.weekChart.labels = ['0','1','2','3','4'];
		$scope.weekChart.series = ['Last 7 Days'];
		$scope.weekChart.data = [[0, 0, 0, 0]];
		$scope.weekChart.options = {
		      showTooltips: true
		};
	}
	function updateMultiDayGraph(){
		var n = new Date();
		var fromDate = new Date(n.getFullYear(), (n.getMonth()), n.getDate(), 0, 0, 0, 0);
		var toDate = new Date(n.getFullYear(), (n.getMonth()), n.getDate(), 0, 0, 0, 0);

		toDate.setDate(fromDate.getDate() + 1);
		fromDate.setDate(fromDate.getDate() - 6);

		var offset = new Date().getTimezoneOffset();

		// Request server for mutli day graph data

		$http.post('/graph', {
			userOffSet: offset,
			graphType: "daysGraph",
			startDate: fromDate,
			endDate: toDate,
			name: $routeParams["userName"],
			server: $routeParams["userServer"]
		}).success(function(response){
			graphInfo = response;

			console.log(graphInfo.data);
			console.log(graphInfo.labels);

			$scope.weekChart.data = [graphInfo.data];
			$scope.weekChart.labels = graphInfo.labels;

			console.log($scope.weekChart.data);
		});
	}

	initalMultiDayChampGraph();

	if($routeParams.userName){

		updateMultiDayChampGraph();
	}

	function updateMultiDayChampGraph(){
		/*
		Still have to update this functions commenting and spacing (need datepicker)
		Controller for champion pie chart
		*/
		var n = new Date();
		var fromDate = new Date(n.getFullYear(), (n.getMonth()), n.getDate(), 0, 0, 0, 0);
		var toDate = new Date(n.getFullYear(), (n.getMonth()), n.getDate(), 23, 59, 59, 99);
		toDate.setDate(fromDate.getDate());
		fromDate.setDate(fromDate.getDate() - 6);
		console.log("ToDate = " + toDate);
		console.log("fromDate = " + fromDate);


		var offset = new Date().getTimezoneOffset();

		// Request server for mutli day graph data

		$http.post('/graph', {
			userOffSet: offset,
			graphType: "championDaysGraph",
			startDate: fromDate,
			endDate: toDate,
			name: $routeParams["userName"],
			server: $routeParams["userServer"]
		}).success(function(response){
			graphInfo = response;

			console.log(graphInfo.data);
			console.log(graphInfo.labels);

			$scope.champChart.data = graphInfo.data;
			$scope.champChart.labels = graphInfo.labels;
		});
	}
	function initalMultiDayChampGraph(){
		// Inital Chart Setting for champion breakdown chart
		$scope.champChart = {};
		$scope.champChart.options = {tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %> hr"}
	}

}]);



myApp.config(function($routeProvider, $locationProvider) {
  $routeProvider
   .when('/user/:userName/:userServer', {
    template: ' ',
    controller: 'todayChartCtrl',
    resolve: {
      // I will cause a 1 second delay
      delay: function($q, $timeout) {
        var delay = $q.defer();
        $timeout(delay.resolve, 200);
        return delay.promise;
      }
    }
  })
  .when('/Book/:bookId/ch/:chapterId', {
    templateUrl: 'chapter.html',
    controller: 'ChapterController'
  });

  // configure html5 to get links working on jsfiddle
  $locationProvider.html5Mode(true);
});



angular.bootstrap(document.getElementById("chartApp"), ['myApp', 'myCharts']);