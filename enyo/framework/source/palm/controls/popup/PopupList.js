/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A <a href="#enyo.PopupSelect">PopupSelect</a> that renders items inside a <a href="#enyo.VirtualRepeater">VirtualRepeater</a>.

	{kind: "PopupList", onSelect: "popupSelect"}
	
To set items, use <code>setItems</code>:

	this.$.popupList.setItems([
		"Jan", "Feb", "Mar", "Apr", "May", "Jun",
		"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
	]);
*/
enyo.kind({
	name: "enyo.PopupList",
	kind: enyo.PopupSelect,
	events: {
		onSetupItem: ""
	},
	components: [
		{name: "list", kind: "VirtualRepeater", onSetupRow: "listSetupRow"}
	],
	//* @protected
	componentsReady: function() {
		this.inherited(arguments);
		this.$.list.createComponent({name: "item", kind: this.defaultKind, owner: this});
	},
	menuItemClick: function(inSender, inEvent) {
		this._itemClicked = true;
		this.setSelected(inEvent.rowIndex);
	},
	// NOTE: PopupList assumes items are strings; however, it's valid in its superclass Menu
	// for items to be objects.
	listSetupRow: function(inSender, inIndex) {
		var l = this.items.length;
		if (inIndex < l && this.$.item) {
			var item = this.items[inIndex];
			var caption = enyo.isString(item) ? item : item.caption;
			this.$.item.addRemoveItemClass("enyo-single", l == 1);
			this.$.item.addRemoveItemClass("enyo-first", inIndex == 0);
			this.$.item.addRemoveItemClass("enyo-last", inIndex == l-1);
			this.$.item.setCaption(caption);
			this.doSetupItem(this.$.item, inIndex, item);
			return true;
		}
	},
	itemsChanged: function() {
		if (this.$.list && this.generated) {
			this.$.list.render();
		}
	},
	fetchIndexByValue: function(inValue) {
		for (var i=0, item; item=this.items[i]; i++) {
			var v = this.fetchItemValue(item);
			if (v == inValue) {
				return i;
			}
		}
	},
	fetchItemValue: function(inItem) {
		return enyo.isString(inItem) ? inItem : (inItem.value === undefined ? inItem.caption : inItem.value);
	},
	fetchValue: function(inIndex) {
		var item = this.items[inIndex];
		if (item !== undefined) {
			return this.fetchItemValue(item);
		}
	},
	fetchRowNode: function(inIndex) {
		return this.$.list && this.$.list.fetchRowNode(inIndex);
	},
	fetchItem: function(inIndex) {
		if (this.$.list && this.$.list.prepareRow(inIndex)) {
			return this.$.item;
		}
	},
	scrollToSelected: function() {
		var n = this.fetchRowNode(this.selected), pn = this.$.list.hasNode();
		if (n && pn) {
			var offset = enyo.dom.calcNodeOffset(n, pn);
			this.scrollIntoView(offset.top);
		}
	}
});