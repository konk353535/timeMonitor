
// Access Controller for graph page
myApp.controller("todayChartCtrl", ['$rootScope', '$http', '$routeParams', 'utilityService' ,'statService', 'todayGraphService', 'allGraphService', 'multiDayGraphService', 'championPieGraphService', function ($rootScope, $http, $routeParams, utilityService, statService, todayGraphService, allGraphService, multiDayGraphService, championPieGraphService) {

  // Only scope we want is the rootScope
	$scope = $rootScope;

  // Set default select value to oce
  $scope.player = {server: "oce", name: ""};

  // Object so all our stats live in one place
	$scope.stats = {};

  // If we have pulled users name and server from url
	if($routeParams.userName){

    // Add/Update this user
    addUser();

    // Set userName so we can display on page
		$rootScope.userName = $routeParams.userName;

    // Store server incase we need to re-request data
    $rootScope.serverName = $routeParams.userServer;

    // Output full server name (oce = Oceanic ect)
    $rootScope.serverNameFormatted = utilityService.serverFormat($rootScope.serverName);

    // Req all graphs and stats
    updateAllGraphsAndStats();
  }
  else {

    // Initalize all graphs
    todayGraphService.inital();
    allGraphService.inital();
    championPieGraphService.inital();
    multiDayGraphService.inital();
  }

  function updateAllGraphsAndStats(){

    // Request W/L stats from server
    statService.getWinLossToday($rootScope.userName, $rootScope.serverName, $http);

    // Request 4 different graphs data
    todayGraphService.update(statService, $http);
    allGraphService.update(statService, $http);
    championPieGraphService.update($http);
    multiDayGraphService.update($http);

    getChampionTotals();
  }

  function getChampionTotals(){

    // Request server for 10 most played champions
    $http.post('/championTotals', {

      // Pass server users name and server
      name: $routeParams["userName"],
      server: $routeParams["userServer"],

    }).success(function(res){

      console.log("championTotals - " + res);

      // Set championTotals to returned array
      $scope.championTotals = res;

      // res format
      // ["Annie", 5265]
      // Number is in seconds

    });
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
          updateAllGraphsAndStats();
        }
    });
  }


}]);