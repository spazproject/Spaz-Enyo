/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A <a href="#enyo.Menu">Menu</a> with support for selection.

	{kind: "PopupSelect", onSelect: "popupSelect"}

The onSelect event is fired when a selection is made, like so:

	popupSelect: function(inSender, inSelected) {
		var value = inSelected.getValue();
	}
*/
enyo.kind({
	name: "enyo.PopupSelect",
	kind: enyo.Menu,
	published: {
		selected: null
	},
	events: {
		onSelect: ""
	},
	className: "enyo-popup enyo-popup-menu enyo-popupselect",
	//* @protected
	// NOTE: default MenuItem.onclick
	menuItemClick: function(inSender) {
		this.setSelected(inSender);
	},
	selectedChanged: function(inOldValue) {
		this.doSelect(this.selected, inOldValue);
	}
});