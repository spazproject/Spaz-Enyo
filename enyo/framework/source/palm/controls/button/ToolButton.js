/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	A button styled to go in a
	<a href="#enyo.Toolbar">Toolbar</a> with an icon in the center.

		{kind: "ToolButton", icon: "images/foo.png"}
*/
enyo.kind({
	name: "enyo.ToolButton", 
	kind: enyo.IconButton,
	className: "enyo-tool-button",
	captionedClassName: "enyo-tool-button-captioned",
	captionChanged: function() {
		this.inherited(arguments);
		this.addRemoveClass(this.captionedClassName, this.caption);
	}
});
