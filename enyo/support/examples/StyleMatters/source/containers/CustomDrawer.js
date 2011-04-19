/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "containers.CustomDrawer",
	kind: HeaderView,
	components: [
		{name: "button", kind: "Button", caption: "Close Drawer", onclick: "buttonClick"},
		{name: "drawer", kind: "enyo.BasicDrawer", open: true, components: [
			{kind: "Image", src: "images/halongbay.jpg"}
		]}
	],
	buttonClick: function() {
		this.$.drawer.toggleOpen();
		this.$.button.setCaption(this.$.drawer.open ? "Close Drawer" : "Open Drawer");
	}
});