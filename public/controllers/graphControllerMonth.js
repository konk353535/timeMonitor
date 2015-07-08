
// Access Controller for graph page
myApp.controller("weekChartCtrl", ['$scope', '$rootScope', '$http', '$routeParams', 'utilityService' ,'statService', 'multiDayGraphService', 'championPieGraphService', function ($normalScope, $rootScope, $http, $routeParams, utilityService, statService, multiDayGraphService, championPieGraphService) {

  // Only scope we want is the rootScope
	$scope = $rootScope;

  $scope.errors = [];

  // Set default select value to oce
  $scope.player = {server: "oce", name: ""};

  // Object so all our stats live in one place
	$scope.stats = {};
  
  $scope.open = function($event) {

    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = {};
    $scope.opened[$event.target.id] = true;
    
  };

  // When our datepicker is opened
  $normalScope.dateChanged = function(){
      

      var fromDate = new Date($normalScope.demo.dtFrom);
      var toDate = new Date($normalScope.demo.dtFrom);

      toDate.setDate(toDate.getDate() + 6);
      
      $scope.fromDate = fromDate;
      $scope.toDate = toDate;

      updateAllGraphsAndStats(fromDate, toDate);
  }

  // If we have pulled users name and server from url
	if($routeParams.username){

    addUser();

		$rootScope.username = $routeParams.username;
    $rootScope.server = $routeParams.server;

    $rootScope.timePeriod = $routeParams.timePeriod;

    // Output full server name (oce = Oceanic ect)
    $rootScope.serverFormatted = utilityService.serverFormat($rootScope.server);

    // Generate custom dates based upon timePeriod given
    if($routeParams.timePeriod == "ThisWeek"){

      var toDate = new Date();
      var fromDate = new Date();

      fromDate.setDate(toDate.getDate() - 6);

      // Req all graphs and stats
      updateAllGraphsAndStats(fromDate, toDate);
    } 

  } else {

    // Initalize Two Graphs
    multiDayGraphService.inital();
    championPieGraphService.inital();
  }

  function updateAllGraphsAndStats(fromDate, toDate){

    var username = $rootScope.username;
    var server = $rootScope.server;

    championPieGraphService.update($http, fromDate, toDate, statService);

    // Request Line Graph
    multiDayGraphService.update($http, fromDate, toDate, statService);

    // Request W/L stats from server
    statService.getWinLoss($http, fromDate, toDate, username, server);

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
          
          var toDate = new Date();
          var fromDate = new Date();

          fromDate.setDate(toDate.getDate() - 6);

          updateAllGraphsAndStats(fromDate, toDate);
        }
    }).
    error(function(response){
      console.log("An error has occured");
      $scope.errors.push(response);
    });
  }


}]);