var Circle = null;
var StartPosition=0;
var Marker=null;
function DrawCircle(Map, Center, Radius,marker,options) {
    StartPosition=Center;
    Marker=marker;
    Map=Map;
    if(Radius > 0) {
        Radius *= 1609.344;
        Circle = new google.maps.Circle({
            center: Center,
            radius: Radius,
            strokeColor: "#0000FF",
            strokeOpacity: 0.35,
            strokeWeight: 2,
            fillColor: "#0000FF",
            fillOpacity: 0.20,
            map: Map
        });
    }
}

function SetPosition(Location, Viewport) {
    //Marker.setPosition(Location);
    if(Viewport){
        Map.fitBounds(Viewport);
        Map.setZoom(map.getZoom() + 2);
    }
    else {
        Map.panTo(Location);
    }
    Radius = $("#radius").val();
    DrawCircle(Map, Location, Radius);
    $("#latitude").val(Location.lat().toFixed(5));
    $("#longitude").val(Location.lng().toFixed(5));
}

//var MapView = $("#map-canvas");
//var Map = new google.maps.Map(MapView.get(0), options);


google.maps.event.addListener(Marker, "dragend", function(event) {
    //SetPosition(Marker.position);
});

$("#radius").keyup(function(){
    google.maps.event.trigger(Marker, "dragend");
});





