/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "panels.Submenus",
	kind: HeaderView,
	components: [
		{flex: 1},
		{kind: "Toolbar", components: [
			{caption: "Category", onclick: "categoryClick"}
		]},
		{kind: "PopupSelect", components: [
			{caption: "All"},
			{caption: "Business"},
			{caption: "Personal"},
			{caption: "Future"},
			{caption: "Current"},
			{caption: "Unfiled"}
		]}
	],
	categoryClick: function(inSender) {
		console.log(inSender.id);
		this.$.popupSelect.openAroundControl(inSender);
	}
});