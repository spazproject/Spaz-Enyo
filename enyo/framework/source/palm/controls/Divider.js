/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A labeled divider with icon.
*/
enyo.kind({
	name: "enyo.Divider",
	kind: enyo.HFlexBox,
	align: "center",
	published: {
		/**
		URL for an image to be used as the divider's icon.
		*/
		icon: "",
		iconBorderCollapse: true,
		caption: "Divider"
	},
	chrome: [
		{name: "rightCap", className: "enyo-divider-right-cap"},
		{name: "icon", className: "enyo-divider-icon", nodeTag: "img"},
		{name: "caption", className: "enyo-divider-caption"},
		{className: "enyo-divider-left-cap"},
		{name: "client", kind: enyo.HFlexBox, align: "center", className: "enyo-divider-client"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.iconChanged();
		this.captionChanged();
	},
	iconChanged: function() {
		this.$.icon.setAttribute("src", this.icon);
		if (this.icon) {
			this.$.icon.show();
			if (this.iconBorderCollapse) {
				this.$.rightCap.hide();
				this.$.icon.setClassName("enyo-divider-icon");
			} else {
				this.$.icon.setClassName("enyo-divider-icon-collapse");
			}
		} else {
			this.$.icon.hide();
			this.$.rightCap.show();
		}
	},
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
	}
});
