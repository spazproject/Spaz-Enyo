/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.windows.manager = {
	getRootWindow: function() {
		return window.opener || window.rootWindow || window.top || window;
	},
	// return a list of valid (still existing) windows.
	getWindows: function() {
		var app = this.getRootWindow();
		var am = app.enyo.windows.manager;
		var windows = am._windowList;
		// note: check for validity of window since we do not know if a spawned
		// windows that does not load enyo has been closed.
		var validWindows = {};
		for (var i in windows) {
			if (this.isValidWindow(windows[i])) {
				validWindows[i] = windows[i];
			}
		}
		am._windowList = validWindows;
		return validWindows;
	},
	//* @protected
	_windowList: {},
	isValidWindow: function(inWindow) {
		return enyo.windows.agent.isValidWindow(inWindow);
	},
	addWindow: function(inWindow) {
		var windows = this.getWindows();
		windows[inWindow.name] = inWindow;
	},
	removeWindow: function(inWindow) {
		var windows = this.getWindows();
		delete windows[inWindow.name];
	},
	fetchWindow: function(inName) {
		var windows = this.getWindows();
		return windows[inName];
	},
	getActiveWindow: function() {
		var list = this.getWindows(), w;
		for (var i in list) {
			w = list[i];
			if (w.PalmSystem.isActivated) {
				return w;
			}
		}
	},
	// If the root application window is closed,
	// we transfer manager info to a new root window.
	resetRootWindow: function(inOldRoot) {
		var list = this.getWindows(), w;
		// find new root window
		var root = this.findRootableWindow(list);
		if (root) {
			this.transferRootToWindow(root, inOldRoot);
			for (var i in list) {
				w = list[i];
				// set window.rootWindow so getRootWindow can return it.
				w.rootWindow = w == root ? null : root;
				// repair enyo.application
				this.setupApplication(w);
			}
		}
	},
	findRootableWindow: function(inWindowList) {
		var w;
		for (var i in inWindowList) {
			w = inWindowList[i];
			if (w.enyo && w.enyo.windows) {
				return inWindowList[i];
			}
		}
	},
	// make sure a given window can access the enyo.application object
	setupApplication: function(inWindow) {
		var we = inWindow.enyo;
		we.application = (we.windows.getRootWindow().enyo || we).application || {};
	},
	transferRootToWindow: function(inWindow, inOldRoot) {
		var wm = inWindow.enyo.windows.manager;
		var rm = inOldRoot.enyo.windows.manager;
		wm._windowList = enyo.clone(rm._windowList);
		wm._activeWindow = rm._activeWindow;
	},
	// if the app window is closed, automatically reset one of the open windows to the app window.
	addUnloadListener: function() {
		window.addEventListener('unload', enyo.hitch(this, function() {
			this.removeWindow(window);
			if (this.getRootWindow() == window) {
				this.resetRootWindow(window);
			}
		}), false);
	},
	// hook load so we can send a windowParamsChange event after the
	// main enyo component is created so that it can process the event.
	// We do this so there is 1 place to respond to windowParamsChange.
	// NOTE: enyo.windowParams is set before this, so an application can
	// respond to it in create.
	addLoadListener: function() {
		window.addEventListener('load', function() {
			enyo.windows.events.dispatchWindowParamsChange(window);
		}, false);
	},
	// Handle message events to update window params.
	addMessageListener: function() {
		window.addEventListener('message', function(e) {
			var label = "enyoWindowParams=";
			if(e.data.indexOf(label) === 0) {
				enyo.windows.assignWindowParams(window, e.data.slice(label.length));
				enyo.windows.events.dispatchWindowParamsChange(window);
			}
		}, false);
	}
};

// Setup windows api during enyo boot process:
enyo.requiresWindow(function() {
	// Assign windowParams.
	var params = enyo.windowParams || (window.PalmSystem && PalmSystem.launchParams);
	if(!params && enyo.args.enyoWindowParams) {
		params = decodeURIComponent(enyo.args.enyoWindowParams);
	}
	enyo.windows.finishOpenWindow(window, params);
	//
	// Hookup manager to load and unload.
	var m = enyo.windows.manager;
	m.addUnloadListener();
	m.addLoadListener();
	m.addMessageListener();
	//
	// Establish enyo.application reference
	m.setupApplication(window);
});