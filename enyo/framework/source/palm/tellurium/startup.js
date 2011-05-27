/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
// Load Telurium nub
enyo.requiresWindow(function() {
	if (window.PalmSystem) {
		window.addEventListener('load', function() {
			Tellurium.setup(window.enyo);
			console.log("Tellurium loading...");
		}, false);
	}
});