/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	A button styled to go in a
	<a href="#enyo.Toolbar">Toolbar</a> with an icon in the center.

		{kind: "ToolButton", icon: "images/foo.png"}
*/

// ToolButton has a tap target larger than area styled as a button.
enyo.kind({
	name: "enyo.ToolButton", 
	kind: enyo.IconButton,
	// do not style this as a button
	className: "enyo-tool-button",
	captionedClassName: "enyo-tool-button-captioned",
	chrome: [
		{name: "client", className: "enyo-tool-button-client"}
	],
	captionChanged: function() {
		this.inherited(arguments);
		this.$.client.addRemoveClass(this.captionedClassName, this.caption);
	},
	setState: function(inState, inValue) {
		this.$.client.addRemoveClass(this.cssNamespace + "-" + inState, Boolean(inValue));
	}
});