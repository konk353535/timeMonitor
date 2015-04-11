var myApp = angular.module('myCharts', ["chart.js"]);

// Access specific chart controller
myApp.controller("todayChartCtrl", function ($scope, $http) {
	// Request server for graph information
	updateDailyGraph();

	$scope.getGraph = function(){
		updateDailyGraph();
	}

	function updateDailyGraph(){
		// Gets clients timezone offset
		var offset = new Date().getTimezoneOffset();

		// Request server for todays graph data
		$http.post('/graph', {userOffSet: offset, graphType: "today"}).success(function(response){
			$scope.data = [response];
		});
	}
	

	// Today graph options
	$scope.labels = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '1', '2','3','4','5','6','7','8','9','10','11'];
	$scope.series = ['Last 24 Hours'];
	$scope.data = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
	$scope.options = {
	      showTooltips: true
	    };

});
myApp.controller("weekChartCtrl", function ($scope, $http) {
	/*
	Still have to update this functions commenting and spacing (need datepicker)
	*/

	var fromDate = new Date("April 7, 2015");
	var toDate = new Date("April 12, 2015");

	console.log(fromDate);
	console.log(toDate);
	
	// Request server for multi day graph information
	function updateMultiDayGraph(){
		var offset = new Date().getTimezoneOffset();
		// Request server for mutli day graph data
		$http.post('/graph', {userOffSet: offset, graphType: "daysGraph", startDate: fromDate, endDate: toDate}).success(function(response){
			graphInfo = response;

			console.log(graphInfo.data);
			console.log(graphInfo.labels);
			
			$scope.data = [graphInfo.data];
			$scope.labels = graphInfo.labels;
		});
	}

	$scope.getGraph = function(){
		updateMultiDayGraph();
	}

	// Multi day Inital graph options
	$scope.labels = ['0','1','2','3','4'];
	$scope.series = ['Last 5 Days'];
	$scope.data = [[0, 0, 0, 0]];
	$scope.options = {
	      showTooltips: true
	    };
});

angular.bootstrap(document.getElementById("chartApp"), ['myApp', 'myCharts']);