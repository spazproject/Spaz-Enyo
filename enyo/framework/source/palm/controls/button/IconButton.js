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
		icon: "",
		/**
		If false then the icon property specifies an image file path; if true, it is a css className.
		*/
		iconIsClassName: false
	},
	components: [
		{name: "icon", className: "enyo-button-icon", showing: false},
		{name: "caption", className: "enyo-button-icon-text"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.captionChanged();
		this.iconChanged();
	},
	iconChanged: function(inOldValue) {
		this.$.icon.setShowing(Boolean(this.icon));
		if (this.iconIsClassName) {
			this.applyIconClassName(inOldValue);
		} else {
			this.applyIconImage(inOldValue);
		}
	},
	applyIconImage: function() {
		this.$.icon.applyStyle("background-image", "url(" + enyo.path.rewrite(this.icon) + ")");
		this.$.icon.applyStyle("background-repeat", "no-repeat");
	},
	applyIconClassName: function(inOldValue) {
		if (inOldValue) {
			this.$.icon.removeClass(inOldValue);
		}
		this.$.icon.addClass(this.icon);
	},
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
		this.$.caption.setShowing(this.caption);
	}
});
