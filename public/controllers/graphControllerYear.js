
// Access Controller for graph page
myApp.controller("yearChartCtrl", ['$location', '$scope', '$rootScope', '$http', '$routeParams', 'utilityService' ,'statService', 'yearGraphService', 'championPieGraphService', function ($location, $normalScope, $rootScope, $http, $routeParams, utilityService, statService, yearGraphService, championPieGraphService) {

  // Only scope we want is the rootScope
	$scope = $rootScope;

  $scope.errors = [];

  // Set default select value to oce
  $scope.player = {server: "oce", name: ""};

  // Object so all our stats live in one place
	$scope.stats = {};

  $scope.current = {};

  // When our year dropdown is changed
  $normalScope.dateChanged = function(){
    var year = $normalScope.picker.year;
    
    $scope.current.year = year;

    // Changing the location path causes route params to be recalled
    
    $location.path("user/" + $scope.username + "/" + $scope.server + "/year/" + year);
  }

  // If we have pulled users name and server from url
	if($routeParams.username){
    
    $rootScope.player.server = $routeParams.server;

    addUser();

		$rootScope.username = $routeParams.username;
    $rootScope.server = $routeParams.server;
    
    $rootScope.timePeriod = $routeParams.timePeriod;

    // Output full server name (oce = Oceanic ect)
    $rootScope.serverFormatted = utilityService.serverFormat($rootScope.server);

    if($routeParams.date == "ThisYear"){
      // Get current year
      var d = new Date();
      var year = d.getFullYear();
    } else {
      var year = $routeParams.date;
    }
    
    $scope.current.year = year;
    
    updateAllGraphsAndStats(year);

  } else {

    // Initalize graph setting
    yearGraphService.inital();
    championPieGraphService.inital();
    
  }

  function updateAllGraphsAndStats(year){

    console.log(year);

    var username = $rootScope.username;
    var server = $rootScope.server;

    yearGraphService.update($http, year);

    var fromDate = new Date(year, 0, 0);
    var toDate = new Date(year, 11, 31);
    
    championPieGraphService.updatePositionGraph($http, fromDate, toDate);

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

          updateAllGraphsAndStats(2007);
        }
    }).
    error(function(response){
      console.log("An error has occured");
      $scope.errors.push(response);
    });
  }


}]);