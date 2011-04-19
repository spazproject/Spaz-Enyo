/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Map",
	kind: enyo.Control,
	published: {
		latitude: 37.393056,
		longitude: -122.040532,
		zoom: 14,
		mapOptions: {},
		mapTypeId: "ROADMAP", // "ROADMAP", "SATELLITE", "HYBRID", "TERRAIN"
		showMarker: true
	},
	domAttributes: {
		"enyo-pass-events": true
	},
	rendered: function() {
		this.inherited(arguments);
		enyo.MapLoader.loadGoogleScript(enyo.hitch(this, "renderMap"));
	},
	createMap: function() {
		var center = new google.maps.LatLng(this.latitude, this.longitude);
		var options = {
			zoom: this.zoom,
			center: center,
			mapTypeId: google.maps.MapTypeId[this.mapTypeId]
		}
		enyo.mixin(options, this.mapOptions);
		this.map = new google.maps.Map(this.hasNode(), options);
		this.showMarkerChanged();
	},
	destroyMap: function() {
		this.map = null;
	},
	renderMap: function() {
		this.destroyMap();
		this.createMap();
	},
	gesturestart: function(e) {
		this.map.setOptions({draggable: false});
		this.previousScale = e.scale;
	},
	gesturechange: function(e) {
		e.stop();
		var d = this.previousScale - e.scale;
		if (Math.abs(d) > 0.25) {
			var z = this.map.getZoom() + (d>0 ? -1 : +1);
			this.map.setZoom(z);
			this.previousScale = e.scale;
		}
	},
	gestureend: function(e) {
		e.stop();
		this.map.setOptions({draggable: true});
	},
	latitudeChanged: function() {
		this.latitude = Number(this.latitude);
		this.updateCenter();
	},
	longitudeChanged: function() {
		this.longitude = Number(this.longitude);
		this.updateCenter();
	},
	zoomChanged: function() {
		this.zoom = Number(this.zoom);
		if (this.map) {
			this.map.setZoom(this.zoom);
		}
	},
	mapOptionsChanged: function() {
		if (this.map) {
			this.map.setOptions(this.mapOptions);
		}
	},
	mapTypeIdChanged: function() {
		if (this.map) {
			this.map.setMapTypeId(google.maps.MapTypeId[this.mapTypeId]);
		}
	},
	showMarkerChanged: function() {
		if (this.centerMarker) {
			this.clearMarker(this.centerMarker);
		}
		this.centerMarker = (this.showMarker ? this.setMarker(this.map.getCenter()) : null);
	},
	updateCenter: function() {
		if (this.map) {
			this.map.setCenter(new google.maps.LatLng(this.latitude, this.longitude));
			this.showMarkerChanged();
		}
	},
	setMarker: function(inLatLng) {
		if (this.map) {
			return new google.maps.Marker({position: inLatLng, map: this.map});
		}
	},
	clearMarker: function(inMarker) {
		inMarker.setMap(null);
	}
});

enyo.MapLoader = {
	scriptLoadedCbs: [],
	alreadyCalled: false,
	loadGoogleScript: function(inCallback) {
		if (window["google"] && window["google"]["maps"]) {
			inCallback && inCallback();
		} else {
			this.scriptLoadedCbs.push(inCallback);
			if (!this.alreadyCalled) {
				this.alreadyCalled =  true;
				var script = document.createElement("script");
    			script.type = "text/javascript";
				script.src = "http://maps.google.com/maps/api/js?sensor=true&callback=enyo.MapLoader.scriptLoaded";
    			document.body.appendChild(script);
			}
		}
	},
	scriptLoaded: function() {
		for (var i=0, c; c=this.scriptLoadedCbs[i]; i++) {
			c();
		}
		this.scriptLoadedCbs = [];
	}
};
