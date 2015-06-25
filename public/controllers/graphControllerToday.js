
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

  // When the date has changed (need to use normalScope so we can access scope of date picker)
  $normalScope.dateChanged = function(){
      $scope.currentDate = new Date($normalScope.demo.dtFrom);
      var fromDate = new Date($normalScope.demo.dtFrom);
      var toDate = new Date($normalScope.demo.dtFrom);

      console.log(fromDate);
      console.log(toDate);

      // Req all graphs and stats
      updateAllGraphsAndStats(fromDate, toDate);
  }




  // If we have pulled users name and server from url
	if($routeParams.userName){


    // Add/Update this user
    addUser();

    // Set userName so we can display on page
		$rootScope.userName = $routeParams.userName;

    // Store server incase we need to re-request data
    $rootScope.serverName = $routeParams.userServer;

    // Store time period
    $rootScope.timePeriod = $routeParams.timePeriod;

    // Output full server name (oce = Oceanic ect)
    $rootScope.serverNameFormatted = utilityService.serverFormat($rootScope.serverName);

    // Generate custom dates based upon timePeriod given
    if($routeParams.timePeriod == "Today"){
      var fromDate = new Date();
      var toDate = new Date();

      console.log(fromDate);
      console.log(toDate);

      // Req all graphs and stats
      updateAllGraphsAndStats(fromDate, toDate);
    } 

  } else {

    // Initalize Two Graphs
    todayGraphService.inital();
    championPieGraphService.inital();
  }

  function updateAllGraphsAndStats(fromDate, toDate){




    // Properly converted functions
    championPieGraphService.update($http, fromDate, toDate);
    statService.getStatAverageDay($http);
    statService.getStatRecordDay($http);


    // Request W/L stats from server
    statService.getWinLossToday($rootScope.userName, $rootScope.serverName, $http);

    // Request 4 different graphs data
    todayGraphService.update(fromDate, toDate, statService, $http);

  }

  /**
    * addUser() attempts to add/update this user
    *
    *
  **/
  function addUser(){
    var offset = new Date().getTimezoneOffset();

    var requestInfo = {
        name : $routeParams.userName,
        server: $routeParams.userServer,
        reqOffset : offset
    };

    $http.post('/newPlayer', requestInfo).success(function(response){
        console.log(response);
        if(response == "ReGraphPlz"){
          
          var fromDate = new Date();
          var toDate = new Date();
          updateAllGraphsAndStats(fromDate, toDate);
        }
    });
  }


}]);