var myApp = angular.module('myApp', ["chart.js", "ngRoute"]);

myApp.controller('AppCtrl', ['$scope', '$rootScope', '$http', '$routeParams', function($scope, $rootScope, $http, $routeParams) {


    console.log($routeParams.userName);

    // Set default select value to oce
    $scope.player = {server: "oce", name: ""};

    // Function that is called once add is hit
	$scope.addContact = function(){
        var offset = new Date().getTimezoneOffset();
        console.log($scope.player.name);
        console.log($scope.player.server);

        var requestInfo = {
            name : $scope.player.name,
            server: $scope.player.server,
            reqOffset : offset
        };

        $http.post('/newPlayer', requestInfo).success(function(response){
            console.log(response);
        });
    }

    // Request server for number of users
    $http.get('/countUsers').success(function(response){

        console.log(response);

        // Display number of users
        $rootScope.userCount = response[0];

    });

}]);

