/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.windows.browserAgent = {
	open: function(inOpener, inUrl, inName, inAttributes, inWindowInfo) { 
		// do the really good thing on browsers
		var url = enyo.makeAbsoluteUrl(window, inUrl);
		var doc = inOpener.document;
		var iframe = doc.createElement("iframe");
		iframe.src = url;
		iframe._enyoWrapperIframe = true;
		iframe.setAttribute("frameborder", 0);
		var m = (inWindowInfo || "").match(/height=(.*)($|,)/);
		var h = (m && m[1]) || (inAttributes.window == "dashboard" && 96);
		if (h) {
			iframe.style.cssText = "position:absolute; left: 0; right: 0; bottom: 0px; height: " + h + "px; width:100%";
		} else {
			iframe.style.cssText = "position:absolute; left: 0; right: 0; width:100%;height:100%;";
		}
		doc.body.appendChild(iframe);
		var w = iframe.contentWindow;
		w.name = inName;
		w.close = function() {
			this.frameElement.parentNode.removeChild(this.frameElement);
		}
		return w;
	},
	activate: function(inWindow) {
		var windows = enyo.windows.getWindows(), f;
		for (var i in windows) {
			f = windows[i].frameElement;
			if (f && f._enyoWrapperIframe) {
				f.style.display = inWindow.name == i ? "" : "none";
			}
		}
		inWindow.enyo.windows.events.handleActivated();
	},
	deactivate: function(inWindow) {
		var f = inWindow.frameElement;
		if (f) {
			f.style.zIndex = -1;
		}
		inWindow.enyo.windows.events.handleDeactivated();
	},
	addBannerMessage: function() {
		console.log("addBannerMessage", arguments);
	},
	removeBanner: function() {
		console.log("removeBanner");
	},
	isValidWindow: function(inWindow) {
		return Boolean(inWindow && !inWindow.closed);
	},
	isValidWindowName: function(inName) {
		return inName && inName.charAt(0) != "<";
	},
	asyncActivate: function() {
		enyo.asyncMethod(enyo.windows, "activateWindow", window);
	}
};

// bootstrap cross-platform windows support
enyo.requiresWindow(function() {
	// default key for app menu: CTRL + ~
	if (!window.PalmSystem) {
		enyo.dispatcher.features.push(function(e) {
			if (e.type == "keydown" && e.ctrlKey && e.keyCode == 192) {
				enyo.appMenu.toggle();
			}
		});
		// replace PalmSystem window implementation with iframe-based implementation
		enyo.mixin(enyo.windows.agent, enyo.windows.browserAgent);
		//
		// add an unload listener that can deal with activation
		window.addEventListener("unload", function() {
			enyo.windows.events.handleDeactivated();
			var p = window.parent;
			// have to yield thread before activating parent so that window becomes closed.
			// NOTE: can't call activate after a delay; probably because window is closed.
			//enyo.asyncMethod(enyo.windows, "activateWindow", window);
			p.enyo.windows.agent.asyncActivate();
		}, false);
		// add a load listener that can activate
		window.addEventListener("load", function() {
			enyo.windows.activateWindow(window);
		});
	}
});
