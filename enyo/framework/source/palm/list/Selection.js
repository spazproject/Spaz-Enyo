/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Selection",
	kind: enyo.Component,
	published: {
		multi: false
	},
	events: {
		onChange: ""
	},
	create: function() {
		this.clear();
		this.inherited(arguments);
	},
	clear: function(inIndex) {
		this.selected = [];
	},
	multiChanged: function() {
		if (!this.multi) {
			this.clear();
		}
		this.doChange();
	},
	isSelected: function(inIndex) {
		return this.selected[inIndex];
	},
	setByIndex: function(inIndex, inSelected) {
		this.selected[inIndex] = inSelected;
	},
	deselect: function(inIndex) {
		this.setByIndex(inIndex, false);
	},
	select: function(inIndex) {
		var state = this.isSelected(inIndex);
		if (!this.multi) {
			this.clear();
		}
		this.setByIndex(inIndex, !state);
		this.doChange();
	}
});
