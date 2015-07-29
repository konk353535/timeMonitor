myApp.factory('yearGraphService', function(){



  function getChampName(ChampionId){
    var champNames = [0,"Annie","Olaf","Galio","Twisted Fate","Xin Zhao","Urgot","LeBlanc","Vladimir","Fiddlesticks","Kayle","Master Yi","Alistar","Ryze","Sion","Sivir","Soraka","Teemo","Tristana","Warwick","Nunu","Miss Fortune","Ashe","Tryndamere","Jax","Morgana","Zilean","Singed","Evelynn","Twitch","Karthus","Cho'Gath","Amumu","Rammus","Anivia","Shaco","Dr. Mundo","Sona","Kassadin","Irelia","Janna","Gangplank","Corki","Karma","Taric","Veigar",46,47,"Trundle",49,"Swain","Caitlyn",52,"Blitzcrank","Malphite","Katarina","Nocturne","Maokai","Renekton","Jarvan IV","Elise","Orianna","Wukong","Brand","Lee Sin",65,66,"Vayne","Rumble","Cassiopeia",70,71,"Skarner",73,"Heimerdinger","Nasus","Nidalee","Udyr","Poppy","Gragas","Pantheon","Ezreal","Mordekaiser","Yorick","Akali","Kennen","Garen",87,88,"Leona","Malzahar","Talon","Riven",93,94,95,"Kog'Maw",97,"Shen","Lux",100,"Xerath","Shyvana","Ahri","Graves","Fizz","Volibear","Rengar",108,109,"Varus","Nautilus","Viktor","Sejuani","Fiora","Ziggs",116,"Lulu",118,"Draven","Hecarim","Kha'Zix","Darius",123,124,125,"Jayce","Lissandra",128,129,130,"Diana",132,"Quinn","Syndra",135,136,137,138,139,140,141,142,"Zyra",144,145,146,147,148,149,"Gnar",151,152,153,"Zac",155,156,"Yasuo",158,159,160,"Vel'Koz",162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,"Braum",202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221,"Jinx","Tahm Kench",224,225,226,227,228,229,230,231,232,233,234,235,"Lucian",237,"Zed",239,240,241,242,243,244,"Ekko",246,247,248,249,250,251,252,253,"Vi",255,256,257,258,259,260,261,262,263,264,265,"Aatrox","Nami","Azir",269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,"Thresh",413,414,415,416,417,418,419,420,"Rek'Sai",422,423,424,425,426,427,428,"Kalista",430,431,"Bard",433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477,478,479,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,495,496,497,498,499,500,501,502,503,504,505,506,507,508,509,510,511,512,513,514,515,516,517,518,519,520,521,522,523,524,525,526,527,528,529,530,531,532,533,534,535,536,537,538,539,540,541,542,543,544,545,546,547,548,549,550,551,552,553,554,555,556,557,558,559,560,561,562,563,564,565,566,567,568,569,570,571,572,573,574,575,576,577,578,579,580,581,582,583,584,585,586,587,588,589,590,591,592,593,594,595,596,597,598,599,600,601,602,603,604,605,606,607,608,609,610,611,612,613,614,615,616,617,618,619,620,621,622,623,624,625,626,627,628,629,630,631,632,633,634,635,636,637,638,639,640,641,642,643,644,645,646,647,648,649,650,651,652,653,654,655,656,657,658,659,660,661,662,663,664,665,666,667,668,669,670,671,672,673,674,675,676,677,678,679,680,681,682,683,684,685,686,687,688,689,690,691,692,693,694,695,696,697,698,699];


    var championName = champNames[ChampionId];
    
    return championName;
  }

  function formatYearData(response){
    var monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    var allData = response;

    // Default month data
    var monthData = [{name: "January", y: 0},
                     {name: "February", y: 0},
                     {name: "March", y: 0},
                     {name: "April", y: 0},
                     {name: "May", y: 0},
                     {name: "June", y: 0},
                     {name: "July", y: 0},
                     {name: "August", y: 0},
                     {name: "September", y: 0},
                     {name: "October", y: 0},
                     {name: "November", y: 0},
                     {name: "December", y: 0}
    ];
    var drillDownMonthData = [];

    allData.forEach(function(month){

      // Convert month number to 0 index
      var monthNumber = month._id - 1;

      var monthName = monthNames[monthNumber];

      var monthSec = month.totalSeconds;
      var monthHours = Math.round(monthSec / 3600 * 100) / 100;

      monthData[monthNumber] = {name: monthName, y: monthHours, 
        drilldown: monthName};

      var monthDrillDownPack = {name: monthName, id: monthName, data: []};

      // Iterate over each champion played in this month
      var champions = month.champion;

      champions.forEach(function(champion){

        var championName = getChampName(champion.champion);
        var champHours = Math.round(champion.count / 3600 * 100) / 100;
        monthDrillDownPack.data.push([championName, champHours]);

      });


      monthDrillDownPack.data.sort(function(a,b){
        return b[1] - a[1];
      });

      drillDownMonthData.push(monthDrillDownPack);

      
    });

    console.log(drillDownMonthData);

    $scope.yearChart.chartConfig.series = [{

      colorByPoint: true,

      // Name on tooltip is Hours Played: Value
      name: 'Hours Played',

      // Set graph data to data from server
      data: monthData

    }];

    $scope.yearChart.chartConfig.options.drilldown = {
      series: drillDownMonthData,
      activeAxisLabelStyle: {
          textDecoration: 'none',
          fontStyle: 'normal',
          color: '#E0E0E3'

      },
      activeDataLabelStyle: {
          textDecoration: 'none',
          fontStyle: 'normal',
          color: '#E0E0E3'
      },
    };


    console.log($scope.yearChart.chartConfig);

    // Remove loading overlay as we've loaded stuff
    $scope.yearChart.chartConfig.loading = false;


  }

  /**
      * inital() Initalizes setting for bar graph
      *
      *
      *
    **/
  function inital(){

      // Object to store all info for yearChart in one place
      $scope.yearChart = {};

      // week graph options
      $scope.yearChart.chartConfig = {
          options: {
              chart: {
                  type: 'column'
              }
          },
          xAxis: {
                  type: 'category',
                  title : {
                    text: ''
                  }
          },
          legend: {
            enabled: false
          },
          yAxis: {
            title : {
              text: 'Hours'
            },

            // Min y-value of 0 so no negative range (can't have -time)
            min: 0
          },
          series: [{
              data: []
          }],
          title: {
              text: ''
          },

          // Loading true as we don't have data yet
          loading: true
      }

  }

  /**
    * updateMultiDayGraph Requests server for data for weekGraph
    * Once recieves weekGraph data, updates graph to display new info
  **/
  function update($http, year){


    // Store timezone for server
    var offset = new Date().getTimezoneOffset();

    // Request server for year graph data
    $http.post('/graph', {

      // Store timezone so server get's client's timezone days
      userOffSet: offset,

      // What graph do we want
      graphType: "yearGraph",

      // Year to graph
      year: year,

      // Users name and server
      name: $scope.username,
      server: $scope.server

    }).success(function(response){
      
        // Output response
        console.log(response);

        formatYearData(response);
      
    }).
    error(function(response){
      $scope.errors.push(response);
    });
  }

  return {  
    inital: inital,
    update: update
  }
});