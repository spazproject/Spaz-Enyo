/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A <a href="#enyo.CustomButton">Button</a> with Enyo styling,
an image in the button, and an optional text label below it.

	{kind: "IconButton", label: "I am a label", icon: "images/foo.png"}
*/
enyo.kind({
	name: "enyo.IconButton",
	kind: enyo.CustomButton,
	className: "enyo-button",
	published: {
		icon: ""
	},
	components: [
		{name: "icon", className: "enyo-button-icon", showing: false},
		{name: "caption"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.captionChanged();
		this.iconChanged();
	},
	iconChanged: function() {
		this.$.icon.setShowing(Boolean(this.icon));
		this.$.icon.applyStyle("background-image", "url(" + enyo.path.rewrite(this.icon) + ")");
		this.$.icon.applyStyle("background-repeat", "no-repeat");
	},
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
		this.$.caption.setShowing(this.caption);
	}
});
