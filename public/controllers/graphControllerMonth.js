
// Access Controller for graph page
myApp.controller("monthChartCtrl", ['$timeout','$location', '$scope', '$rootScope', '$http', '$routeParams', 'utilityService' ,'statService', 'multiDayGraphService', 'championPieGraphService', function ($timeout, $location, $normalScope, $rootScope, $http, $routeParams, utilityService, statService, multiDayGraphService, championPieGraphService) {

  // Only scope we want is the rootScope
	$scope = $rootScope;

  $scope.errors = [];

  // Set default select value to oce
  $scope.player = {server: "oce", name: "", backlogged: true, blPercent: 0};

  // Message for users that just finished backlogging
  $rootScope.justBackloggedMessage = [];

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
    
    $rootScope.player.server = $routeParams.server;

    addUser();

		$rootScope.username = $routeParams.username;
    $rootScope.server = $routeParams.server;
    
    $rootScope.timePeriod = $routeParams.timePeriod;

    // Output full server name (oce = Oceanic ect)
    $rootScope.serverFormatted = utilityService.serverFormat($rootScope.server);

    // Generate custom dates based upon timePeriod given
    if($routeParams.date == "ThisMonth"){

      // Change headings 
      $scope.fromDate = undefined;
      $scope.toDate = undefined;

      if($normalScope.demo){
        $normalScope.demo.dtFrom = "Choose Date";
      }

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

          // New user has been added, remove new user message
          var newUserErrMessageIndex = $scope.errors.indexOf("Adding new user, please wait");

          while(newUserErrMessageIndex > -1){
            $scope.errors.splice(newUserErrMessageIndex, 1);
            
            var newUserErrMessageIndex = $scope.errors.indexOf("Adding new user, please wait");
          }
        }

        backLoggingStatus();
    }).
    error(function(response){
      console.log("An error has occured");
      $scope.errors.push(response);
    });
  }


  function backLoggingStatus(){
    
    console.log("Backlogging");

    // Check users backlogged status
    $http.get('/backloggingStatus/' + $routeParams.username + '/' + 
      $routeParams.server).success(function(response){

        if(response === true){

          // User is backlogged all good
          $scope.player.backlogged = true;

          if($scope.player.blPercent !== 0){
            // This was just backlogged, replace with message about completion
            $rootScope.justBackloggedMessage.push("We just finished backlogging all your ranked games, all ranked games since May 2014 are now in our database");

            // Regraph (As we have alot of new data)
            var d = new Date();
            var firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
            var lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            updateAllGraphsAndStats(firstDay, lastDay);
          }

        } else {
          // User isn't backlogged
          $scope.player.backlogged = false;

          var oldestGameDate = new Date(response[0].dateTime);
          var currentDate = new Date();
          var goalDate = new Date(2014, 4, 0);
          
          var msInDay = 3600 * 1000 * 24;
          var daysToDone = (currentDate - goalDate) / msInDay;
          var daysToCurrentDate = (currentDate - oldestGameDate) / msInDay;
        
          var backloggedPercent = daysToCurrentDate / daysToDone * 100;

          $scope.player.blPercent = backloggedPercent;

          console.log($scope.player);

          $timeout(function(){backLoggingStatus()}, 2500);

        }



    });
  }


}]);