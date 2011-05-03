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
	components: [
		{name: "list", kind: "VirtualRepeater", onGetItem: "listGetItem"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.$.list.createComponent({name: "item", kind: this.defaultKind, owner: this});
		this.itemClassName = this.$.item.getItemClassName();
	},
	menuItemClick: function(inSender, inEvent) {
		this.setSelected(inEvent.rowIndex);
		//this.close();
	},
	// NOTE: PopupList assumes items are strings; however, it's valid in its superclass Menu
	// for items to be objects.
	listGetItem: function(inSender, inIndex) {
		var l = this.items.length;
		if (inIndex < l) {
			var item = this.items[inIndex];
			var caption = enyo.isString(item) ? item : item.caption;
			this.$.item.setCaption(caption);
			var r = l == 1 ? "single" : (inIndex == 0 ? "first" : (inIndex == l-1 ? "last" : ""));
			r = r ? " enyo-" + r : "";
			this.$.item.setItemClassName(this.itemClassName + r);
			return true;
		}
	},
	itemsChanged: function() {
		if (this.generated) {
			this.$.list.render();
		}
	},
	fetchRowNode: function(inIndex) {
		return this.$.list.fetchRowNode(inIndex);
	},
	scrollToSelected: function() {
		var n = this.fetchRowNode(this.selected), pn = this.$.list.hasNode();
		var offset = enyo.dom.calcNodeOffset(n, pn);
		this.scrollIntoView(offset.top);
	}
});