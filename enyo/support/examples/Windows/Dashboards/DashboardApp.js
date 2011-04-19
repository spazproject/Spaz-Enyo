/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.DashboardApp",
	kind: enyo.Control,
	components: [
	{content:"Enter a message here:"},
	{name: "dashboardText", value:"This is a test message", kind:"Input"},
	{kind:"Button", label:"Push", onclick:"pushDashboard"},
	{kind:"Button", label:"Pop", onclick:"popDashboard"},
	{name:"status"},
	/*
		A dashboard component manages creation, display, and destruction of a standard 
		webos message dashboard.  It maintains a stack of message layers, and ensures
		that the top layer is displayed when the stack is non-empty, and created/destroys
		the dashboard window when appropriate.  Read the API docs for more details.
	*/
	{name: "dashboard", kind:"Dashboard", onIconTap: "", onMessageTap: "messageTap", onIconTap: "iconTap", 
				onUserClose: "dashboardClose", onLayerSwipe: "layerSwiped"}
	],
	
	pushDashboard: function() {
		this.$.dashboard.push({icon:"sample-icon.png", title:"Dashboard Demo", text:this.$.dashboardText.getValue()});
	},
	popDashboard: function() {
		this.$.dashboard.pop();
	},
	messageTap: function(inSender, layer) {
		this.$.status.setContent("Tapped on message: "+layer.text);
	},
	iconTap: function(inSender, layer) {
		this.$.status.setContent("Tapped on icon for message: "+layer.text);
	},
	dashboardClose: function(inSender) {
		this.$.status.setContent("Closed dashboard.");
	},
	layerSwiped: function(inSender, layer) {
		this.$.status.setContent("Swiped layer: "+layer.text);
	}
});