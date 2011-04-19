/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "toolbar.ButtonMenu",
	kind: enyo.VFlexBox,
	noScroller: true,
	components: [
		{name: "buttonHeader", kind: "ButtonHeader", content: "Style Matters", onclick: "menuClick", style: "z-index: 200;"},
		{kind: "Menu", layoutKind: "VFlexLayout", components: [
			{caption: "title"},
			{caption: "title"},
			{caption: "title"},
			{caption: "title"},
			{caption: "title"},
			{caption: "title"},
			{caption: "title"},
			{caption: "title"},
			{caption: "title"}
		]}
	],
	menuClick: function() {
		var n = this.$.buttonHeader.hasNode();
		// size the popup to be the width of the header
		if (n) {
			this.$.menu.applyStyle("width",  n.offsetWidth + "px");
		}
		// size the popup menu's content to have a maximum height, the popup menu
		// will grow up to the specified height and scroll thereafter.
		this.$.menu.getContentControl().applyStyle("max-height", 200 + "px");
		// open the popup where the header is but shifted down by the specified amount.
		this.$.menu.openAroundControl(this.$.buttonHeader);
	}
});