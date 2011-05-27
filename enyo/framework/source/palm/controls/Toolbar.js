/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A container for items presented at the bottom of the screen. By default, the
items are instances of <a href="#enyo.ToolButton">ToolButton</a>.

Example toolbar with three buttons equally spaced apart:

	{kind: "Toolbar", components: [
		{caption: "foo"},
		{kind: "Spacer"},
		{caption: "bar"},
		{kind: "Spacer"},
		{caption: "baz"}
	]}

Other controls to put in a Toolbar are <a href="#enyo.RadioToolButtonGroup">RadioToolButtonGroup</a> and <a href="#enyo.ToolButtonGroup">ToolButtonGroup</a>.
*/
enyo.kind({
	name: "enyo.Toolbar",
	kind: enyo.HFlexBox,
	published: {
		//* Fade the toolbar into view when the virtual keyboard is hidden or raised
		fadeOnKeyboard: false
	},
	pack: "center",
	align: "center",
	className: "enyo-toolbar",
	defaultKind: "ToolButton",
	//* @protected
	resizeHandler: function() {
		this.inherited(arguments);
		if (this.fadeOnKeyboard) {
			this.fadeIn();
		}
	},
	fadeIn: function() {
		this.removeClass("enyo-toolbar-fade-in");
		this.addClass("enyo-toolbar-snap-out");
		enyo.asyncMethod(this, "_fadeIn");
	},
	_fadeIn: function() {
		this.addClass("enyo-toolbar-fade-in");
	}
});
