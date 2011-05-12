/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A drawer with its caption styled to look like a divider. An arrow button shows the open state of the drawer.

A caption and an icon for the caption may be provided.
*/
enyo.kind({
	name: "enyo.DividerDrawer",
	kind: enyo.Drawer,
	published: {
		/**
		URL for an image to be used as the icon.
		*/
		icon: "",
		caption: ""
	},
	//* @protected
	chrome: [
		{name: "caption", kind: "enyo.Divider", onclick: "toggleOpen", components: [
			{name: "openButton", kind: "enyo.SwitchedButton", className: "enyo-collapsible-arrow"}
		]},
		{name: "client", kind: "enyo.BasicDrawer", onOpenChanged: "doOpenChanged", onOpenAnimationComplete: "doOpenAnimationComplete"}
	],
	create: function() {
		this.inherited(arguments);
		this.iconChanged();
	},
	captionChanged: function() {
		this.$.caption.setCaption(this.caption);
		this.$.caption.applyStyle("display", this.caption ? "" : "none");
	},
	openChanged: function() {
		this.inherited(arguments);
		this.$.openButton.setSwitched(!this.open);
	},
	iconChanged: function() {
		this.$.caption.setIcon(this.icon);
	}
});

//* @protected
enyo.kind({
	name: "enyo.SwitchedButton",
	kind: enyo.CustomButton,
	published: {
		switched: false
	},
	caption: " ",
	create: function() {
		this.inherited(arguments);
		this.switchedChanged();
	},
	toggleSwitched: function() {
		this.setSwitched(!this.switched);
	},
	switchedChanged: function(inSwitched) {
		this.stateChanged("switched");
	}
});
