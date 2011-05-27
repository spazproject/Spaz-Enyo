/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.PopupLayer",
	className: "enyo-fit",
	kind: enyo.Control,
	// to avoid rendering artifacts, do not render this control, instead 
	// force its node to be document.body
	render: function() {
	},
	hasNode: function() {
		return this.node = document.body;
	},
	// specialized rendering to support lazy child rendering.
	getChildContent: function() {
		return "";
	},
	rendered: function() {
	},
	//avoid teardown since we render parent on demand while child is rendering.
	teardownChildren: function() {
	}
});

enyo.getPopupLayer = function() {
	if (!enyo._popupLayer) {
		var f = enyo._popupLayer = new enyo.PopupLayer();
		f.render();
	}
	return enyo._popupLayer;
};