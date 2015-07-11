
// Access Controller for graph page
myApp.controller("monthChartCtrl", ['$location', '$scope', '$rootScope', '$http', '$routeParams', 'utilityService' ,'statService', 'multiDayGraphService', 'championPieGraphService', function ($location, $normalScope, $rootScope, $http, $routeParams, utilityService, statService, multiDayGraphService, championPieGraphService) {

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
      

      var d = new Date($normalScope.demo.dtFrom);

      var firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      var lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      // Update vars, to display to front end
      $scope.fromDate = firstDay;
      $scope.toDate = lastDay;

      // Req all graphs and stats
      updateAllGraphsAndStats(firstDay, lastDay);

      // Need to change the :date param in url to new date
      var dispDate = firstDay.getFullYear() + "-" +
                     (firstDay.getMonth()+1) + "-" + 
                     firstDay.getDate(); 

      $location.path("user/" + $scope.username + "/" + $scope.server + "/month/" + dispDate);

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
    if($routeParams.date == "ThisMonth"){

      var d = new Date();
      var firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      var lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      // Req all graphs and stats
      updateAllGraphsAndStats(firstDay, lastDay);
    } else {

      var d = new Date($routeParams.date);

      var firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      var lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      // Update vars, to display to front end
      $scope.fromDate = firstDay;
      $scope.toDate = lastDay;

      // Req all graphs and stats
      updateAllGraphsAndStats(firstDay, lastDay);
    }

  } else {

    // Initalize Two Graphs
    multiDayGraphService.inital("month");
    championPieGraphService.inital();
  }

  function updateAllGraphsAndStats(fromDate, toDate){

    var username = $rootScope.username;
    var server = $rootScope.server;

    championPieGraphService.update($http, fromDate, toDate, statService);

    // Request Line Graph
    multiDayGraphService.update($http, fromDate, toDate, statService);

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