
// Access Controller for graph page
myApp.controller("todayChartCtrl", ['$scope', '$rootScope', '$http', '$routeParams', 'utilityService' ,'statService', 'todayGraphService', 'championPieGraphService', function ($normalScope, $rootScope, $http, $routeParams, utilityService, statService, todayGraphService, championPieGraphService) {

  // Only scope we want is the rootScope
	$scope = $rootScope;

  // Set default select value to oce
  $scope.player = {server: "oce", name: ""};

  // Object so all our stats live in one place
	$scope.stats = {};

  // When our datepicker is opened
  $scope.open = function($event) {

    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = {};
    $scope.opened[$event.target.id] = true;

    // log this to check if its setting the log    
    console.log($scope.opened);
    
  };

  $normalScope.dateChanged = function(){
      $scope.currentDate = new Date($normalScope.demo.dtFrom);

      var fromDate = new Date($normalScope.demo.dtFrom);
      var toDate = new Date($normalScope.demo.dtFrom);

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
    if($routeParams.timePeriod == "Today"){
      var fromDate = new Date();
      var toDate = new Date();

      // Req all graphs and stats
      updateAllGraphsAndStats(fromDate, toDate);
    } 

  } else {

    // Initalize Two Graphs
    todayGraphService.inital();
    championPieGraphService.inital();
  }

  function updateAllGraphsAndStats(fromDate, toDate){

    var username = $rootScope.username;
    var server = $rootScope.server;

    championPieGraphService.update($http, fromDate, toDate);
    statService.getStatAverageDay($http);
    statService.getStatRecordDay($http);

    // Request W/L stats from server
    statService.getWinLoss($http, fromDate, toDate, username, server);

    // Request Line Graph
    todayGraphService.update($http, fromDate, toDate, statService);

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
          
          var fromDate = new Date();
          var toDate = new Date();
          updateAllGraphsAndStats(fromDate, toDate);
        }
    });
  }


}]);