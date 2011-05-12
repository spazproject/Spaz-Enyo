/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that displays a set of items in a popup.

	{kind: "Menu"}
	
Items can be specified as child components of the Menu:

	{kind: "Menu", components: [
		{caption: "Palm"},
		{caption: "Yahoo"},
		{caption: "Facebook"}
	]}

Items can also be set with <code>setItems</code>, like this:

	this.$.menu.setItems(["Palm", "Yahoo", "Facebook"]);

By default, items are instances of <a href="#enyo.MenuItem">MenuItem</a>.  But you can change this to use different kinds for items.
Here is an example using <a href="#enyo.MenuCheckItem">MenuCheckItem</a>:

	{kind: "Menu", defaultKind: "MenuCheckItem"}

To open the popup menu at the center, do the following:

	openPopup: function() {
		this.$.menu.openAtCenter();
	}
*/
enyo.kind({
	name: "enyo.Menu",
	kind: enyo.Popup,
	published: {
		// an array of config objects or strings representing items
		items: [],
		// whenever the menu is opened, any sub-items will be shown closed
		autoCloseSubItems: true
	},
	className: "enyo-popup enyo-popup-menu",
	// FIXME: scroller height is wrong.
	chrome: [
		{name: "client", className: "enyo-popup-inner", kind: "BasicScroller", autoVertical: true, vertical: false, layoutKind: "OrderedLayout"}
	],
	defaultKind: "MenuItem",
	//* @protected
	removeControl: function(inControl) {
		this.inherited(arguments);
		if (inControl == this._lastItem) {
			this._lastItem = null;
		}
	},
	show: function() {
		if (this.autoCloseSubItems) {
			for (var i=0, c$=this.getControls(), c; c=c$[i]; i++) {
				enyo.call(c, "closeAll");
			}
		}
		this.inherited(arguments);
	},
	itemsChanged: function() {
		this._lastItem = null;
		this.destroyControls();
		for (var i=0, item, c; item=this.items[i]; i++) {
			item = enyo.isString(item) ? {caption: item} : item;
			// we want these controls to be owned by us so we get events
			this.createComponent(item);
		}
		this.render();
	},
	fetchItemByValue: function(inValue) {
		var items = this.getControls();
		for (var i=0, c; c=items[i]; i++) {
			if (c.getValue && c.getValue() == inValue) {
				return c;
			}
		}
	},
	scrollIntoView: function(inY, inX) {
		this.$.client.scrollIntoView(inY, inX);
	},
	flow: function() {
		this.inherited(arguments);
		this.styleLastItem();
	},
	_locateLastItem: function(inControl) {
		if (inControl.getOpen && !inControl.getOpen()) {
			return inControl;
		} else {
			var controls = inControl.getControls();
			var c = controls.length;
			return c ? this._locateLastItem(controls[c-1]) : inControl;
		}
	},
	locateLastItem: function() {
		return this._locateLastItem(this);
	},
	// NOTE: dynamically style the very bottom visible menu item
	// this is so that we can make sure to hide any bottom border.
	styleLastItem: function() {
		if (this._lastItem && !this._lastItem.destroyed) {
			this._lastItem.addRemoveMenuLastStyle(false);
		}
		var b = this.locateLastItem();
		if (b && b.addRemoveMenuLastStyle) {
			b.addRemoveMenuLastStyle(true);
			this._lastItem = b;
		}
	}
});
