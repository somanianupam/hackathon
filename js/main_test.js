var Map;
var myMap = function() {

	var options = {
		zoom: 4,
		center: new google.maps.LatLng(38.810821, -95.053711),
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		radius: 500,    // metres
		fillColor: "#00AA00",
		strokeColor: '#3D9912'
	}

	/*
		Load the map
		@param object settings (configuration options for map)
		@return undefined
	*/
	function init(settings) {
		map = new google.maps.Map(document.getElementById( settings.idSelector ), options);
		markerLocation = settings.markerLocation;
		Map=map;

		loadMarkers();
	}

	/*
		=======
		MARKERS
		=======
	*/
	markers = {};
	markerList = [];

	/*
		Load markers onto the Google Map from a provided array or demo userData (data.js)
		@param array personList [optional] (list of people to load)
		@return undefined
	*/
	function loadMarkers(personList) {

		// optional argument of person
		var people = ( typeof personList !== 'undefined' ) ? personList : userData;

		var j = 1;

		for( i=0; i < people.length; i++ ) {
			var person = people[i];

			// if its already on the map, dont put it there again
			if( markerList.indexOf(person.id) !== -1 ) continue;

			var lat = person.lat,
				lng = person.lng,
				markerId = person.id;

			var infoWindow = new google.maps.InfoWindow({
				maxWidth: 400
			});




			var marker = new google.maps.Marker({
				position: new google.maps.LatLng( lat, lng ),
				title: person.name,
				markerId: markerId,
				icon: markerLocation,
				map: map,
				draggable: true
			});

			DrawCircle(map, options.center, options.radius,marker,options);
			//SetPosition(marker.position,map);
			markers[markerId] = marker;
			markerList.push(person.id);

			if( j > 10 ) j = 1; // for the thumbnail image
			var content = ['<div class="iw"><img src="./img/OLX_Logo.jpg',
				, '" width="90" height="90">', '<div class="iw-text"><strong>', person.name,
				'</strong><br>Address: ', person.address,'<br>Mobile: ',person.phone,
				'<br>Category: ', person.category, '</div></div>'].join('');
			j++;


			google.maps.event.addListener(marker, 'click', (function (marker, content) {
				return function() {
					infoWindow.setContent(content);
					infoWindow.open(map, marker);
				}
			})(marker, content));

		}
	}

	/*
		Remove marker from map and our list of current markers
		@param int id (id of the marker element)
		@return undefined
	*/
	function removePersonMarker(id) {
		if( markers[id] ) {
			markers[id].setMap(null);
			loc = markerList.indexOf(id);
			if (loc > -1) markerList.splice(loc, 1);
			delete markers[id];
		}
	}

	/*
		======
		FILTER
		======
	*/

	// default all filters off
	var filter = {
		location: 0,
		category: 0,
		from: 0
	}
	var filterMap;

	/*
		Helper function
		@param array a (array of arrays)
		@return array (common elements from all arrays)
	*/
	function reduceArray(a) {
		r = a.shift().reduce(function(res, v) {
			if (res.indexOf(v) === -1 && a.every(function(a) {
				return a.indexOf(v) !== -1;
			})) res.push(v);
			return res;
		}, []);
		return r;
	}

	/*
		Helper function
		@param string n
		@return bool
	*/
	function isInt(n) {
	    return n % 1 === 0;
	}


	/*
		Decides which filter function to call and stacks all filters together
		@param string filterType (the property that will be filtered upon)
		@param string value (selected filter value)
		@return undefined
	*/
	function filterCtrl(filterType, value) {
		// result array
		var results = [];

		if( isInt(value) ) {
			filter[filterType] = parseInt(value);
		} else {
			filter[filterType] = value;
		}
		
		for( k in filter ) {
			if( !filter.hasOwnProperty(k) && !( filter[k] !== 0 ) ) {
				// all the filters are off
				loadMarkers();
				return false;
			} else if ( filter[k] !== 0 ) {
				// call filterMap function and append to r array
				results.push( filterMap[k]( filter[k] ) );
			} else {
				// fail silently
			}
		}

		if( filter[filterType] === 0 ) results.push( userData );
		
		/*
			if there is 1 array (1 filter applied) set it,
			else find markers that are common to every results array (pass every filter)
		*/
		if( results.length === 1 ) {
			results = results[0];
		} else {
			results = reduceArray( results );
		}
		
		loadMarkers( results );

	}
	
	/* 
		The keys in this need to be mapped 1-to-1 with the keys in the filter variable.
	*/
	filterMap = {
		location: function( value ) {
			return filterByLocation('lat','lng', value);
		},

		category: function( value ) {
			return filterByString('category', value);
		},

		from: function( value ) {
			return filterByString('from', value);
		}
	}

	/*
		Filters marker data based upon a string match
		@param string dataProperty (the key that will be filtered upon)
		@param string value (selected filter value)
		@return array (people that made it through the filter)
	*/
	function filterByString( dataProperty, value ) {
		var people = [];

		for( var i=0; i < userData.length; i++ ) {
			var person = userData[i];
			if( person[dataProperty] == value ) {
				people.push( person );
			} else {
				removePersonMarker( person.id );
			}
		}
		return people;
	}

	/*
		Filters out integers that are under the provided value
		@param string dataProperty (the key that will be filtered upon)
		@param int value (selected filter value)
		@return array (people that made it through the filter)
	*/
	function filterByLocation( dataPropertyLat,dataPropertyLong, value ) {
			var people = [];

			for( var i=0; i < userData.length; i++ ) {
				var person = userData[i];
				if(person[dataPropertyLat] >= value.latitude && person[dataPropertyLong] >= value.longitude) {
					people.push( person )
				} else {
					removePersonMarker( person.id );
				}
			}
			return people;
	}

	// Takes all the filters off
	function resetFilter() {
		filter = {
			followers: 0,
			college: 0,
			from: 0
		}
	}

	return {
		init: init,
		loadMarkers: loadMarkers,
		filterCtrl: filterCtrl,
		resetFilter: resetFilter
	};
}();


$(function() {

	var mapConfig = {
		idSelector: 'map-canvas',
		markerLocation: 'img/red-fat-marker.png',
		radius:300,
		color: '#00AA00'
	}

	myMap.init( mapConfig );

	$('.load-btn').on('click', function() {
		var $this = $(this);
		// reset everything
		$('select').val(0);
		myMap.resetFilter();
		myMap.loadMarkers();

		if( $this.hasClass('is-success') ) {
			$this.removeClass('is-success').addClass('is-default');
		}
	});

	$('.location-select').on('click', function() {
		var longitude=$("#longitude").val();
		var latitude=$("#latitude").val();
		var location ={
			longitude:longitude,
			latitude:latitude
		}
		myMap.filterCtrl('location',location);
	});

	$('.category-select').on('change', function() {
		myMap.filterCtrl('category', this.value);
	});

	$('.from-select').on('change', function() {
		myMap.filterCtrl('from', this.value);
	});
});





