
// Access Controller for graph page
myApp.controller("yearChartCtrl", ['$location', '$scope', '$rootScope', '$http', '$routeParams', 'utilityService' ,'statService', 'yearGraphService', 'championPieGraphService', function ($location, $normalScope, $rootScope, $http, $routeParams, utilityService, statService, yearGraphService, championPieGraphService) {

  // Only scope we want is the rootScope
	$scope = $rootScope;

  $scope.errors = [];

  // Set default select value to oce
  $scope.player = {server: "oce", name: ""};

  // Object so all our stats live in one place
	$scope.stats = {};
  


  // If we have pulled users name and server from url
	if($routeParams.username){
    
    $rootScope.player.server = $routeParams.server;

    addUser();

		$rootScope.username = $routeParams.username;
    $rootScope.server = $routeParams.server;
    
    $rootScope.timePeriod = $routeParams.timePeriod;

    // Output full server name (oce = Oceanic ect)
    $rootScope.serverFormatted = utilityService.serverFormat($rootScope.server);

    updateAllGraphsAndStats(2015);

  } else {

    // Initalize graph setting
    yearGraphService.inital();
    
  }

  function updateAllGraphsAndStats(year){

    var username = $rootScope.username;
    var server = $rootScope.server;

    yearGraphService.update($http, year);

  }

  /**
    * addUser() attempts to add/update this user
    *
    *
  **/
  function addUser(){
    var offset = new Date().getTimezoneOffset();

    var requestInfo = {
        name : $routeParams.username,
        server: $routeParams.server,
        reqOffset : offset
    };

    $http.post('/newPlayer', requestInfo).success(function(response){
        console.log(response);
        if(response === "ReGraphPlz"){
          
          var d = new Date();

          var firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
          var lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

          updateAllGraphsAndStats(firstDay, lastDay);
        }
    }).
    error(function(response){
      console.log("An error has occured");
      $scope.errors.push(response);
    });
  }


}]);