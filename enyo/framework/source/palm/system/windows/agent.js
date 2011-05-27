/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
/**
	Implements interacting with windows
*/
enyo.windows.agent = {
	open: function(inOpener, inUrl, inName, inAttributes, inWindowInfo) {
		// note: force an absolute url to prevent problems opening relative url's via root window on device.
		var url = enyo.makeAbsoluteUrl(window, inUrl);
		var a = inAttributes && enyo.isString(inAttributes) ? inAttributes : enyo.json.stringify(inAttributes);
		var a = "attributes=" + a;
		var i = inWindowInfo ? inWindowInfo + ", " : ""; 
		return inOpener.open(url, inName, i + a);
	},
	activate: function(inWindow) {
		if (inWindow.PalmSystem) {
			inWindow.PalmSystem.activate();
		}
	},
	deactivate: function(inWindow) {
		inWindow.PalmSystem && inWindow.PalmSystem.deactivate();
	},
	addBannerMessage: function() {
		PalmSystem.addBannerMessage.apply(PalmSystem, arguments);
	},
	removeBannerMessage: function(inId) {
		PalmSystem.removeBannerMessage.apply(removeBannerMessage, arguments);
	},
	setWindowProperties: function(inWindow, inProps) {
		inWindow.PalmSystem.setWindowProperties(inProps);
	},
	isValidWindow: function(inWindow) {
		// FIXME: adding PalmSystem check because closed is not enough when a window is immediately swiped away =(
		return Boolean(inWindow && !inWindow.closed && inWindow.PalmSystem);
	},
	isValidWindowName: function(inName) {
		return inName;
	}
}
