/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.VirtualRepeater",
	kind: enyo.VFlexBox,
	components: [
		{kind: "PageHeader", components: [
			{content: "VirtualRepeater Example", flex: 1},
			{kind: "Button", caption: "Configure", onclick: "configureClick"}
		]},
		{kind: "Scroller", flex: 1, components: [
			{name: "list", kind: "VirtualRepeater", onGetItem: "listGetItem", components: [
				{name: "item", kind: "SwipeableItem", layoutKind: "HFlexLayout", components: [
					{name: "itemCaption", flex: 1},
					{kind: "CheckBox"}
				]}
			]}
		]},
		{kind: "Popup", scrim: true, modal: true, style: "width: 400px;", components: [
			{kind: "RowGroup", components: [
				{name: "itemConfig", inputClassName: "richy", richContent: false, kind: "RichText"}
			]},
			{kind: "RowGroup", components: [
				{name: "rowCount", kind: "Input", value: "100", onchange: "rowCountChange", components: [
					{style: "color: #1F75BF; font-size: 13px;", content: "row count"}
				]}
			]},
			{kind: "HFlexBox", align: "center", style: "padding: 10px;", components: [
				{content: "Accelerated: ", flex: 1},
				{name: "acceleratedToggle", kind: "ToggleButton", state: true, onChange: "acceleratedChange"},
			]},
			{kind: "HFlexBox", pack: "end", components: [
				{kind: "Button", caption: "OK", onclick: "okClick", style: "margin-right: 10px;"},
				{kind: "Button", caption: "Cancel", onclick: "cancelClick"}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.applyListChanges();
	},
	configureClick: function() {
		this.$.itemConfig.setValue(enyo.json.stringify(this.$.item.components));
		this.$.popup.openAtCenter();
	},
	okClick: function() {
		this.applyListChanges();
		this.cancelClick();
	},
	cancelClick: function() {
		this.$.popup.close();
	},
	listGetItem: function(inSender, inIndex) {
		if (inIndex < this.rowCount) {
			if (this.$.itemCaption) {
				this.$.itemCaption.setContent("I am item: " + inIndex);
			}
			return true;
		}
	},
	applyListChanges: function() {
		this.updateRowCount();
		this.updateAccelerated();
		this.updateItemConfig();
		if (this.hasNode()) {
			this.$.scroller.setScrollTop(0);
			this.$.list.render();
		}
	},
	updateRowCount: function() {
		this.rowCount = this.$.rowCount.getValue();
	},
	updateAccelerated: function() {
		this.$.scroller.setAccelerated(this.$.acceleratedToggle.getState());
	},
	updateItemConfig: function() {
		var json = this.$.itemConfig.getValue();
		var config = null;
		try {
			config = json && enyo.json.parse(json);
			if (config) {
				this.$.item.destroyControls();
				this.$.item.createComponents(config, {owner: this});
				this.$.item.components = config;
			}
		} catch(e) {
			console.log("Invalid json, not changing item.");
		}
	}
});