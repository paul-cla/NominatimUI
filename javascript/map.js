var globalpolygon;

function initMap(){
	google.maps.event.addDomListener(window, "load", initialize);
}

function initialize() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 53.476822, lng: -2.255360}, 
		zoom: 6
	});

	drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.POLYGON,
		drawingControl: false,
    polygonOptions: {
      strokeWeight: 0,
      fillOpacity: 0.45,
      editable: true,
      draggable: true
    }
	});
	drawingManager.setMap(map);

	$('#search-field').keyup(function (e) {
		if (e.which == 13) {  // detect the enter key
			searchNominatim()
		}
	});

	$("#results").change(function(test){
		mapDefinition()
	});

  $(function() {
    $( "#slider" ).slider({
      max:10000,
      min:100,
      value:10000,
      change: function( event, ui ){
        document.getElementById("slider-value").value = ((1/ui.value).toFixed(4))/1;
        mapDefinition();
      }
    });
  });

  google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {

    var coordinates = (polygon.getPath().getArray());
    updatePolygonData(coordinates);
    drawingManager.setDrawingMode(null);
    globalpolygon = polygon;

    google.maps.event.addListener(polygon.getPath(), 'insert_at', function() {
      updatePolygonData(coordinates);
    });

    google.maps.event.addListener(polygon.getPath(), 'set_at', function() {
      updatePolygonData(coordinates);
    });

    google.maps.event.addListener(polygon, 'click', function (event) {
      if(confirm("Reset polygon?")){
        polygon.setMap(null);
        updatePolygonData(null);
        drawingManager.setDrawingMode("polygon");
      }
    });

    google.maps.event.addListener(polygon, 'rightclick', function(event) {
      if (event.vertex == undefined) {
        return;
      } else {
        var path = polygon.getPath();
        path.removeAt(event.vertex);
      }
    });

    google.maps.event.addListener(polygon, 'mouseover', function (event){
      console.log("mouseover shape");
      console.log(getCentreOfPolygon(polygon.getPath().getArray()));
    });

    google.maps.event.addListener(polygon, 'mouseout', function (event){
      console.log("mouse off shape");
    });

  });
}

getCentreOfPolygon = function(coordinates){
  var total=[0,0];
  coordinates.forEach(function(pair){
    total[0] += pair.lat();
    total[1] += pair.lng();
  });
  var centre = []
  centre[0] = total[0]/coordinates.length;
  centre[1] = total[1]/coordinates.length;
  return centre;
}

updatePolygonData = function(coordinates){
  document.getElementById("polygon-data").value = coordinates;
}

searchNominatim = function(){
  results = {};
  var searchTerm= $('#search-field').val()
  var country = $("#country-codes").val()
  $.ajax({
    dataType: "json",
    type: "Get",
    url: "http://nominatim.openstreetmap.org/search.php?format=json&polygon_geojson=1namedetails=1&email=slummock@gmail.com&q=" + searchTerm + "&countrycodes="+country,
    success: function (data) {
      $("#results").empty()
      $.each(data,function(index, item){
        results[item.osm_id] = item;
        $("#results").append('<option value = "'+ item.osm_id +'">'+item.display_name+'</option>')
      })
      mapDefinition()
    }
  });
}

mapDefinition = function(){
  var key = $("#results").val();
  var object = results[key];
  if(typeof nominatimArea!="undefined")
  {
    nominatimArea.setMap(null)
    map.setCenter(new google.maps.LatLng(53.476822, -2.255360))
    map.setZoom(6)
  }
  if (object.geojson != null)
    drawGeoJson(object)  
}

drawGeoJson = function(data){  
  map.data.forEach(function(feature) {
    map.data.remove(feature);
  });

  var featureCollection = JSON.parse('{"type":"FeatureCollection","features":[{"type":"Feature"}]}');
//here be dragons, need to start using require and pull in the libraries properly
  data = simplifyGeoJsonPoly(data)

  featureCollection.features[0].geometry = data.geojson;

  map.data.addGeoJson(featureCollection);
  map.data.setStyle({
    fillColor: 'green'
  });

  var boundingSw = new google.maps.LatLng(data.boundingbox[0], data.boundingbox[2]);
  var boundingNe = new google.maps.LatLng(data.boundingbox[1], data.boundingbox[3]);

  var boundingBox = new google.maps.LatLngBounds(boundingSw, boundingNe)
  map.fitBounds(boundingBox)
}
//Need to add reverse look up functionality that does a search for each zoom level 1-15(admin levels) 1 being uk, 15 being building on street
//&zoom=11
//&addressdetails=1
//http://nominatim.openstreetmap.org/reverse?format=json&osm_type=R&lat=53.479105&lon=-2.242910&zoom=10&addressdetails=1