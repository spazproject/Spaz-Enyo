/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A <a href="#enyo.PickerGroup">PickerGroup</a> that offers selection of the month, day and year.  The DatePicker uses the JavaScript Date object to represent the chosen date.

	{kind: "DatePicker", label: "birthday", onChange: "pickerPick"}

The selected date can be retrieved by calling <code>getValue</code>, like so:

	pickerPick: function(inSender) {
		var bDate = this.$.datePicker.getValue();
	}
	
The year range can be adjusted by setting the minYear and maxYear properties, like so:

	{kind: "DatePicker", label: "birthday", minYear: 1900, maxYear: 2011, onChange: "pickerPick"}
*/
enyo.kind({
	name: "enyo.DatePicker",
	kind: enyo.PickerGroup,
	published: {
		label: enyo._$L("date"),
		value: null,
		minYear: 1900,
		maxYear: 2099
	},
	components: [
	],
	//* @protected
	initComponents: function() {
		this.inherited(arguments);
		
		this._tf = new enyo.g11n.Fmts();
		var dfm = {d: 'day', m: 'month', y: 'year'};
		var ordering = this._tf.getDateFieldOrder();
		var orderingArr = ordering.split("");
		var o,f,l;
		for(f = 0, l = orderingArr.length; f < l; f++) {
			o = orderingArr[f];
			this.createComponent({name: dfm[o]});
		}
	},
	create: function() {
		this.inherited(arguments);
		this.value = this.value || new Date();
		this.setupMonth();
		this.yearRangeChanged();
		this.valueChanged();
	},
	setupMonth: function() {
		var i = 0;
		var ms = this._tf.getMonthFields().map(function(m) { return {caption:m, value:i++} });
		this.$.month.setItems(ms);
	},
	setupDay: function(inYear, inMonth, inDay) {
		// determine number of days in a particular month/year
		var n = 32 - new Date(inYear, inMonth, 32).getDate();
		var items = [];
		for (var i=1; i<=n; i++) {
			items.push(String(i));
		}
		this.$.day.setItems(items);
		this.$.day.value = "";
		this.$.day.setValue(inDay > n ? n : inDay);
	},
	minYearChanged: function() {
		this.yearRangeChanged();
	},
	maxYearChanged: function() {
		this.yearRangeChanged();
	},
	yearRangeChanged: function() {
		var items = [];
		for (var i=this.minYear; i<=this.maxYear; i++) {
			items.push(String(i));
		}
		this.$.year.setItems(items);
	},
	valueChanged: function() {
		var v = this.value;
		var m = v.getMonth();
		var d = v.getDate();
		var y = v.getFullYear();
		
		this.setupDay(y, m, d);
		
		this.$.month.setValue(m);
		this.$.year.setValue(y);
	},
	pickerChange: function(inSender) {
		var m = parseInt(this.$.month.getValue());
		var d = parseInt(this.$.day.getValue());
		var y = parseInt(this.$.year.getValue());
		if (inSender != this.$.day) {
			this.setupDay(y, m, d);
		}
		this.value.setMonth(m);
		this.value.setDate(d);
		this.value.setYear(y);
		this.doChange(this.value);
	}
});
