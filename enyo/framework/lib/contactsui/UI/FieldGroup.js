/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global Foundations, PalmCall, Future, _, ContactsLib, document, enyo, console */

enyo.kind({
	name: "com.palm.library.contactsui.FieldGroup",
	kind: "RowGroup",
	published: {
		fields: null
	},
	events: {
		onGetFieldValue: "",
		onGetFieldType: "",
		onFieldClick: ""
	},
	fieldsChanged: function () {
		this.renderGroup();
	},
	renderGroup: function () {
		this.destroyControls();
		this.renderFields();
		this.render();
	},
	renderFields: function () {
		var i,
			value,
			type,
			c,
			f;

		this.setShowing(this.fields && this.fields.length > 0);

		for (i = 0; this.fields && (f = this.fields[i]); i += 1) {
			value = this.getFieldValue(f);
			type = this.getFieldType(f);
			c = this.createComponent(
				{onclick: "itemClick", components: [
					{content: type, className: "type-label"},
					{content: value, domStyles: {padding: "4px"}}
				]}, {field: f});
		}
	},
	getFieldValue: function (inField) {
		return this.doGetFieldValue(inField) || inField.value || inField.getDisplayValue() || "";
	},
	getFieldType: function (inField) {
		return this.doGetFieldType(inField) || 
			(inField.getType && inField.getType() && inField.x_displayType) || 
			(inField.type && inField.type.indexOf("type_") === 0 && inField.type.substring(5).toUpperCase()) || 
			"";
	},
	itemClick: function (inSender) {
		this.doFieldClick(inSender.field);
	}
});
