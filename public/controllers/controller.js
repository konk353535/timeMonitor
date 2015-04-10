var myApp = angular.module('myApp', ["chart.js"]);

myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {

// Set default select value to oce
$scope.player = {server: "oce", name: ""};

// Function that is called once add is hit
$scope.addContact = function(){
	console.log($scope.player.name);
	console.log($scope.player.server);
	$http.post('/newPlayer', $scope.player).success(function(response){
		console.log(response);
	});
};
}]);

