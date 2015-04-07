var myApp = angular.module('myApp', []);
myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {



// Function that is called once add is hit
$scope.addContact = function(){
	console.log($scope.contact.name);
};








}]);