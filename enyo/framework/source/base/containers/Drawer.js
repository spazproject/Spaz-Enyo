/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A drawer control with a label, which animates vertically to open and close.
The drawer may be opened by calling setOpen(true) or just open; it 
may be closed by calling setOpen(false) or just close. For example,

	{kind: "Drawer", caption: "Drawer", components: [
		{content: "Now you see me now you don't"},
		{kind: "Button", caption: "Close drawer", onclick: "closeDrawer"}
	]}

Then, to close the drawer:

	closeDrawer: function(inSender) {
		this.$.drawer.close();
	}

*/
enyo.kind({
	name: "enyo.Drawer",
	kind: enyo.Control,
	published: {
		/**
		Specifies whether the drawer should be open.
		*/
		open: true,
		/**
		Controls whether or not the value of the open property may be changed.
		*/
		canChangeOpen: true,
		/**
		Set to false to avoid animations when the open state of a drawer changes.
		*/
		animate: true,
		/**
		CSS class to apply to the drawer caption.
		*/
		captionClassName: "",
		/**
		Caption to display above drawer content.
		*/
		caption: ""
	},
	events: {
		/**
		Event that fires when a drawer opens or closes.
		*/
		onOpenChanged: "",
		/**
		Event that fires when a drawer animation completes.
		*/
		onOpenAnimationComplete: ""
	},
	//* @protected
	chrome: [
		{name: "caption", kind: enyo.Control, onclick: "toggleOpen"},
		{name: "client", kind: enyo.BasicDrawer, onOpenChanged: "doOpenChanged", onOpenAnimationComplete: "doOpenAnimationComplete"}
	],
	create: function(inProps) {
		this.inherited(arguments);
		this.captionContainer = this.$.caption;
		this.captionChanged();
		this.captionClassNameChanged();
		this.canChangeOpenChanged();
		this.animateChanged();
		this.openChanged();
	},
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
		// NOTE: caption is displayed only if one is provided
		this.captionContainer.applyStyle("display", this.caption ? "block" : "none");
	},
	captionClassNameChanged: function(inOldClassName) {
		if (inOldClassName) {
			this.$.caption.removeClass(inOldClassName);
		}
		this.$.caption.addClass(this.captionClassName);
	},
	openChanged: function(inOldValue) {
		if (this.canChangeOpen) {
			this.$.client.setOpen(this.open);
		} else {
			this.open = inOldValue;
		}
	},
	canChangeOpenChanged: function() {
		this.$.client.setCanChangeOpen(this.canChangeOpen);
	},
	animateChanged: function() {
		this.$.client.setAnimate(this.animate);
	},
	//* @public
	/**
	Convenience method to open a drawer; equivalent to setOpen(true).
	*/
	open: function() {
		this.setOpen(true);
	},
	/**
	Convenience method to close a drawer; equivalent to setOpen(false).
	*/
	close: function() {
		this.setOpen(false);
	},
	/**
	Toggles the open state of the drawer.
	*/
	toggleOpen: function() {
		this.setOpen(!this.open);
	}
});