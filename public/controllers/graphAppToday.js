var myApp = angular.module('myCharts', ["chart.js", "ngRoute", "highcharts-ng","ui.bootstrap" ]);


myApp.config(function($routeProvider, $locationProvider) {

  $routeProvider.when('/user/:username/:server/day/:date', {
    template: '',
    // Send routeParams to this controller
    controller: 'todayChartCtrl',
    resolve: {
      // Wait 50 milliseconds before we send params
      delay: function($q, $timeout) {
        var delay = $q.defer();
        $timeout(delay.resolve, 50);
        return delay.promise;
      }
    }
  });

  // configure html5 to get links working on jsfiddle
  $locationProvider.html5Mode(true);
});

myApp.factory('utilityService', function(){

  // Loads the full name of the server for display
  return {
    serverFormat: function (server){
      if(server == "oce"){
        return("Oceanic");
      } else if(server == "na"){
        return("North America");
      } else if(server == "eune"){
        return("Europe Nordic & East");
      } else if(server == "euw"){
        return("Europe West");
      } else if(server == "br"){
        return("Brazil");
      } else if(server == "ru"){
        return("Russia");
      } else if(server == "kr"){
        return("Korea");
      } else if(server == "lan"){
        return("Latin America North");
      } else if(server == "las"){
        return("Latin America South");
      } else if(server == "tr"){
        return("Turkey");
      } else {
      	return("Invalid Server");
      }
    }
  }
});