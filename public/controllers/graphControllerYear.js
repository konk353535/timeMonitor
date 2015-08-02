
// Access Controller for graph page
myApp.controller("yearChartCtrl", ['$timeout', '$location', '$scope', '$rootScope', '$http', '$routeParams', 'utilityService' ,'statService', 'yearGraphService', 'championPieGraphService', function ($timeout, $location, $normalScope, $rootScope, $http, $routeParams, utilityService, statService, yearGraphService, championPieGraphService) {

  // Only scope we want is the rootScope
	$scope = $rootScope;

  $scope.errors = [];

  // Set default select value to oce
  $scope.player = {server: "oce", name: "", backlogged: true, blPercent: 0};

  // Object so all our stats live in one place
	$scope.stats = {};

  $scope.current = {};

  // When our year dropdown is changed
  $normalScope.dateChanged = function(){
    var year = $normalScope.picker.year;

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
    
    updateAllGraphsAndStats(year);

  } else {

    // Initalize graph setting
    yearGraphService.inital();
    championPieGraphService.inital();
    
  }

  function updateAllGraphsAndStats(year){
    $scope.current.year = year;

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

          updateAllGraphsAndStats(d.getFullYear());

          // New user has been added, remove that message
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
            // This was just updated, replace with message about completion

            var d = new Date();

            updateAllGraphsAndStats(d.getFullYear());
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