    var map;
    require([
        "esri/map",
        "esri/Color",
        "esri/graphic",
        "esri/InfoTemplate",

        "esri/dijit/Popup",
        "esri/layers/ArcGISDynamicMapServiceLayer",
        "esri/dijit/LayerList",  
        "esri/layers/GraphicsLayer",
        "esri/tasks/query",
        "esri/tasks/QueryTask",
        "esri/tasks/IdentifyTask",
        "esri/tasks/IdentifyParameters",
        "esri/layers/ImageParameters",
        "esri/geometry/Point", 
        "esri/geometry/Polyline", 
        "esri/graphicsUtils",
        "esri/geometry/geometryEngine",
        "esri/SpatialReference",
        "esri/layers/LayerDrawingOptions",
        "esri/symbols/SimpleFillSymbol",
        "esri/symbols/SimpleMarkerSymbol",
        "esri/symbols/SimpleLineSymbol",
        "esri/toolbars/draw",
        "esri/dijit/HomeButton",
        "esri/dijit/Search",
        "esri/dijit/Legend",
        "esri/dijit/Scalebar", 

        "esri/arcgis/utils",
        "esri/geometry/mathUtils",
        "esri/geometry/geodesicUtils",
        "esri/units",
        "esri/domUtils",
        "esri/config",

        "dojo/query",
        "dojo/_base/array",
        "dojo/_base/connect",
        "dojo/dom-construct",
        "dojo/parser",
        "dojo/dom",
        "dojo/dom-style",  
        "dojo/dom-class",  
        "dojo/dom-geometry",  
        "dojo/on",

        "dijit/Dialog",
        "dijit/registry",
        "dijit/layout/BorderContainer",
        "dijit/layout/ContentPane",
        "dijit/TitlePane",
        "dijit/form/Button",
        "dojo/domReady!"
    ], function(
        Map,
        Color,
        Graphic, 
        InfoTemplate,

        Popup,
        ArcGISDynamicMapServiceLayer,
        LayerList,
        GraphicsLayer,
        Query,
        QueryTask,
        IdentifyTask,
        IdentifyParameters,
        ImageParameters,
        Point,
        Polyline,
        graphicsUtils,
        geometryEngine, 
        SpatialReference,
        LayerDrawingOptions,
        SimpleFillSymbol,
        SimpleMarkerSymbol,
        SimpleLineSymbol, 
        Draw, 
        HomeButton,
        Search,
        Legend,
        Scalebar, 

        arcgisUtils,
        mathUtils,
        geodesicUtils,
        Units,
        domUtils,
        esriConfig, 

        query,
        array,
        connect,
        domConstruct,
        parser,
        dom, 
        domStyle, 
        domClass, 
        domGeometry, 
        on,
        Dialog,
        registry
    ) {
      
      parser.parse();
      
      //create drawTool for drawing cross sections
      var drawTool;
      var onClickFunctionMode = "Identify Surficial Features Mode";
      console.log(onClickFunctionMode);
      
      on(dom.byId("polyline"), "click", function(evt){      
        if(drawTool){
          //activate drawTool
          drawTool.activate(evt.target.id);          
          onClickFunctionMode = "Draw Virtual Cross Sections Mode";
          console.log(onClickFunctionMode);
        }
      });            

      on(dom.byId("point"), "click", function(evt){      
        if(drawTool){
          //activate drawTool
          drawTool.activate(evt.target.id);          
          onClickFunctionMode = "Draw Virtual Borehole Mode";
          console.log(onClickFunctionMode);
        }
      });            

      //set spinner options
      var opts = {
        lines: 13,
        length: 28,
        width: 5,
        radius: 42,
        scale: 1.25,
        corners: 1, 
        color: '#000',
        opacity: 0.15,
        rotate: 54,
        direction: 1,
        speed: 1.4,
        trail: 74,
        fps: 20, // Frames per second
        zIndex: 99,
        className: 'spinner',
        top: '50%',
        left: '50%',
        shadow: false,
        hwaccel: false,
        position: 'absolute'
      };
      var target = document.getElementById('spinnerDiv');
      var spinner = null;
       
      var popup = new Popup({}, domConstruct.create("div"));
 
      map = new Map("map", {
        basemap: "topo",
        //center: [-88.428, 41.938],  //Kane
        //center: [-88.0036, 42.3232],  //Lake
        center: [-88.45, 42.32],  //McHenry
        zoom: 11,
        //center: [-88.45, 42.32],  //Northeastern Illinois
        //zoom: 10,  //Northeastern Illinois
        infoWindow: popup
      });
      
      var home = new HomeButton({
        map: map
      }, "HomeButton");
      home.startup();

      var s = new Search({        
        allPlaceholder: "Search",
        autoSelect: true,
        enableSearchingAll: true,
        enableHighlight: false,
        enableLabel: false,
        enableInfoWindow: true,
        showInfoWindowOnSelect: true,
        map: map
      }, "search");

      var scalebar = new Scalebar({
          map: map,
          scalebarUnit: "dual",
          attachTo: "bottom-left"
      });
    
      map.on("load", mapReady);
      
      function mapReady(evtObj) {
        map.on("click", executeIDFeatures);
        surfIdentifyTask = new IdentifyTask(surficialGeol.url);
        surfIdentifyParams = new IdentifyParameters();
        surfIdentifyParams.tolerance = 3;
        surfIdentifyParams.returnGeometry = true;
        //surfIdentifyParams.layerIds = [0];
        surfIdentifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
        surfIdentifyParams.width = map.width;
        surfIdentifyParams.height = map.height;
        
        
        drawTool = new Draw(evtObj.map);
        drawTool.on("draw-end", doDensify);        
        
        //Grids service REST endpoint - the cross section values come from here.
        gridIdentifyTask = new IdentifyTask("http://data.isgs.illinois.edu/arcgis/rest/services/IL3D/McHenry_County_Geologic_Model/MapServer");
        gridIdentifyParams = new IdentifyParameters();
        gridIdentifyParams.tolerance = 3;
        gridIdentifyParams.returnGeometry = true;
        gridIdentifyParams.layerOption = IdentifyParameters.LAYER_OPTION_ALL;
        gridIdentifyParams.width = map.width;
        gridIdentifyParams.height = map.height;       
        
      }

      //change image format from default (png24) to png32 (for alpha channel)
      var imageParameters = new ImageParameters();
      imageParameters.format = "png32";
      //Hillshade, surficial geology, cross sections, and boreholes service REST endpoint (this map services has multiple layers - some with transparency applied)
      var surficialGeol = new ArcGISDynamicMapServiceLayer("http://data.isgs.illinois.edu/arcgis/rest/services/IL3D/McHenry_County_Geologic_Map/MapServer", {imageParameters: imageParameters, opacity: 0.7});
      
      //create graphicslayer to hold the user-drawn cross sections 
      var gLayer = new GraphicsLayer(); 
      
      //Add layers to map
      map.addLayers([surficialGeol, gLayer]);



      //Create LayersList
      var layerList = new LayerList({
        map: map,
        layers: [{
          layer: surficialGeol,
          id: 'Surficial Geology',
          subLayers: true
        }],
        showLegend: true,
        showSubLayers: true,
        showOpacitySlider: true
      },"layersDiv");
      
      layerList.startup();

      function executeIDFeatures(event) {
        if (onClickFunctionMode == "Identify Surficial Features Mode"){
          surfIdentifyParams.geometry = event.mapPoint;
          surfIdentifyParams.mapExtent = map.extent;
  
          var deferred = surfIdentifyTask
            .execute(surfIdentifyParams)
            .addCallback(function (response) {
              // response is an array of identify result objects
              // This returns an array of features
              return array.map(response, function (result) {
                var feature = result.feature;
                var layerName = result.layerName;
                feature.geometry.spatialReference = this.map.spatialReference;
  
                var myAttributes = '';
                for (var key in feature.attributes) {
                  if (feature.attributes.hasOwnProperty(key)) {
                    if (feature.attributes[key] === ""){
                      myAttributes += "";
                    }                
                    else if (key === "OBJECTID" || key === "OBJECTID_1" || key === "SHAPE" || key === "AREA" || key === "PERIMETER" || key === "Shape" || 
                             key === "SHAPE_Length" || key === "SHAPE_Area" || key === "Shape_Area" || key === "Shape_Length"){
                      myAttributes += "";
                    }
                    else if (key === "USGS_LINK" || key === "Graphic Log" || key === "ILSTRAT"){
                      myAttributes += "";
                    }
                    else if (key === "Thickness Unit"){
                      myAttributes += "";
                    }
                    else if (key === "Maximum Thickness"){
                      myAttributes += "";
                    }
                    else if (key === "Minimum Thickness"){
                      myAttributes += "";
                    }
                    else if (key === "Geo Unit Name"){
                      myAttributes += '<b>' + key + "</b>:  " + "<a target='_blank' href='" + feature.attributes["ILSTRAT"] + "'>" + feature.attributes["Geo Unit Name"] + "</a><br>";
                    }
                    else if (key === "Publication ID"){
                      var pubURL = "https://www.isgs.illinois.edu/maps/county-maps/surficial-geology/kane";
                      myAttributes += '<b>' + key + "</b>:  " + "<a target='_blank' href='" + pubURL + "'>" + feature.attributes["Publication ID"] + "</a><br>";
                    }
                    else if (key === "Cross Section File Name"){
                      var gLogURL = "http://maps.isgs.illinois.edu/vxs/mchenry/xs/" + feature.attributes[key] + ".pdf";
                      myAttributes += '<b>' + "Cross Section Name" + "</b>:  " + "<a target='_blank' href='" + gLogURL + "'>" + feature.attributes[key] + "</a><br>";
                    }
                    else if (key === "Borehole ID"){
											if (feature.attributes["Graphic Log"] !== ""){
                        var gLogURL = "http://maps.isgs.illinois.edu/vxs/mchenry/logs/" + feature.attributes["Graphic Log"] + ".pdf";
                        myAttributes += '<b>' + key + "</b>:  " + "<a target='_blank' href='" + gLogURL + "'>" + feature.attributes["Graphic Log"] + "</a><br>";											  
											}
											else{
											  myAttributes += "";
											}
                    }
                    else if (key === "XsecFileName"){
                      var gLogURL = "http://maps.isgs.illinois.edu/vxs/mchenry/xs/" + feature.attributes[key] + ".pdf";
                      myAttributes += '<b>' + "Cross Section Name" + "</b>:  " + "<a target='_blank' href='" + gLogURL + "'>" + feature.attributes[key] + "</a><br>";
                    }
                    else if (key === "USGS Realtime Observation Network"){
											if (feature.attributes[key] !== ""){
												myAttributes += "<a target='_blank' href='" + feature.attributes[key] + "' class='ext'>" + key + "<span class='ext'></span></a><br>";
											}else{
											  myAttributes += "";
											}
                    }
                    else{                  
                      myAttributes += '<b>' + key + "</b>:  " + feature.attributes[key] + "<br />";
                    }
                  }
                }
								var myTemplate = new InfoTemplate(layerName, myAttributes);
								feature.setInfoTemplate(myTemplate);
								
                return feature;
              });
            });
  
          map.infoWindow.setFeatures([deferred]);
          map.infoWindow.show(event.mapPoint);
        }
      }

      //zoom to extent of user-drawn cross section
      on(dom.byId("zoomXS"), "click", function(){
        var extGraphics = graphicsUtils.graphicsExtent(gLayer.graphics);
        map.setExtent(extGraphics.expand(1), true);
      }); 
            
      //click handler for clearing the graphics and closing the bottom pane
      on(dom.byId("closeXS"), "click", function(){
        clearDataPointObjects();
        map.graphics.clear();
        gLayer.clear();
        dom.byId("closeXS").style.display = "none";        
        dom.byId("XSPane").style.display = "none";
        dom.byId("chartContainer").style.display = "none";
        dom.byId("zoomXS").style.display = "none";        
        
        domStyle.set(registry.byId("bottomPane").domNode, "height", "0px");  
        registry.byId('mainWindow').resize();  
        
      });      

//---------------Begin cross section profile generation----------------------------------------------------------------------------------------------------------------
      var formationLayer = new GridLayer();      
      
      var resultPixels;
      var resultMiles;
      var resultMeters;
      var resultMilesRound;
      
      //create symbol that will appear on the map when user hovers over a location on the cross section profile            
      var ptSymbol = new SimpleMarkerSymbol({
        "color":[0,255,0,0],
        "size":12,
        "angle":0,
        "xoffset":0,
        "yoffset":0,
        "type":"esriSMS",
        "style":"esriSMSX",
        "outline":{
          "color":[255,0,0,255],
          "width":2,
          "type":"esriSLS",
          "style":"esriSLSSolid"}});
      
      //create identify tasks and parameter objects
      var gridIdentifyTask, gridIdentifyParams;    //task for identify task on grid layers
      var surfIdentifyTask, surfIdentifyParams;  //task for identify task on surficial geology, cross section lines, and borings layers
      
      function GridLayer(name, top, bottom, thickness) {
          this.name = name;
          this.top = top;
          this.bottom = bottom;
          this.thickness = thickness;
      }
      
      function doDensify(evtObj) {
        //deactivate drawTool
        drawTool.deactivate();  
        
        //switch click function back to identifying surficial features
        map.on("click", executeIDFeatures);  
        onClickFunctionMode = "Identify Surficial Features Mode";
        console.log(onClickFunctionMode);
        
        //clear out data from last cross section
        clearDataPointObjects();
        
        if (evtObj.geometry.type == "polyline"){

          var symbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new Color([255,0,0]), 1);  //dashed red line
  
          //create graphic for cross section line and then show the graphic on the map
          var myLine = new Graphic(evtObj.geometry, symbol);
          gLayer.clear();  //clears old graphic
          gLayer.add(myLine);  //add to graphics layer
  
          resultMiles = geometryEngine.geodesicLength(evtObj.geometry, "miles");
          //console.log(resultMiles + " miles");
          resultMeters = geometryEngine.geodesicLength(evtObj.geometry, "meters");        
          //console.log(resultMeters + " meters");
          resultPixels = (resultMiles * 72);
          //console.log(resultPixels + " pixels");
          resultMilesRound = Math.round(resultMiles*100)/100;
          
          //TO-DO:  insert code to get the inflection points and their lat long along the cross section line.         
          
          //Densify geometry by plotting points between existing vertices.  Usage:  densify(geometry, maxSegmentLength, maxSegmentLengthUnit).  
          //See https://developers.arcgis.com/javascript/3/jsapi/esri.geometry.geometryengine-amd.html#densify  for more information.       
              
          //var densifiedXSLine = geometryEngine.densify(evtObj.geometry, 660, "feet");  //Kane County maxSegmentLength        
          var densifiedXSLine = geometryEngine.densify(evtObj.geometry, 50, "meters");  //McHenry County and Lake County maxSegmentLength        
          showDensify([densifiedXSLine]);
            
        }
        else{
          
          //alert("you just drew a point!");
          
          var mp =  new Point(evtObj.geometry.x, evtObj.geometry.y, map.spatialReference);         
          executeBoreholeIdentify(mp);
        }
        
        if (!dom.byId("XSPane")._showing){
          console.log("You made it to the if!");
          //dom.byId("XSPane").toggle(); 
          dom.byId("XSPane").style.display = "block";
          dom.byId("closeXS").style.display = "block";
          
          domStyle.set(registry.byId("bottomPane").domNode, "height", "362px");  
          registry.byId('mainWindow').resize();                                  
        }        


        //start spinner while waiting from cross section profile information is being processed
        if(spinner == null) {
          spinner = new Spinner(opts).spin(target);
        } else {
          spinner.spin(spinnerDiv);
        }        
        
      }
      
      var myDialog = new Dialog({
        title: "Virtual Borehole",
        style: "width: 300px"
      });

      //this function takes the densified XS line vertices and then uses each one as input for an Identify Task
      function showDensify(densifiedXSLine) {     
        array.forEach(densifiedXSLine, function(geometry) {//there is only one densified geometry, our line
          var vertices = densifiedXSLine[0].paths[0]; //get array of points in the line      
          var totVertices = vertices.length;
          //loop through vertices so that each one can be used for the Identify Task
          for (j=0; j < totVertices; j++){
            var mp = new Point(vertices[j][0], vertices[j][1], map.spatialReference);
            var dist = resultMiles/totVertices * j;
            //map.graphics.add(new Graphic(mp, new SimpleMarkerSymbol().setColor(new Color([255,0,0,0.5]))));  //use this to draw a graphic marker for each point
            
            //mp is the geographic point, 
            //j is the position along the line, 
            //dist is the accumulated distance along the line, and 
            //vertices.length
            executeIdentifyTask(mp, j, dist, totVertices);  
          }        
                          
        });        
      }
      
      
      function executeBoreholeIdentify(mp) {
        gridIdentifyParams.geometry = mp;
        gridIdentifyParams.mapExtent = map.extent;
        dist = 1;
               
        gridIdentifyTask.execute(gridIdentifyParams, function(response) {                   
          dojo.forEach(response, function(result) {  //this code will execute 49 times for each point      
            //each execution in this loop gets a layername and a pixel value.
            //each execution the reusable formationLayer object gets its name assigned and the pixel value assigned to either the top or the bottom
                  
            var formArray = result.layerName.split("_");  //split the array on the underscore, e.g., Bdrk_B would be split into Bdrk and B meaning bedrock and bottom
            formationLayer.name = formArray[0]; //Bdrk, GP, Cah, Eqsurf, Potent, etc...
            var formBTTH = formArray[1]; //B, T, or Surf
              
            if (result.feature.attributes["Pixel Value"] != "NoData") {
              var formFeet = parseFloat(result.feature.attributes["Pixel Value"]);
            }
            else{  //make all "NoData" values null because CanvasJS needs them to be null to draw the graph correctly
              var formFeet = null;
            }

            //once Potentiometric surface is encountered, put data into potentiometric surface array
            //if (formationLayer.name === "Potent"){
            //  PotSurf_dps.push({x: dist, y: formFeet, myPoint: mp});           
            //}                                                                  

            //when a B (bottom) is encountered or T (top)
            if (formBTTH === "B"){
              formationLayer.bottom = formFeet;  
            }
            else if (formBTTH === "T"){
              formationLayer.top = formFeet;   
            }
            
            
            if (formationLayer.top > 0 && formationLayer.bottom > 0 || formationLayer.top === null && formationLayer.bottom === null){  //don't draw borehole layer until all of the values have been aggregated
              formationLayer.thickness = formationLayer.top - formationLayer.bottom;
                           
              switch (formationLayer.name) {
                case "Water":
                  Water_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "GP":
                  GP_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Cah":
                  Cah_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Eqsurf":
                  Eqsurf_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Eq":
                  Eq_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Hen1":
                  Hen1_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Wh":
                  Wh_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "G1":
                  G1_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "G2":
                  G2_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "G3":
                  G3_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "GS1f":
                  GS1f_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "GS1":
                  GS1_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "GS2":
                  GS2_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Ha":
                  Ha_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Hbf":
                  Hbf_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Hb":
                  Hb_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Hy":
                  Hy_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Pef":
                  Pef_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Ped":
                  Ped_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Win":
                  Win_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Wns":
                  Wns_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Wt":
                  Wt_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Wy":
                  Wy_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Bdrk":                  
                  //Bdrk_dps.push({x: dist, y: [formationLayer.bottom, formationLayer.top] });
                  Bdrk_dps.push({x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
              }
              formationLayer.bottom = formationLayer.top = formationLayer.thickness = 0;  //reset values of formationLayer              
            }
          }); 
          
            
            //stop spinner
            spinner.stop(spinnerDiv);
            
            //display chart container, and xs extent zoom button
            domStyle.set(registry.byId("bottomPane").domNode, "height", "362px");  
            registry.byId('mainWindow').resize(); 
             
            dom.byId("closeXS").style.display = "block";
            dom.byId("XSPane").style.display = "block";
            dom.byId("chartContainer").style.display = "block";
            //dom.byId("zoomXS").style.display = "block";
            myChartType = 'columnrange';
            drawBorehole(resultPixels, ptSymbol, mp); 

            console.log("Cross section length is " + resultPixels + " in pixels.");
        });         
      }

      function executeIdentifyTask(mp, j, dist, totVertices) {
        gridIdentifyParams.geometry = mp;
        gridIdentifyParams.mapExtent = map.extent;
               
        gridIdentifyTask.execute(gridIdentifyParams, function(response) {                   
          dojo.forEach(response, function(result) {  //this code will execute 49 times for each point      
            //each execution in this loop gets a layername and a pixel value.
            //each execution the reusable formationLayer object gets its name assigned and the pixel value assigned to either the top or the bottom
                  
            var formArray = result.layerName.split("_");  //split the array on the underscore, e.g., Bdrk_B would be split into Bdrk and B meaning bedrock and bottom
            formationLayer.name = formArray[0]; //Bdrk, GP, Cah, Eqsurf, Potent, etc...
            var formBTTH = formArray[1]; //B, T, or Surf
              
            if (result.feature.attributes["Pixel Value"] != "NoData") {
              var formFeet = parseFloat(result.feature.attributes["Pixel Value"]);
            }
            else{  //make all "NoData" values null because CanvasJS needs them to be null to draw the graph correctly
              var formFeet = null;
            }

            //once Potentiometric surface is encountered, put data into potentiometric surface array
            //if (formationLayer.name === "Potent"){
            //  PotSurf_dps.splice(j,0,{x: dist, y: formFeet, myPoint: mp});           
            //}                                                                  

            //when a B (bottom) is encountered or T (top)
            if (formBTTH === "B"){
              formationLayer.bottom = formFeet;  
            }
            else if (formBTTH === "T"){
              formationLayer.top = formFeet;   
            }
            
            
            if (formationLayer.top > 0 && formationLayer.bottom > 0 || formationLayer.top === null && formationLayer.bottom === null){  //don't draw borehole layer until all of the values have been aggregated
              formationLayer.thickness = formationLayer.top - formationLayer.bottom;
                           
              switch (formationLayer.name) {
                case "Water":
                  Water_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "GP":
                  GP_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Cah":
                  Cah_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Eqsurf":
                  Eqsurf_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Eq":
                  Eq_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Hen1":
                  Hen1_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Wh":
                  Wh_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "G1":
                  G1_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "G2":
                  G2_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "G3":
                  G3_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "GS1f":
                  GS1f_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "GS1":
                  GS1_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "GS2":
                  GS2_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Ha":
                  Ha_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Hbf":
                  Hbf_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Hb":
                  Hb_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Hy":
                  Hy_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Pef":
                  Pef_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Ped":
                  Ped_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Win":
                  Win_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Wns":
                  Wns_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Wt":
                  Wt_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Wy":
                  Wy_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
                case "Bdrk":                  
                  //Bdrk_dps.push({x: dist, y: [formationLayer.bottom, formationLayer.top] });
                  Bdrk_dps.splice(j,0,{x: dist, low: formationLayer.bottom, high: formationLayer.top, myPoint: mp});
                  break;
              }
              formationLayer.bottom = formationLayer.top = formationLayer.thickness = 0;  //reset values of formationLayer              
            }
          }); 
          
          if (j === (totVertices-1)){
            
            //stop spinner
            spinner.stop(spinnerDiv);
            
            //display chart container, and xs extent zoom button
            domStyle.set(registry.byId("bottomPane").domNode, "height", "362px");  
            registry.byId('mainWindow').resize(); 
             
            dom.byId("closeXS").style.display = "block";
            dom.byId("XSPane").style.display = "block";
            dom.byId("chartContainer").style.display = "block";
            dom.byId("zoomXS").style.display = "block";
            myChartType = 'arearange';
            drawCrossSection(resultPixels, ptSymbol); 

            console.log("Cross section length is " + resultPixels + " in pixels.");
          }                          
        });         
      }



    });
    
