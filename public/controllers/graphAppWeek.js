var myApp = angular.module('myCharts', ["chart.js", "ngRoute", "highcharts-ng","ui.bootstrap" ]);


myApp.config(function($routeProvider, $locationProvider) {

  $routeProvider.when('/user/:username/:server/:timePeriod', {
    template: '',
    // Send routeParams to this controller
    controller: 'weekChartCtrl',
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
      } else if(server == "eue"){
        return("Europe East");
      } else if(server == "euw"){
        return("Europe West");
      } else {
      	return("Invalid Server");
      }
    }
  }
});