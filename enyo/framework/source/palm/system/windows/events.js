/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
/**
	events: 
	* windowActivated
	* windowDeactivated
	* windowParamsChange
	* applicationRelaunch
*/
enyo.windows.events = {
	dispatchEvent: function(inWindow, inParams) {
		//console.log("enyo.windows.dispatchEvent: " + inWindow.name + ", " + inParams.type);
		inWindow.enyo.dispatch(inParams);
	},
	handleAppMenu: function(inWindowParams) {
		var w = enyo.windows.getActiveWindow();
		if (w && inWindowParams["palm-command"] == "open-app-menu") {
			if (w.enyo) {
				w.enyo.appMenu.toggle();
				return true;
			}
		}
	},
	handleActivated: function() {
		this.dispatchEvent(window, {type: "windowActivated"});
	},
	handleDeactivated: function() {
		enyo.appMenu.close();
		this.dispatchEvent(window, {type: "windowDeactivated"});
	},
	handleWindowHidden: function() {
		this.dispatchEvent(window, {type: "windowHidden"});
	},
	handleWindowShown: function() {
		this.dispatchEvent(window, {type: "windowShown"});
	},
	handleRelaunch: function() {
		var root = enyo.windows.getRootWindow();
		var lp = PalmSystem.launchParams;
		lp = lp && enyo.json.parse(lp);
		if (this.handleAppMenu(lp)) {
			return true;
		} else {
			enyo.windows.assignWindowParams(root, lp);
			enyo.windows.setWindowParams(root, lp);
			// FIXME: sysmgr is not focusing the app on relaunch so force it
			return this.dispatchApplicationRelaunch(root);
		}
	},
	dispatchWindowParamsChange: function(inWindow) {
		var params = inWindow.enyo.windowParams;
		var m = "windowParamsChange";
		var fn = m + "Handler";
		this.dispatchEvent(inWindow, {type: m, params: params});
		enyo.call(inWindow.enyo, fn, [params]);
	},
	dispatchApplicationRelaunch: function(inWindow) {
		var params = inWindow.enyo.windowParams;
		var m = "applicationRelaunch";
		var fn = m + "Handler";
		var event = {type: m, params: params};
		this.dispatchEvent(inWindow, event);
		var b = enyo.call(inWindow.enyo, fn, [params]);
		var c = enyo.call(enyo.application, fn, [params]);
		return Boolean(event.handler || b || c);
	}
};

//* @protected
// LunaSysMgr calls use Mojo namespace atm
Mojo = window.Mojo || {};

// LunaSysMgr calls this when the windows is maximized or opened.
Mojo.stageActivated = function() {
	enyo.windows.events.handleActivated();
};

// LunaSysMgr calls this when the windows is minimized or closed.
Mojo.stageDeactivated = function() {
	enyo.windows.events.handleDeactivated();
};

// LunaSysMgr calls this when a KeepAlive app's window is hidden
Mojo.hide = function() {
	enyo.windows.events.handleWindowHidden();
};

// LunaSysMgr calls this when a KeepAlive app's window is shown
Mojo.show = function() {
	enyo.windows.events.handleWindowShown();
};

// LunaSysMgr calls this whenever an app is "launched;" 
Mojo.relaunch = function() {
	// need to return true to tell sysmgr the relaunch succeeded.
	// otherwise, it'll try to focus the app, which will focus the first
	// opened window of an app with multiple windows.
	return enyo.windows.events.handleRelaunch();
};

// On a webOS device, Enyo will send a "lowMemory" event to the first component created.  This has a `state`
// property with the value "low", "critical", or "normal".  Applications that use significant memory
// can watch for this event and try to reduce their memory usage when they see a non-normal state.
Mojo.lowMemoryNotification = function(params) {
	enyo.dispatch({type: "lowMemory", state: params.state});
};
