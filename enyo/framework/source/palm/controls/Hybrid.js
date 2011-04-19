/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
  This control used to instantiate a PDK hybrid object within a Enyo application.
  
  In order to have mouse events passed to the hybrid plugin, you need to add your 
  own _requiresDomMousedown_ property to the control with the value true.
  
  If you want to call methods on the plugin, you must call `PDL_CallJS()` from your PDK code
  with a "ready" method name after initialization of the methods and the call to 
  `PDL_JSRegistrationComplete()`.  You can change the name of that callback by modifying the 
  _readyCallbackName_ property.
  
  Non-visible plugins are supported with width and height of 0.  They are still in the 
  DOM of the page, and re-rendering them will cause the plugin executable to be shutdown 
  and restarted.
 */

enyo.kind({
	name: "enyo.Hybrid",
	kind: enyo.Control,
	published: {
		/** __REQUIRED__: name of plugin executable to run */
		executable: "", 
		/** an array of strings; if provided, used as command line parameters to plugin */
		params: [], 
		/** set to true to enable alpha-blending for displayed plugins */
		alphaBlend: false, 
		/** height of the plugin object */
		height: 0,
		/** width of the plugin object */
		width: 0,
		/** name of callback to set on plugin object that will signal that it's ready for use */
		readyCallbackName: "ready"
	},
	events: {
		/** sent when the plugin has used `PDL_CallJS()` to call the "ready" method letting you know
		    that it is ready to allow method calls. */
		onPluginReady: ""
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

		/* only setup attributes of <object> when running on device */
		if (window.PalmSystem) {
			this.setAttribute("type", "application/x-palm-remote");
			this.widthChanged();
			this.heightChanged();

			// setup param tags that name the plugin executable and any command-line parameters
			this.content = "<param name='exe' value='" + this.executable + "'>";
			this.content += "<param name='alphablend' value='" + (this.alphaBlend ? "true" : "false") + "'>";
			var paramNum = 1;
			this.params.forEach(enyo.bind(this, function(p) {
					// FIXME: need to escape single quotes in p
					this.content += "<param name='param" + (paramNum++) + "' value='" + p + "'>";
				}));
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
		if (this.hasNode()) {
			// once we have a plugin node created, we can add our callback functions to it
			this.node[this.readyCallbackName] = enyo.bind(this, this.pluginReadyCallback);
			this.deferredCallbacks.forEach(function(cb) {
					this.node[cb.name] = cb.callback;
				}, this);
			this.deferredCallbacks = [];
		}
	},

	pluginReadyCallback: function() {
		/* we don't send an event or set pluginReady immediately, because we don't want to trigger
		 * code that could then call functions in the plugin, as that's not allowed.  Instead, we
		 * schedule a timeout to be called immediately where we will send our event and call any
		 * deferred method calls. */
		enyo.asyncMethod(this, function() {
				this.pluginReady = true;
				this.doPluginReady(); /* send event to owner */

				// call any method calls that were deferred until the plugin was ready, returning 
				// the result of each to the appropriate callback
				this.deferredCalls.forEach(function (call) {
					call.callback(enyo.call(this.node, call.methodName, call.args));
					}, this);
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
	  call to be done after the plugin is ready.
	 */
	callPluginMethodDeferred: function(callback, methodName) {
		var args = Array.prototype.slice.call(arguments, 2);
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
	  called from an asyncMethod so it can make calls back into the plugin. */
	addCallback: function(name, callback, defer) {
		// defer option causes us to synthesize a function that will call the original callback after a
		// minimal delay to avoid recursive calls into the plugin
		var fn;
		if (defer) {
			fn = function() {
				var args = Array.prototype.slice.call(arguments);
				args.unshift(callback);
				args.unshift(this);
				enyo.asyncMethod.apply(enyo, args);
			};
		}
		else {
			fn = callback;
		}

		// if node is created, add immediately, otherwise wait until node has been added to DOM
		if (this.hasNode()) {
			this.node[name] = fn;
		}
		else {
			this.deferredCallbacks.push({ "name": name, "callback": fn });
		}
	}
});