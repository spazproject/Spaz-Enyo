/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
if (window.PalmSystem) {
	// add webOS-specific gesture features
	enyo.dispatcher.features.push(
		function(e) {
			if (enyo.webosGesture[e.type]) {
				enyo.webosGesture[e.type](e);
			}
		}
	);

	enyo.webosGesture = {
		mousedown: function(e) {
			// need to cache the target because the gesture events are missing this info
			this.lastDownTarget = e.target;
		}
		// NOTE: 'back' event is synthesized from ESC key on all platforms in core/Gesture.js
	};

	// FIXME: LunaSysMgr callbacks still use Mojo namespace.
	Mojo = window.Mojo || {};

	Mojo.handleGesture = function(type, properties) {
		var synth = enyo.mixin({type: type, target: enyo.webosGesture.lastDownTarget}, properties);
		enyo.dispatch(synth);
	};

	// NOTE: we are generating the event for orientation change by watching window.resize since
	// this method is not called on dartfish. However, it is called in catfish and sysmgr
	// generates an error if this function does not exist!
	Mojo.screenOrientationChanged = function() {};

	enyo.requiresWindow(function() {
		// add gesture event suppport
		document.addEventListener("gesturestart", enyo.dispatch);
		document.addEventListener("gesturechange", enyo.dispatch);
		document.addEventListener("gestureend", enyo.dispatch);
	});
} else {
	// thunk for device-only profiler API
	webosEvent = {
		event: enyo.nop,
		start: enyo.nop,
		stop: enyo.nop
	};
}