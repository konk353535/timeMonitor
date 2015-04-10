// Access specific angular chart js
myApp.controller("ChartCtrl", function ($scope, $http) {
	// Request server for graph information
	$scope.getGraph = function(){

		// Gets clients timezone offset
		var offset = new Date().getTimezoneOffset();
		// Request server for todays graph data
		$http.post('/graph', {userOffSet: offset}).success(function(response){
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