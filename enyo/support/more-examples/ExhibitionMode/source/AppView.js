/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "AppView",
	kind: enyo.VFlexBox,
	components: [
		{kind: "ButtonHeader", content: "Exhibition Mode", style: "font-size: 16px"},
		{content: "Your app is not in exhibition mode."},
		{kind: "RowGroup", defaultKind: "HFlexBox", caption: "App Info", components: [
			{align: "center", tapHighlight: false, components: [
				{content: "Title", flex: 1},
				{name: "title"}
			]},
			{align: "center", tapHighlight: false, components: [
				{content: "ID", flex: 1},
				{name: "id"}
			]},
			{align: "center", tapHighlight: false, components: [
				{content: "Version", flex: 1},
				{name: "version"}
			]}
		]}
	],
	rendered: function() {
		var appInfo = enyo.fetchAppInfo();
		this.$.title.setContent(appInfo.title);
		this.$.id.setContent(appInfo.id);
		this.$.version.setContent(appInfo.version);
	},
});