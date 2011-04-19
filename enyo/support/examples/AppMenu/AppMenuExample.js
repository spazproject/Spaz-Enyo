/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.AppMenuExample",
	kind: enyo.Control,
	components: [
		{kind: "PageHeader", content: "This is an app with an app menu"},
		{style: "padding: 10px", content: "Note: In the browser, you can press ctrl-~ to display the app menu."},
		{kind: "Button", caption: "Show App Menu", onclick: "openAppMenuHandler"},
		{kind: "Button", caption: "Add zot item", onclick: "addZot"},
		{kind: "Button", caption: "Remove zot item", onclick: "removeZot"},
		{kind: "Item", layoutKind: "HFlexLayout", align: "center", tapHighlight: false, components: [
			{content: "Use other app menu", flex: 1},
			{kind: "ToggleButton", onChange: "switchAppMenu"}
		]},
		{kind: "AppMenu", components: [
			{kind: "EditMenu"},
			{caption: "Turn off the lights.", onclick: "turnLightsOff"},
			{caption: "Turn on the lights", onclick: "turnLightsOn"},
		]},
		{name: "otherAppMenu", kind: "AppMenu", components: [
			{caption: "And now for something"},
			{caption: "completely different"},
		]}
	],
	openAppMenuHandler: function() {
		var menu = this.myAppMenu || this.$.appMenu;
		menu.open();
	},
	closeAppMenuHandler: function() {
		var menu = this.myAppMenu || this.$.appMenu;
		menu.close();
	},
	switchAppMenu: function(inSender) {
		this.myAppMenu = inSender.getState() ? this.$.otherAppMenu : this.$.appMenu;
	},
	addZot: function() {
		if (!this.$.zotItem) {
			this.$.appMenu.createComponent({name: "zotItem", caption: "Zot", owner: this});
			this.$.appMenu.render();
		}
	},
	removeZot: function() {
		if (this.$.zotItem) {
			this.$.zotItem.destroy();
			this.$.appMenu.render();
		}
	},
	turnLightsOff: function() {
		this.applyStyle("background-color", "black");
	},
	turnLightsOn: function() {
		this.applyStyle("background-color", null);
	}
});