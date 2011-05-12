/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control offering a selection of items.

A picker can be initialized with a simple array of strings, like so:

	{kind: "Picker", value: "name", items: ["title", "name", "first last", "bool"], onChange: "pickerPick"}

You can also specify caption and value seperately, like so:

	{kind: "Picker", value: "am", items: [
		{caption: "A.M.", value: "am"},
		{caption: "P.M.", value: "pm"}
	]}
	
The selected item can be retrieved by calling <code>getValue</code>, like so:

	pickerPick: function(inSender) {
		this.fieldType = this.$.picker.getValue();
	}
*/
enyo.kind({
	name: "enyo.Picker",
	kind: enyo.PickerButton,
	published: {
		value: "",
		textAlign: "center",
		/** An array of simple strings representing items. */
		items: []
	},
	events: {
		onChange: ""
	},
	//* @protected
	create: function(inProps) {
		this.inherited(arguments);
		this.makePopup();
		this.textAlignChanged();
		this.itemsChanged();
		this.valueChanged();
	},
	makePopup: function() {
		this.popup = this.createComponent({
			kind: "PopupList",
			className: "enyo-picker-popup",
			onSelect: "popupSelect",
			onClose: "popupClose",
			scrim: this.scrim
		});
	},
	scrimChanged: function() {
		this.popup.scrim = this.scrim;
	},
	clickHandler: function(inSender, inEvent) {
		this.openPopup(inEvent);
		return this.doClick(inEvent);
	},
	openPopup: function(inEvent) {
		this.setFocus(true);
		// tell manager about popup opening before we popup
		// manager may have its own popup that should be opened first.
		this.dispatch(this.manager, this.managerOpenPopup);
		var n = this.hasNode();
		if (n) {
			this.popup.applyStyle("min-width", n.offsetWidth + "px");
		}
		this.popup.openAtControl(this);
		// FIXME: tricky correction required here due to flyweight:
		// make sure our popup's selected is unchecked
		// it can be incorrectly checked in flyweight context
		// because the popup is not rendered with this control due to 
		// being rendered outside flyweight.
		/*var s = this.popup.selected;
		if (s) {
			this.deselectItem(s);
		}*/
		this.valueChanged();
		this.popup.scrollToSelected();
	},
	popupClose: function(inSender, inEvent) {
		this.setFocus(false);
		this.dispatch(this.manager, this.managerClosePopup, [inEvent]);
	},
	closePopup: function() {
		this.popup.close();
	},
	itemsChanged: function() {
		this.items = this.items || [];
		this.popup.setItems(this.items);
	},
	textAlignChanged: function() {
		this.popup.applyStyle("text-align", this.textAlign);
	},
	fetchIndexByValue: function(inValue) {
		for (var i=0, item; item=this.items[i]; i++) {
			var v = enyo.isString(item) ? item : item.value;
			if (v == inValue) {
				return i;
			}
		}
	},
	valueChanged: function(inOldValue) {
		if (this.value != inOldValue) {
			var i = this.fetchIndexByValue(this.value);
			// disallow changes to invalid values
			if (i === undefined) {
				this.value = inOldValue;
			} else {
				this.popup.setSelected(i);
				var item = this.items[i];
				var caption = enyo.isString(item) ? item : item.caption;
				this.setCaption(caption);
			}
		}
	},
	updateSelected: function(inSelected, inOldValue) {
		this.addRemoveSelectedStyle(inOldValue, false);
		this.addRemoveSelectedStyle(inSelected, true);
	},
	addRemoveSelectedStyle: function(inIndex, inAdd) {
		if (inIndex >= 0) {
			var n = this.popup.fetchRowNode(inIndex);
			if (n) {
				n.className = inAdd ? "enyo-picker-item-selected" : "";
			}
		}
	},
	popupSelect: function(inSender, inSelected, inOldValue) {
		this.updateSelected(inSelected, inOldValue);
		var item = this.items[inSelected];
		var v = enyo.isString(item) ? item : item.value;
		if (v !== undefined) {
			var oldValue = this.value;
			this.setValue(v);
			if (this.value != oldValue) {
				this.doChange(this.value);
				this.dispatch(this.manager, "pickerChange");
			}
		}
	}
});