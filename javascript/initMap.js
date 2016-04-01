

function initMap(){
	google.maps.event.addDomListener(window, "load", initialize);
}
function initialize() {
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 53.476822, lng: -2.255360}, 
		zoom: 6
	});

	var drawingManager = new google.maps.drawing.DrawingManager({
		drawingMode: google.maps.drawing.OverlayType.MARKER,
		drawingControl: true,
		drawingControlOptions: {
			position: google.maps.ControlPosition.TOP_CENTER,
			drawingModes: [
				google.maps.drawing.OverlayType.MARKER,
				google.maps.drawing.OverlayType.CIRCLE,
				google.maps.drawing.OverlayType.POLYGON,
				google.maps.drawing.OverlayType.POLYLINE,
				google.maps.drawing.OverlayType.RECTANGLE
			]
		},
		circleOptions: {
			fillColor: '#ffff00',
			fillOpacity: 1,
			strokeWeight: 5,
			clickable: false,
			editable: true,
			zIndex: 1
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