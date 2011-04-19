/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "containers.ListDrawer",
	kind: HeaderView,
	components: [
		{name: "button", kind: "Button", caption: "Close Drawer", onclick: "buttonClick"},
		{name: "drawer", kind: "enyo.BasicDrawer", components: [
			{kind: "Item", content: "Madagascar"},
			{kind: "Item", content: "Malawi"},
			{kind: "Item", content: "Malaysia"}
		]}
	],
	buttonClick: function() {
		this.$.drawer.toggleOpen();
		this.$.button.setCaption(this.$.drawer.open ? "Close Drawer" : "Open Drawer");
	}
});