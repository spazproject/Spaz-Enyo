/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A map control which is a wrapper around Bing map control.

Add Bing maps script to index.html, lik this:

	<head>
		<title>Maps</title>
		<script type="text/javascript" src="http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=7.0"></script>
		...
	</head>

To initialize a Map control:

	{name: "map", kind: "Map", credentials: "my_bing_app_id"}
	
You can get a handle to the actual Bing map control uisng hasMap(), like this:

	var bingMap = this.$.map.hasMap();
	
*/
enyo.kind({
	name: "enyo.Map",
	kind: enyo.Control,
	published: {
		/**
		  The latitude of the location.
		 */
		latitude: 37.029043436050415,
		/**
		  The longitde of the location.
		 */
		longitude: -101.55550763010979,
		/**
		  The zoom level of the map view.
		 */
		zoom: 4,
		/**
		  Show a pin at the center of the current map view.
		 */
		showPin: false,
		/**
		  The map type of the map view.  Valid map types are aerial, auto, birdseye, collinsBart, mercator, ordnanceSurvey and road.
		 */
		mapType: "road",
		/**
		  Disable user interactions with the map view.
		 */
		disableInteractive: false,
		/**
		  The Bing Maps Key used to authenticate the application.
		 */
		credentials: ""
	},
	events: {
		onPinClick: "",
		onMapLoadFailure: ""
	},
	className: "enyo-map",
	//* @protected
	domAttributes: {
		"enyo-pass-events": true
	},
	rendered: function() {
		this.inherited(arguments);
		if (this.renderMap()) {
			this.disableInteractiveChanged();
			this.mapTypeChanged();
			this.updateCenter();
			this.zoomChanged();
			this.showPinChanged();
		}
	},
	destroy: function() {
		this.inherited(arguments);
		if (this.pinClickEvent) {
			Microsoft.Maps.Events.removeHandler(this.pinClickEvent);
		}
	},
	createMap: function() {
		var props = {
			credentials: this.credentials,
			showCopyright: false,
			showDashboard: false,
			disableKeyboardInput: true  // make keyboard not to popout
		};
		this.map = new Microsoft.Maps.Map(this.hasNode(), props);
	},
	destroyMap: function() {
		this.map = null;
	},
	renderMap: function() {
		this.destroyMap();
		try {
			this.createMap();
			return true;
		} catch (e) {
			this.doMapLoadFailure(e);
		}
	},
	//* @public
	/**
	  Returns the actual Bing map control.
	 */
	hasMap: function() {
		return this.map;
	},
	/**
	  Removes all entities from the map except the dropped pin and the pins in inExcludes.
	 */
	clearAll: function(inExcludes) {
		this.map.entities.clear();
		if (this.showPin && this.pin) {
			this.map.entities.push(this.pin);
		}
		if (inExcludes) {
			for (var i=0, ex; ex=inExcludes[i]; i++) {
				if (ex) {
					this.map.entities.push(ex);
				}
			}
		}
	},
	/**
	  Sets the location of the center of the map view.
	  @param {number} inLatitude The latitude of the location.
	  @param {number} inLongitude The longitude of the location.
	 */
	setCenter: function(inLatitude, inLongitude) {
		this.latitude = inLatitude;
		this.longitude = inLongitude;
		this.updateCenter();
	},
	//* @protected
	latitudeChanged: function() {
		this.latitude = Number(this.latitude);
		this.updateCenter();
	},
	longitudeChanged: function() {
		this.longitude = Number(this.longitude);
		this.updateCenter();
	},
	updateCenter: function() {
		this.centerLoc = new Microsoft.Maps.Location();
		this.centerLoc.latitude = this.latitude;
		this.centerLoc.longitude = this.longitude;
		this.map.setView({center: this.centerLoc});
	},
	zoomChanged: function() {
		this.zoom = Number(this.zoom);
		this.map.setView({zoom: this.zoom});
	},
	getZoom: function() {
		return this.map.getZoom();
	},
	showPinChanged: function() {
		if (this.showPin) {
			if (this.pin) {
				this.pin.setLocation(this.centerLoc);
			} else {
				this.pin = new Microsoft.Maps.Pushpin(this.centerLoc, {draggable: true});
				this.pinClickEvent = Microsoft.Maps.Events.addHandler(this.pin, 'click', enyo.hitch(this, "pinClick")); 
				this.pin.setOptions({icon: "images/poi_precise_location.png"});
			}
			this.map.entities.push(this.pin);
		} else {
			if (this.pin) {
				this.map.entities.remove(this.pin);
			}
		}
	},
	pinClick: function(e) {
		this.doPinClick(e);
	},
	mapTypeChanged: function() {
		var id = Microsoft.Maps.MapTypeId[this.mapType] || Microsoft.Maps.MapTypeId.road;
		this.map.setView({mapTypeId: id});
	},
	gesturestartHandler: function(inSender, e) {
		this.previousScale = e.scale;
		this.map.setOptions({disableUserInput: true});
	},
	gesturechangeHandler: function(inSender, e) {
		var d = this.previousScale - e.scale;
		if (Math.abs(d) > 0.25) {
			var z = this.map.getZoom() + (d>0 ? -1 : +1);
			this.setZoom(z);
			this.previousScale = e.scale;
		}
	},
	gestureendHandler: function(inSender, e) {
		this.map.setOptions({disableUserInput: false});
	},
	disableInteractiveChanged: function() {
		var b = this.disableInteractive;
		this.map.setOptions({
			disableTouchInput: b,
			disableUserInput: b,
			disableMouseInput: b
		})
	}
});