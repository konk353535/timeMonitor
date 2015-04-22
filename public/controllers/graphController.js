

var myApp = angular.module('myCharts', ["chart.js", "ngRoute"]);

// Access specific chart controller
myApp.controller("todayChartCtrl", ['$rootScope', '$http', '$routeParams', function ($rootScope, $http, $routeParams) {

	// Listen for data from user add/updated controller before we load the graph data (angular issues :())
	// Request server for todays graph data
	/*
	$http.post('/userReadyForGraphing/', {userOffSet: offset, graphType: "today"}).success(function(response){
		$scope.data = [response];
	});
	*/
	$scope = $rootScope;
	console.log($routeParams);
	initalDailyGraph();
	if($routeParams.userName){
		updateDailyGraph();
	}

	function initalDailyGraph(){
		$scope.todayChart = {};

		// Today graph options
		$scope.todayChart.labels = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2','3','4','5','6','7','8','9','10','11'];
		$scope.todayChart.series = ['Last 24 Hours'];
		$scope.todayChart.data= [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
		$scope.options = {
		      showTooltips: true
		    };
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
		});
	}



	if($routeParams.userName){
		initalMultiDayGraph();
		updateMultiDayGraph();
		$rootScope.userName = $routeParams.userName;
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