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
		/**
		An array of config objects or strings representing items. Note, specified components are 
		automatically added to the items array.
		Items are owned by the PopupSelect and therefore event handlers should not be specified on them.
		Use the onSelect event to respond to an item selection.
		*/
		items: [],
		selected: null
	},
	events: {
		onSelect: ""
	},
	className: "enyo-popup enyo-popup-menu enyo-popupselect",
	canCreateItems: false,
	importProps: function(inProps) {
		if (inProps.components) {
			inProps.items = inProps.items ? inProps.items.concat(inProps.components) : inProps.components;
			inProps.components = [];
		}
		this.inherited(arguments);
	},
	componentsReady: function() {
		this.inherited(arguments);
		this.canCreateItems = true;
		this.itemsChanged();
	},
	//* @protected
	// NOTE: default MenuItem.onclick
	menuItemClick: function(inSender) {
		this._itemClicked = true;
		this.setSelected(inSender);
	},
	itemsChanged: function() {
		this.selected = null;
		if (this.canCreateItems) {
			this.createItems();
		}
	},
	createItems: function() {
		this.destroyControls();
		for (var i=0, item, c; item=this.items[i]; i++) {
			item = enyo.isString(item) ? {caption: item} : item;
			// we want these controls to be owned by us so we get events
			this.createComponent(item);
		}
		if (this.generated) {
			this.render();
		}
		this.hasItems = true;
	},
	selectedChanged: function(inOldValue) {
		enyo.call(this.selected, "setSelected", [true]);
		if (inOldValue != this.selected) {
			enyo.call(inOldValue, "setSelected", [false]);
		}
		if (this._itemClicked) {
			this._itemClicked = false;
			this.doSelect(this.selected, inOldValue);
		}
	},
	fetchItemByValue: function(inValue) {
		return !this.hasItems ? this.fetchItemDataByValue(inValue) : this.inherited(arguments);
	},
	fetchItemDataByValue: function(inValue) {
		for (var i=0, items=this.items, c; c=items[i]; i++) {
			c.value = c.value || c.caption;
			if (c.value == inValue) {
				return c;
			}
		}
	},
	scrollToSelected: function() {
		var b = this.selected.getBounds();
		this.scrollIntoView(b.top);
	}
});
