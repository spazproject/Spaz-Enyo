/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A component that manages a standard dashboard window in order to properly display a list of notification "layers".
Public methods exist for adding and removing layers, which are objects of the following form:

	{
		icon: String, path to icon image for this layer.
		title: First line of text, bold by default.  HTML is automatically escaped.
		text: Second line of text, HTML is automatically escaped.
	}

If the layers stack is empty, the dashboard window is closed.
When the stack is not empty, the data from the topmost layer will be displayed.
If the stack size is greater than 1, the size will be displayed in a little blue badge over the icon.

Applications can create instances of this component for the various types of dashboards they require.
For example, email uses one per email account, and one for the unified "all inboxes".
Then apps can push/pop notification layers as appropriate.  
The component handles all logic for window creation, destruction, and UI display.
*/
/*
	Notes:
	Mojo supported some extra layer properties we may need to add if required by apps: 
		rightHTML, rightIcon, rightTemplate, dashboardCount.
	Mojo also alowed HTML in the 'title' property. 
		We escape it for consistency & safety, but we may need to support an alternative titleHTML property instead.
*/
enyo.kind({
	name: "enyo.Dashboard",
	kind: enyo.Component,
	published: {
		/** Array of layer objects specifying contents of dashboard.*/
		layers: null,
		/** Optional path to small icon to display when this dashboard window is hidden. */
		smallIcon:""
	},
	events: {
		/** Fired when user taps the icon portion of a dashboard. Event includes the top layer object, and mouse event.*/
		onIconTap: "",
		/** Fired when user taps the message portion of a dashboard. Event includes the top layer object, and mouse event.*/
		onMessageTap: "",
		/** Fired when user taps anywhere in a dashboard. Event includes the top layer object, and mouse event.*/
		onTap: "",
		/** Fired when user swipes away the dashboard (or the last layer).  NOT sent when it is programmatically closed by emptying the layer stack.*/
		onUserClose: "",
		/** Fired when user swipes a dashboard layer away, unless it's the last one (that's onUserClose instead). Event includes the top layer object.*/
		onLayerSwipe: "",
		/** Fired when the dashboard window is displayed/maximized. */
		onDashboardActivated: "",
		/** Fired when user dashboard window is concealed/minimized. */
		onDashboardDeactivated: ""
	},
	
	indexPath: "$palm-system/dashboard-window/dashboard.html",
	
	create: function() {
		this.inherited(arguments);
		this.layers = [];
	},	
	destroy: function() {
		// Close window if there is one.
		this.layers.length = 0;
		this.updateWindow();		
		this.inherited(arguments);
	},
	/** @public Add a notification layer to the top of the stack. */
	push: function(layer) {
		if(layer) {
			this.layers.push(layer);
			this.updateWindow();
		}
	},
	/** @public Remove the topmost notification layer from the stack. */
	pop: function() {
		var layer = this.layers.pop();
		this.updateWindow();
		return layer;
	},
	/** @public Set current stack of notification layers to a copy of the given array. */
	setLayers: function(layers) {
		this.layers = layers.slice(0);
		this.updateWindow();
	},	
	/** @private
		Manages window creation & destruction when needed,
		and updates window contents when the layers change.
	*/
	updateWindow: function() {
		// Note that closed windows may get their js bindings snipped, so 'w.closed' may actually be undefined instead of true.
		var windowValid = this.window && this.window.closed === false;
		// If we have items to display, then create the window if we don't already have one.
		if(this.layers.length) {
			// Sometimes it seems like window objects get their JS contexts snipped or something,
			// so they will remain truthy, but have no properties.
			var params = {layers:this.layers, docPath:document.location.pathname, 
							onTap:"dbTapped", onIconTap:"iconTapped", onMessageTap:"msgTapped", 
							onUserClose:"userClosed", onLayerSwipe:"layerSwiped",
							onDashboardActivated:"dbActivated", onDashboardDeactivated:"dbDeactivated"};
			if(!windowValid) {
				var attributes = {webosDragMode:"manual"};
				if(this.smallIcon) {
					attributes.icon = this.smallIcon;
				}
				this.window = enyo.windows.openDashboard(enyo.path.rewrite(this.indexPath), this.name, params, attributes);
				this.window.dashboardOwner = this;
			} else {
				enyo.windows.activate(undefined, this.name, params);
			}
		} else {
			if(windowValid) {
				this.window.close();
			}
			this.window = undefined;
		}
	},
	layerSwiped: function(inSender, topLayer) {
		this.layers.pop();
		this.doLayerSwipe(topLayer);
	},
	userClosed: function(inSender) {
		this.layers.length = 0;
		this.doUserClose();
	},
	// The following event handler pass-throughs are entirely trivial, but ensure the correct sender & arguments.
	dbTapped: function(inSender, topLayer, event) {
		this.doTap(topLayer, event);
	},
	msgTapped: function(inSender, topLayer, event) {
		this.doMessageTap(topLayer, event);
	},
	iconTapped: function(inSender, topLayer, event) {
		this.doIconTap(topLayer, event);
	},
	dbActivated: function(inSender) {
		this.doDashboardActivated();
	},
	dbDeactivated: function(inSender) {
		this.doDashboardDeactivated();
	}
});
