/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
  This control used to instantiate a PDK hybrid object within a Enyo application.
  
  In order to have mouse events passed to the hybrid plugin, you need to add your 
  own _requiresDomMousedown_ property to the control with the value true.
  
  Non-visible plugins are supported with width and height of 0.  They are still in the 
  DOM of the page, and re-rendering them will cause the plugin executable to be shutdown 
  and restarted.  The enyo.Hybrid code will automatically apply a "float: left" style to 0-size
  plugins so they don't interfere with page layout.
  
  If you use a hybrid in a non-webOS context, only the width and height properties are
  used, creating an inert object with no methods or behavior.  This is mainly useful for testing
  how the control interacts with your application layout.
 */

enyo.kind({
	name: "enyo.Hybrid",
	kind: enyo.Control,
	published: {
		/** __REQUIRED__: name of plugin executable to run */
		executable: "", 
		/** an array of strings; if provided, used as command line parameters to plugin */
		params: [], 
		/** set to true to enable premultiplied alpha-blending for plugins.  Enable if you want to blend the plugin
		    display contents with the HTML elements below it on the page.  Set to false for faster drawing. */
		alphaBlend: false, 
		/** set to true to stop plugin layer from clearing transparency information from display surface.
		    Should always be used with alphaBlend: false.  Used to allow showing video layer from
		    video tag playback through a hybrid object. */
		killTransparency: false,
		/** if true, plugin will remain alive when hidden. Useful if you're hosting this in a pane or other part of the
		    page where you don't want the plugin process to be killed and restarted later. */
		cachePlugin: false,
		/** if true, allows plugin to get focus when tapped by setting its tabIndex property */
		allowKeyboardFocus: false,
		/** height of the plugin object */
		height: 0,
		/** width of the plugin object */
		width: 0
	},
	events: {
		/** sent when the plugin has is ready to allow method calls.  This is either signaled directly by
		    remoteadapter on newer webOS builds or signaled by the plugin code using `PDL_CallJS()` to call the 
			"ready" method. */
		onPluginReady: "",
		/** sent when the plugin executable has been started and has a made a connection back to the plugin. */
		onPluginConnected: "",
		/** sent when the plugin executable has disconnected, usually due to the process ending. */
		onPluginDisconnected: ""
	},

	//* @protected
	nodeTag: "object",
	content: "",
	requiresDomMousedown: true, /* needed to get mouse events  sent into plugin */
	pluginReady: false,
	deferredCalls: [],
	deferredCallbacks: [],
	
	create: function() {
		this.inherited(arguments);

		if (this.executable === "") {
			throw("must set 'executable' on enyo.hybrid object");
		}

		/* width and height are fine for desktop debugging */
		this.widthChanged();
		this.heightChanged();

		/* use float: left to take 0-width/height control out of the flow and avoid odd layout issues */
		if (this.width === 0 || this.height === 0) {
			this.applyStyle("float", "left");
		}
		
		/* only setup runtime attributes of <object> when running on device */
		if (window.PalmSystem) {
			this.setAttribute("type", "application/x-palm-remote");
			this.setAttribute("exe", this.executable);
			this.setAttribute("alphablend", (this.alphaBlend ? "true" : "false"));
			this.setAttribute("killTransparency", (this.killTransparency ? "true" : "false"));
			this.setAttribute("x-palm-cache-plugin", (this.cachePlugin ? "true" : "false"));
			if (this.allowKeyboardFocus) {
				this.setAttribute("tabIndex", 0);
			}
			for (var paramNum = 0; paramNum < this.params.length; paramNum++) {
				this.setAttribute("param" + (paramNum + 1), this.params[paramNum]);
			}
		}
	},
	
	widthChanged: function() {
		this.setAttribute("width", this.width);
	},

	heightChanged: function() {
		this.setAttribute("height", this.height);
	},
	
	rendered: function() {
		this.inherited(arguments);
		this.pluginReady = false; // when re-rendered, we need to wait for ready again
		if (this.hasNode()) {
			// once we have a plugin node created, we can add our callback functions to it
			this.node.__PDL_PluginStatusChange__ = enyo.bind(this, this.pluginStatusChangedCallback);
			this.deferredCallbacks.forEach(function(cb) {
					this.node[cb.name] = cb.callback;
				}, this);
		}
	},

	pluginStatusChangedCallback: function(status) {
		switch (status) {
			case "ready": 
				this.pluginReadyCallback(); 
				break;
			case "connected":
				// we don't allow calls in the time between connection and ready
				this.pluginReady = false;
				this.doPluginConnected();
				break;
			case "disconnected":
				// don't allow calls into adapter once it disconnects
				this.pluginReady = false;
				this.doPluginDisconnected();
				break;
		}
	},

	pluginReadyCallback: function() {
		/* we don't send an event or set pluginReady immediately, because we don't want to trigger
		 * code that could then call functions in the plugin, as that's not allowed.  Instead, we
		 * schedule a timeout to be called immediately where we will send our event and call any
		 * deferred method calls. */
		enyo.nextTick(this, function() {
				if (this.pluginReady) { return; } /* only can go ready once per connection */
				this.pluginReady = true;
				this.doPluginReady(); /* send event to owner */

				// call any method calls that were deferred until the plugin was ready, returning 
				// the result of each to the appropriate callback
				this.deferredCalls.forEach(function (call) {
					call.callback(enyo.call(this.node, call.methodName, call.args));
					}, this);
				this.deferredCalls = [];
			});
	},
	
	//* @public

	/**
	  Call a method on the plugin with the result returned immediately to the caller.
	  The arguments to the method are supplied as arguments to this function after
	  the method name as a string.  If the hybrid plugin is not ready for calls, 
	  this will throw an exception.
	 */
	callPluginMethod: function(methodName) {
		var args = Array.prototype.slice.call(arguments, 1);
		if (this.pluginReady) {
			return this.node[methodName].apply(this.node, args);
		}
		else {
			throw("plugin not ready");
		}
	},
	
	/**
	  Call a method on the plugin with the result returned through a callback
	  function.  If the hybrid plugin is not ready for calls, this will defer the
	  call to be done after the plugin is ready.  You can pass null as the callback
	  if you don't care about the result.
	 */
	callPluginMethodDeferred: function(callback, methodName) {
		var args = Array.prototype.slice.call(arguments, 2);
		if (callback === null) {
			callback = enyo.nop;
		}
		if (this.pluginReady) {
			callback(this.node[methodName].apply(this.node, args));
		}
		else {
			this.deferredCalls.push({"callback": callback, "methodName": methodName, "args": args});
		}
	},
	
	/**
	  Add a callback function to the plugin object that can be called by `PDL_CallJS()` from the plugin.
	  _name_ is a string, the name to use for the callback method on the plugin.  _callback_ is a function that
	  will be called with "this" pointing to the actual DOM node of the plugin, so use enyo.bind to redirect it
	  to the appropriate context.  The _defer_ parameter is an optional boolean.  If true, the callback will be 
	  called asynchronously so it can make calls back into the plugin. */
	addCallback: function(name, callback, defer) {
		// defer option causes us to synthesize a function that will call the original callback after a
		// minimal delay to avoid recursive calls into the plugin
		var fn;
		if (defer) {
			fn = function() {
				var args = Array.prototype.slice.call(arguments);
				args.unshift(callback);
				args.unshift(this);
				enyo.nextTick.apply(enyo, args);
			};
		}
		else {
			fn = callback;
		}

		// if node is created, add immediately, otherwise wait until node has been added to DOM
		if (this.hasNode()) {
			this.node[name] = fn;
		}

		// also add to the deferredCallbacks list, even if we just set it, since if the plugin is
		// re-rendered, we'll need to set these up again.
		this.deferredCallbacks.push({ "name": name, "callback": fn });
	},
	
	/** tell the system to put focus on the hybrid window and show the on-screen keyboard if available */
	focus: function() {
		if (this.hasNode()) {
			this.hasNode().focus();
			// special
			if (window.PalmSystem) {
				window.PalmSystem.editorFocused(true, 0, 0);
			}
		}
	}
});
