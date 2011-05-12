/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
enyo.windows provides a variety of utility methods for interacting with application windows.

To open a window or activate an existing window, use the enyo.windows.activate. For example,

	enyo.windows.activate("SearchWindow");

Or, to open the window if it does not exist, add a url (the url may be absolute or relative).

	enyo.windows.activate("SearchWindow", "search/index.html");

To facilitate communication between application windows, parameters can be sent.
To send parameters to the window to be activated, add a params object:

	enyo.windows.activate("SearchWindow", "search/index.html", {query: "oranges"});

Note that the activated window will fire a windowParamsChange event. The window parameters
are available in the enyo.windowParams object. For example,

	windowParamsChangeHandler: function() {
		this.$.searchQueryInput.setValue(enyo.windowParams.query);
	}

To send parameters to a window without activating it, use the setWindowParams method. For example,

	enyo.windows.setWindowParams("SearchWindow", {safeSearch: true});

When a window is activated and deactivated by the user or system, corresponding events will fire.
To respond to activation, implement the windowActivated event; for deactivation, use windowDeactivated.
For example,

	windowActivatedHandler: function() {
		this.wakeup();
	},
	windowDeactivatedHandler: function() {
		this.sleep();
	}

An application may be launched while it is already running (relaunch). By default, the 
application is simply brought into focus when this happens. This can occur either when a user
launches the running application or a system service does so. In either case, new window 
params may be sent to the application. An application can customize its response to being 
relaunched based on this information by implementing the applicationRelaunch event as follows:

	applicationRelaunchHandler: function() {
		if (enyo.windowParams.openSearchWindow = true) {
			enyo.windows.activate("SearchWindow", "search/index.html");
			return true;
		}
	}

Notice the event handler activates a window and then returns true. The return value indicates 
the event has been handled and the default action, focusing the root application window, should not occur.

The applicationRelaunch event is always sent to the root window of an application. The root window is, by default, 
the first window created by the application.

When the application is headless (specifies noWindow: true in the appinfo) the root window is always the headless, 
non-displayed window. When the application is not headless, the root window may change. This occurs if the user 
closes the root window. In this case, the root window becomes the next opened window by the application. 
That window will now receive the applicationRelaunchHandler.

Applications should be careful to consider that on the root window, enyo.windowParams are set by the system. On other
windows this object is private to the application. Applications can use the applicationRelaunch to note that 
enyo.windowParams have been changed by the system.
*/

/*
	NOTES:
	We allow opening or activating a window with params as a way to communicate with that window.
	Opening is an asynchronous process and params allow us to comm with a window without
	having to worry about that asynchronicity. Other options include: callbacks or an event.

	Alternatives: Windows could be launched by a Service. The Service would hook window.onload and
	return when this is fired. In this case passing params to a window would go away in favor of an event.
	
*/
enyo.windows = {
	//* @public
	/**
	Opens an application window. This method can also be used to open a specialized window by 
	specifying inAttributes and inWindowInfo.

	* inUrl {String} Url for the window html file. May be absolute or relative.
	* inName {String} Name of the window. This name can be used to retrieve the window.
		If one is not specified, a default name is supplied.
	* inParams {Object} Data to send to the opened window. Will be available as enyo.windowParams.
	* inAttributes {Object} Optional window attributes. Use to customize the window type.
	* inWindowInfo {String} Optional window information. Use to provide extra system info.

	Example:

		enyo.windows.openWindow("search/index.html", "Search", {query: "oranges"});

	*/
	openWindow: function(inUrl, inName, inParams, inAttributes, inWindowInfo) {
		var attributes = inAttributes || {};
		attributes.window = attributes.window || "card";
		// NOTE: make the root window open all windows.
		var root = this.getRootWindow();
		var w = this.fetchWindow(inName)
		// need a unique name before opening window
		if (w) {
			console.warn('Window "' + inName + '" already exists, activating it');
			this.activateWindow(w, inParams);
		} else {
			w = this.agent.open(root, inUrl, inName || "", attributes, inWindowInfo);
			// call finish here instead of depending on launch in case window doesn't load enyo.
			this.finishOpenWindow(w, inParams);
		}
		return w;
	},
	//* @protected
	//* @protected
	// note: called when a window is spawned via openWindow and during enyo bootstrapping.
	// this ensures our root window (not opened via openWindow) gets recorded.
	finishOpenWindow: function(inWindow, inParams) {
		inWindow.name = enyo.windows.ensureUniqueWindowName(inWindow, inWindow.name);
		this.assignWindowParams(inWindow, inParams);
		this.manager.addWindow(inWindow);
	},
	ensureUniqueWindowName: function(inWindow, inName) {
		var windows = this.getWindows();
		var w = windows[inName];
		if (this.agent.isValidWindowName(inName) && (!w || w == inWindow)) {
			return inName;
		} else {
			return this.calcUniqueWindowName();
		}
	},
	calcUniqueWindowName: function() {
		var windows = this.getWindows();
		var prefix = "window";
		for (var i=1, name; Boolean(windows[name=prefix+(i > 1 ? String(i) : "")]); i++);
			return name;
	},
	//* @public
	/**
	Opens an application dashboard.

	* inUrl {String} Url for the window html file. May be absolute or relative.
	* inName {String} Name of the window. This name can be used to retrieve the window.
	If one is not specified, a default name is supplied.
	* inParams {Object} Data to send to the opened window. Will be available as enyo.windowParams.
	* inAttributes {Object} Specify optional attributes, e.g., {webosDragMode:"manual"} to enable 
	custom handling of drag events in dashboards, or {clickableWhenLocked:true} to make dashboards 
	usable through the lock screen.
	*/
	openDashboard: function(inUrl, inName, inParams, inAttributes) {
		inAttributes = inAttributes || {};
		inAttributes.window = "dashboard";
		return this.openWindow(inUrl, inName, inParams, inAttributes);
	},
	/**
	Opens an application popup.

	* inUrl {String} Url for the window html file. May be absolute or relative.
	* inName {String} Name of the window. This name can be used to retrieve the window.
	If one is not specified, a default name is supplied.
	* inParams {Object} Data to send to the opened window. Will be available as enyo.windowParams.
	* inHeight {Integer} Height for the popup.
	* throb: {Boolean} 'true' to enable the LED throbber.
	*/
	openPopup: function(inUrl, inName, inParams, inHeight, throb) {
		var w = this.openWindow(inUrl, inName, inParams, {window: "popupalert"}, "height=" + (inHeight || 200));
		if(throb && w.PalmSystem) {
			w.PalmSystem.addNewContentIndicator();
		}
		return w;
	},
	
	//* @public
	/** 
	Activate an application window by name. If the window is not already open and a url is specified,
	the window will be opened.

	* inName {String} Name of the window to activate.
	* inUrl {String} Url for the window to open if it is not already opened. May be absolute or relative.
	* inParams {Object} Data to send to the activated window. Will be available as enyo.windowParams.
	* inAttributes {Object} Optional window attributes. Use to customize the window type.
	* inWindowInfo {String} Optional window information. Use to provide extra system info.

	Example:

		enyo.windows.activate("Search", "search/index.html", {query: "oranges"});

	*/
	activate: function(inName, inUrl, inParams, inAttributes, inWindowInfo) {
		var n = this.fetchWindow(inName);
		if (n) {
			this.activateWindow(n, inParams);
		} else if (inUrl) {
			n = this.openWindow(inUrl, inName, inParams, inAttributes, inWindowInfo);
		}
		return n;
	},
	/**
	Activate a window by window reference. Optionally send window params to the window.

	* inWindow {Object} Reference to the window to be activated.
	* inParams {Object} Optional window params to send to the window.

	Example:

		enyo.windows.activateWindow(myWindow, {message: "Hello World"});
	*/
	activateWindow: function(inWindow, inParams) {
		this.agent.activate(inWindow);
		if (inParams) {
			this.setWindowParams(inWindow, inParams);
		}
	},
	/**
		Deactivate a window by name.
	*/
	deactivate: function(inName) {
		var n = this.fetchWindow(inName);
		this.deactivateWindow(n);
	},
	/**
		Deactivate a window by reference.
	*/
	deactivateWindow: function(inWindow) {
		if (inWindow) {
			this.agent.deactivate(inWindow);
		}
	},
	//* @public
	/**
	Adds a banner message; it will be displayed briefly before disappearing
		
	* inMessage: (required) message to display
	* inJson: (required) json to pass to enyo.relaunch if banner is tapped
	* inIcon: icon to display
	* inSoundClass: sound class to play
	* inSoundPath: path to sound to play
	* inSoundDuration: duration of sound to play
	*/
	addBannerMessage: function() {
		this.agent.addBannerMessage.apply(this.agent, arguments);
	},
	/**
	Removes a banner message
		
		* inId: returned by addBannerMessage
	*/
	removeBannerMessage: function(inId) {
		this.agent.removeBannerMessage.apply(this.agent, arguments);
	},
	/**
	Send parameters to the given window. Application windows can communicate by sending window
	parameters to each other. Note, this method does not activate the window; if you 
	want to activate the window use enyo.windows.activate.

	The window specified by inWindow will fire a windowParamsChange event asynchronously which can be implemented
	to perform work related to window parameters changing.

	* inWindow {Object} Window reference.
	* inParams {Object} Parameters to send to the window. This object will be made available 
	as enyo.windowParams.  Restricted to valid JSON (no functions, cycles, etc.).
	*/
	setWindowParams: function(inWindow, inParams) {
		inWindow.postMessage("enyoWindowParams="+enyo.json.stringify(inParams), "*");
	},
	//* @protected
	// sets window params silently, no event.
	assignWindowParams: function(inWindow, inParams) {
		var params = inParams && enyo.isString(inParams) ? enyo.json.parse(inParams) : inParams || {};
		inWindow.enyo = inWindow.enyo || {};
		inWindow.enyo.windowParams = params || {};
	},
	// Note: facade public methods on manager.
	// FIXME: Revisit this decision, it may become too cumbersome.
	//* @public
	/**
	Returns a reference to the window object specified by the given name.

	The specified name must correspond to a currently opened application window, i.e.
	a window in the list returned by enyo.windows.getWindows().
	*/
	fetchWindow: function(inName) {
		return this.manager.fetchWindow(inName);
	},
	/**
	Returns the root application window.
	*/
	getRootWindow: function() {
		return this.manager.getRootWindow();
	},
	/**
	Returns an object listing the open windows by name, e.g.
	
		{window1: <window object>, window2: <window object> }
	*/
	getWindows: function() {
		return this.manager.getWindows();
	},
	/**
	Returns a reference to the window object of the currently active application window.
	*/
	getActiveWindow: function() {
		return this.manager.getActiveWindow();
	},
	/**
	Renames a window. Note that the final window name could be different than that specified, if a collision occurs
	*/
	renameWindow: function(inWindow, inName) {
		this.manager.removeWindow(inWindow);
		inWindow.name = enyo.windows.ensureUniqueWindowName(inWindow, inName);
		this.manager.addWindow(inWindow);
		return inWindow.name;
	}
}
