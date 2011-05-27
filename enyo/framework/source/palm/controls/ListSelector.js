/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that provides a display similar to an html select, used to 
select one item from a set of many choices. When the ListSelector is tapped, 
a scrolling popup of available choices is shown. The user taps an item
to select it, closing the popup and changing the displayed item to the selected one.

The items for a ListSelector can be specified as an array of strings
or objects specifying a caption and a value. For example:

	components: [
		{kind: "ListSelector", value: 2, onChange: "itemChanged", items: [
			{caption: "One", value: 1},
			{caption: "Two", value: 2},
			{caption: "Three", value: 3},
		]}
	],
	itemChanged: function(inSender, inValue, inOldValue) {
		this.setSomeOption(inValue);
	}
	
ListSelector uses <a href="#enyo.PopupList">PopupList</a> which uses
<a href="#enyo.VirtualRepeater">VirtualRepeater</a> to render items to optimize
creation and rendering time.  This makes ListSelector less customizable, for example
it can't have different kinds for items.  If you need to customize ListSelector use
<a href="#enyo.CustomListSelector">CustomListSelector</a>.

The onChange event fires when the selected item changes. Note that the onSelect event
fires whenever an item is selected.

The value of a ListSelector may be set directly or retrieved as follows:

	buttonClick: function() {
		if (this.$.listSelector.getValue() > 10) {
			this.$.listSelector.setValue(10);
		}
	}

Note that you cannot set a value not in the items list.

The property <code>hideItem</code> can be used to hide the displayed item.

*/
enyo.kind({
	name: "enyo.ListSelector",
	kind: enyo.CustomListSelector,
	//* @protected
	makePopup: function() {
		this.popup = this.createComponent({
			kind: "PopupList",
			onSelect: "popupSelect",
			onBeforeOpen: "popupBeforeOpen",
			onSetupItem: "popupSetupItem",
			defaultKind: this.itemKind
		});
	},
	popupBeforeOpen: function() {
		this.valueChanged();
	},
	valueChanged: function(inOldValue) {
		if (this.value === undefined && this.items.length) {
			this.value = this.popup.fetchValue(0);
		}
		if (this.value != inOldValue) {
			var i = this.popup.fetchIndexByValue(this.value);
			// disallow changes to invalid values
			if (i === undefined) {
				this.value = inOldValue;
			} else {
				this.popup.selected = i;
				var item = this.items[i];
				item = enyo.isString(item) ? {caption: item} : item;
				this.updateItem(item);
				this.updateSelected(i, this.popup.fetchIndexByValue(inOldValue));
			}
		}
	},
	popupSetupItem: function(inSender, inItem, inRowIndex, inRowItem) {
		inItem.setIcon(inRowItem.icon);
		inItem.setChecked(inRowIndex == inSender.selected);
	},
	updateSelected: function(inSelected, inOldSelected) {
		this.addRemoveChecked(inOldSelected, false);
		this.addRemoveChecked(inSelected, true);
	},
	addRemoveChecked: function(inIndex, inChecked) {
		if (inIndex >= 0) {
			var item = this.popup.fetchItem(inIndex);
			if (item) {
				item.setChecked(inChecked);
			}
		}
	},
	popupSelect: function(inSender, inSelected, inOldSelected) {
		var v = this.popup.fetchValue(inSelected);
		this.doSelect(inSelected, this.item);
		if (v !== undefined) {
			var oldValue = this.value;
			this.setValue(v);
			if (this.value != oldValue) {
				this.doChange(this.value, oldValue);
			}
		}
	}
});
