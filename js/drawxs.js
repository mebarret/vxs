  
  //Initialize geologic unit arrays
  var Cah_dps = [];
  var Eqsurf_dps = [];
  var Eq_dps = [];
  var G1_dps = [];
  var G2_dps = [];
  var G3_dps = [];
  var GP_dps = [];
  var GS1f_dps = [];
  var GS1_dps = [];
  var GS2_dps = [];
  var Ha_dps = [];
  var Hbf_dps = [];
  var Hb_dps = [];
  var Hen1_dps = [];
  var Hy_dps = [];
  var Pef_dps = [];
  var Ped_dps = [];
  var Water_dps = [];
  var Wh_dps = [];
  var Win_dps = [];
  var Wns_dps = [];
  var Wt_dps = [];
  var Wy_dps = [];
  var Bdrk_dps = [];
  var PotSurf_dps = [];
 
  //Clear geologic unit arrays 
  function clearDataPointObjects(){
    PotSurf_dps.length = 0;
    Bdrk_dps.length = 0;
    Cah_dps.length = 0;
    Eqsurf_dps.length = 0;
    Eq_dps.length = 0;
    G1_dps.length = 0;
    G2_dps.length = 0;
    G3_dps.length = 0;
    GP_dps.length = 0;
    GS1f_dps.length = 0;
    GS1_dps.length = 0;
    GS2_dps.length = 0;
    Ha_dps.length = 0;
    Hbf_dps.length = 0;
    Hb_dps.length = 0;
    Hen1_dps.length = 0;
    Hy_dps.length = 0;
    Pef_dps.length = 0;
    Ped_dps.length = 0;
    Water_dps.length = 0;
    Wh_dps.length = 0;
    Win_dps.length = 0;
    Wns_dps.length = 0;
    Wt_dps.length = 0;
    Wy_dps.length = 0;
  }
  
  
  
//HighCharts  
      var chart;
      var myChartHeight = 322; //This creates a 1" = 200' vertical scale graph 
      var myXAxisLabel = "Distance (miles)";
      var myYAxisLabel = "Elevation (feet)";
      var myChartType = '';
      var myLineThickness = 0;
      var myFillOpacity = 0.9;
      
      var w = window,
          d = document,
          e = d.documentElement,
          g = d.getElementsByTagName('body')[0],
          x = w.innerWidth || e.clientWidth || g.clientWidth,
          y = w.innerHeight|| e.clientHeight|| g.clientHeight;
          console.log('Width:  ' + x + ', Height:  ' + y);
      

      function clearMapGraphics(){
          map.graphics.clear();
      }

      function drawCrossSection(xslength, ptSymbol){        
        console.log("you made it to the xs drawing!");
        var myChartWidth;
        myChartWidth = xslength + 150 + 260; //this accounts for the width of the axis labels
        document.getElementById('chartContainer').style.width = myChartWidth + "px";;  //positions More Options button at far righthand side of chartContainer 
        
        document.getElementById('chartContainer').addEventListener("mouseout", clearMapGraphics);
        
        //Highcharts
        Highcharts.chart('container', {
            chart: {
              animation: false
            },
            title: {
                text: null
            },

            plotOptions: {
                series: {
                  
                    //cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                                //alert('Name: ' + this.series.name + ', Bottom: ' + this.low+ ', Top: ' + this.high);
                                map.centerAndZoom(this.myPoint, 15);
                            },
                            mouseOver: function () {
                                map.graphics.clear();
                                //add point to map
                                var ptgraphic = new esri.Graphic(this.myPoint, ptSymbol);                
                                map.graphics.add(ptgraphic);
                            }
                        }
                    }
                }
            },
        
            xAxis: {
              crosshair: {
                zIndex: 3
              },
                type: 'linear',
                title: {
                    text: "Distance (miles)"
                },
            },
        
            yAxis: [
            {
                tickInterval: 100,
                lineWidth: 1,
                min: 500,
                max: 1200,
                title: {
                    text: "Elevation (feet)"
                },
                opposite: true
            },{
                tickInterval: 100,
                lineWidth: 1,
                min: 500,
                max: 1200,
                title: {
                    text: "Elevation (feet)"
                }
            }],
        
            tooltip: {
                positioner: function () {
                            return { x: -280, y: 0 };
                        },                
                headerFormat: '<span>{point.x:.2f} miles</span><br/>',
                crosshairs: true,
                borderColor: 'black',
                shared: true,
                valueDecimals: 2,
                valueSuffix: ' ft'
            },
        
            legend: {
                enabled: false
            },
            
            series: [
            {
              states:{
                hover:{
                  enabled: false
                }
              },
              marker: {
                radius: 1,
              },
              name: "Surficial Aquifer Water Table",
              data: PotSurf_dps,
              color: "rgba(0,0,0)",
              type: "line",
              lineWidth: 1.5,
              zIndex: 1
            },
            {
              name: "Water",
              data: Water_dps,
              color: "rgb(191,239,255)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Grayslake Peat",
              data: GP_dps,
              color: "rgb(153,155,158)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },          
            {
              name: "Cahokia",
              data: Cah_dps,
              color: "gold",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Equality Fm 1",
              data: Eqsurf_dps,
              color: "rgb(239,91,161)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Equality Fm 2",
              data: Eq_dps,
              color: "rgb(225,194,221)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Henry Fm",
              data: Hen1_dps,
              color: "rgb(255,197,65)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Haeger Mbr",
              data: Wh_dps,
              color: "rgb(60,135,50)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Beverly Tongue",
              data: Hb_dps,
              color: "rgb(229,162,21)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Beverly Tongue Fine",
              data: Hbf_dps,
              color: "rgb(156,121,35)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Yorkville Mbr",
              data: Wy_dps,
              color: "rgb(115,157,210)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Unnamed Henry Fm",
              data: Hy_dps,
              color: "rgb(255,233,184)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Tiskilwa Fm",
              data: Wt_dps,
              color: "rgb(83,171,65)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Ashmore Tongue",
              data: Ha_dps,
              color: "rgb(252,178,22)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Pearl Fm Fine",
              data: Pef_dps,
              color: "rgb(139,139,0)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Winnebago Fm",
              data: Win_dps,
              color: "rgb(216,113,161)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Winnebago Fm Sand",
              data: Wns_dps,
              color: "rgb(255,221,0)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Glasford Fm 1",
              data: G1_dps,
              color: "rgb(246,150,121)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Glasford Sand 1",
              data: GS1_dps,
              color: "rgb(255,212,142)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Glasford Sand 1 Fine",
              data: GS1f_dps,
              color: "rgb(153,207,171)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Glasford Fm 2",
              data: G2_dps,
              color: "rgb(204,126,131)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Glasford Sand 2",
              data: GS2_dps,
              color: "rgb(210,158,32)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Glasford Fm 3",
              data: G3_dps,
              color: "rgb(151,91,73)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Peddicord Fm",
              data: Ped_dps,
              color: "rgb(151,141,0)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Bedrock",
              data: Bdrk_dps,
              color: "rgb(251,199,179)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            ]
        });  
  
            
      }


      function drawBorehole(xslength, ptSymbol, mp){        
        console.log("you made it to the xs drawing!");
        var myChartWidth;
        myChartWidth = 200; //this accounts for the width of the axis labels
        document.getElementById('chartContainer').style.width = myChartWidth + "px";;  //positions More Options button at far righthand side of chartContainer 
        clearMapGraphics();
        var ptgraphic = new esri.Graphic(mp, ptSymbol);                
        map.graphics.add(ptgraphic);
 
        //Highcharts
        Highcharts.chart('container', {
            chart: {
              zoomType: 'y',
              animation: false
            },
            title: {
                text: null
            },

            plotOptions: {
                series: {
                    stickyTracking: false,
                    pointWidth: 30,
                    stacking: 'normal',
                    cursor: 'pointer',
                    point: {
                        events: {
                            click: function () {
                                //alert('Name: ' + this.series.name + ', Bottom: ' + this.low+ ', Top: ' + this.high);
                                map.centerAndZoom(this.myPoint, 15);
                            },
                        }
                    }
                }
            },
        
            xAxis: {
                type: 'category',
                labels: {
                  enabled: false
                },
                title: {
                    text: null
                },
            },
        
            yAxis: [
            {
                tickInterval: 100,
                lineWidth: 1,
                title: {
                    text: "Elevation (feet)"
                },
                opposite: true
            },{
                tickInterval: 100,
                lineWidth: 1,
                title: {
                    text: "Elevation (feet)"
                }
            }],
        
            tooltip: {
              snap:1,
                headerFormat: '',
                positioner: function () {
                            return { x: -220, y: 50 };
                        },                
                crosshairs: true,
                borderColor: 'black',
                shared: false,
                valueDecimals: 2,
                valueSuffix: ' ft'
            },
        
            legend: {
                enabled: false
            },
            
            series: [
            {
              name: "Surficial Aquifer Water Table",
              data: PotSurf_dps,
              color: "rgba(0,0,0)",
              type: "line",
              marker: {
                  symbol: 'url(http://maps.isgs.illinois.edu/vxs/images/WT.png)'
              },
              zIndex: 1
            },
            {
              name: "Water",
              data: Water_dps,
              color: "rgb(191,239,255)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Grayslake Peat",
              data: GP_dps,
              color: "rgb(153,155,158)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },          
            {
              name: "Cahokia",
              data: Cah_dps,
              color: "gold",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Equality Fm 1",
              data: Eqsurf_dps,
              color: "rgb(239,91,161)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Equality Fm 2",
              data: Eq_dps,
              color: "rgb(225,194,221)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Henry Fm",
              data: Hen1_dps,
              color: "rgb(255,197,65)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Haeger Mbr",
              data: Wh_dps,
              color: "rgb(60,135,50)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Beverly Tongue",
              data: Hb_dps,
              color: "rgb(229,162,21)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Beverly Tongue Fine",
              data: Hbf_dps,
              color: "rgb(156,121,35)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Yorkville Mbr",
              data: Wy_dps,
              color: "rgb(115,157,210)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Unnamed Henry Fm",
              data: Hy_dps,
              color: "rgb(255,233,184)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Tiskilwa Fm",
              data: Wt_dps,
              color: "rgb(83,171,65)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Ashmore Tongue",
              data: Ha_dps,
              color: "rgb(252,178,22)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Pearl Fm Fine",
              data: Pef_dps,
              color: "rgb(139,139,0)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Winnebago Fm",
              data: Win_dps,
              color: "rgb(216,113,161)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Winnebago Fm Sand",
              data: Wns_dps,
              color: "rgb(255,221,0)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Glasford Fm 1",
              data: G1_dps,
              color: "rgb(246,150,121)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Glasford Sand 1",
              data: GS1_dps,
              color: "rgb(255,212,142)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Glasford Sand 1 Fine",
              data: GS1f_dps,
              color: "rgb(153,207,171)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Glasford Fm 2",
              data: G2_dps,
              color: "rgb(204,126,131)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Glasford Sand 2",
              data: GS2_dps,
              color: "rgb(210,158,32)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Glasford Fm 3",
              data: G3_dps,
              color: "rgb(151,91,73)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Peddicord Fm",
              data: Ped_dps,
              color: "rgb(151,141,0)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            {
              name: "Bedrock",
              data: Bdrk_dps,
              color: "rgb(251,199,179)",
              type: myChartType,
              lineWidth: myLineThickness,
              fillOpacity: myFillOpacity,
              zIndex: 0
            },
            ]
        });  
  
            
      }
