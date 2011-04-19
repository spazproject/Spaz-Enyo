/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.CanonVirtualList",
	kind: enyo.VFlexBox,
	components: [
		{kind: "PageHeader", content: "Virtual Grid Example"},
		{kind: "HFlexBox", align: "center", components: [
			{kind: "Button", caption: "Load Data", onclick: "loadData"},
			{flex: 1},
			{content: "Multiselect: "},
			{name: "multiMode", kind: "ToggleButton", onChange: "multiModeChange"}
		]},
		{flex: 1, name: "list", kind: "VirtualList", className: "list", style: "background-color: #eee;", onSetupRow: "listSetupRow", components: [
			{kind: "Divider"},
			{name: "cells", kind: "HFlexBox", onclick: "cellsClick"}
		]},
		{kind: "Selection"},
		{name: "console", style: "color: white; background-color: gray; padding: 4px; border: 1px solid black"}
	],
	create: function() {
		this.count = 0;
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		this.buildCells();
	},
	resizeHandler: function() {
		this.buildCells();
		this.$.list.refresh();
	},
	loadData: function(inSender) {
		this.count = 100;
		this.$.list.refresh();
	},
	buildCells: function() {
		var bounds = this.$.list.getBounds();
		this.cellCount = Math.floor(bounds.width / 156);
		this.log(this.cellCount);
		this.$.cells.destroyControls();
		this.cells = [];
		for (var i=0; i<this.cellCount; i++) {
			var c = this.$.cells.createComponent({flex: 1, kind: "VFlexBox", pack: "center", align: "center", style: "padding: 8px;", owner: this, idx: i, onclick: "cellClick"});
			c.createComponent({kind: "Image", style: "padding: 4px; height: 104px;"});
			this.cells.push(c);
		}
	},
	listSetupRow: function(inSender, inIndex) {
		var idx = inIndex * this.cellCount;
		if (idx >= 0 && idx < this.count) {
			for (var i=0, c; c=this.cells[i]; i++, idx++) {
				if (idx < this.count) {
					var path = "images/Image" + ("00000" + (idx % 415)).slice(-5) + ".jpg";
					var bg = "white";
					c.applyStyle("background-color", this.$.selection.isSelected(idx) ? "lightgreen" : null);
				} else {
					path = "blank.png";
					bg = null;
				}
				c.$.image.setSrc(path);
				c.$.image.applyStyle("background-color", bg);
			}
			return true;
		}
	},
	cellClick: function(inSender, inEvent, inRowIndex) {
		var idx = inEvent.rowIndex * this.cellCount + inSender.idx;
		this.$.selection.select(idx);
		this.$.list.refresh();
	},
	multiModeChange: function(inSender) {
		this.$.selection.setMulti(inSender.getState());
		this.$.list.refresh();
	}
});