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
	kind: enyo.Control,
	published: {
		/**
		The currently selected value.
		*/
		value: "",
		/**
		An array of strings or objects specifying the item choices. If objects are specified,
		they are component configurations and do not specify a kind. Typically, a caption and value
		are specified.
		*/
		items: [],
		/**
		A label descibing the set of available choices. It is shown to the left of the drop-down arrow.
		*/
		label: "",
		/**
		Hides the displayed item.
		*/
		hideItem: false,
		/**
		Hides the drop-down arrow.
		*/
		hideArrow: false,
		disabled: false
	},
	events: {
		/**
		Event fired when the selected value changes. The event sends both the current and previous values.
		*/
		onChange: "",
		/**
		Event fired whenever an item is selected, even if it is the same item that was previously selected.
		*/
		onSelect: ""
	},
	layoutKind: "HFlexLayout",
	itemKind: "MenuCheckItem",
	align: "center",
	chrome: [
		{kind: "HFlexBox", flex: 1, components: [
			{name: "itemContainer"},
			{name: "client"}
		]},
		{name: "label", className: "enyo-listselector-label enyo-label"},
		{name: "arrow", className: "enyo-listselector-arrow"}
	],
	//* @protected
	create: function(inProps) {
		this.inherited(arguments);
		this.item = this.$.itemContainer.createComponent(
			{kind: this.itemKind, itemClassName: "enyo-listselector-item", tapHighlight: false, owner: this}
		);
		this.makePopup();
		this.itemsChanged();
		this.disabledChanged();
		this.labelChanged();
		this.hideArrowChanged();
	},
	disabledChanged: function() {
		this.$.itemContainer.addRemoveClass("enyo-disabled", this.disabled);
	},
	hideItemChanged: function() {
		//this.log(this.selected);
		this.item.setShowing(!this.hideItem);
	},
	labelChanged: function() {
		this.$.label.setContent(this.label);
	},
	hideArrowChanged: function() {
		this.$.arrow.setShowing(!this.hideArrow);
	},
	fetchDefaultItem: function() {
		var items = this.popup.getControls();
		if (items.length) {
			return items[0];
		}
	},
	makePopup: function() {
		this.popup = this.createComponent({
			kind: "PopupSelect",
			onSelect: "popupSelect",
			defaultKind: this.itemKind
		});
	},
	openPopup: function(inEvent) {
		// FIXME: tricky correction required here due to flyweight:
		// make sure our popup's selected is unchecked
		// it can be incorrectly checked in flyweight context
		// because the popup is not rendered with this control due to 
		// being rendered outside flyweight.
		var s = this.popup.selected;
		if (s) {
			s.setSelected(false);
		}
		this.valueChanged();
		//
		this.popup.openAroundControl(this);
	},
	clickHandler: function(inSender, inEvent) {
		if (!this.disabled) {
			this.doClick(inEvent);
			this.openPopup(inEvent);
		}
	},
	itemsChanged: function() {
		this.items = this.items || [];
		this.popup.setItems(this.items);
		this.item.setShowing(this.items && this.items.length);
		this.valueChanged();
	},
	valueChanged: function(inOldValue) {
		var i = this.popup.fetchItemByValue(this.value);
		if (!i) {
			i = this.fetchDefaultItem();
			this.value = i ? i.getValue() : "";
		}
		if (this.value != inOldValue) {
			//i = this.popup.fetchItemByValue(this.value);
			// disallow changes to invalid values
			if (i === undefined) {
				this.value = inOldValue;
			} else {
				// set content and style selection
				if (!this.hideItem) {
					this.setItemProps(i);
				}
				this.hideItemChanged();
				i.setSelected(true);
				// force selected to be correct
				this.popup.selected = this.selected = i;
				// unset old selection
				var o = this.popup.fetchItemByValue(inOldValue);
				if (o) {
					o.setSelected(false);
				}
			}
		}
	},
	setItemProps: function(inItem) {
		this.item.setCaption(inItem.getCaption());
		this.item.setIcon(inItem.getIcon());
	},
	popupSelect: function(inSender, inSelected, inOldItem) {
		var oldValue = this.value;
		this.setValue(inSelected.value);
		this.selected = inSelected;
		this.doSelect(inSelected, this.item);
		if (this.value != oldValue) {
			this.doChange(this.value, oldValue);
		}
	}
});
