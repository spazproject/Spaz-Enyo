/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "Main",
	kind: enyo.VFlexBox,
	events: {
		onItemSelected: "",
	},
	components: [
		{kind: "FadeScroller", flex: 1, components: [
			{defaultKind: "ViewItem", components: [
				{kind: "Divider", caption: "Data Parsing"},
				{className: "enyo-first", onSelected:'itemSelected', viewKind: "parse.XML", title: "XML Parse",
					description: "Demonstrates parsing through XML content."},

				{kind: "Divider", caption: "Network Data"},
				{className: "enyo-first", onSelected:'itemSelected', viewKind: "network.AJAXGet", title: "AJAX Get",
					description: "Demonstrates making an AJAX GET request."},
				{viewKind: "network.AJAXPost",
					onSelected:'itemSelected',
					title: "AJAX Post",
					description: "Demonstrates making an AJAX POST request"},

			
				{kind: "Divider", caption: "Security"},
				{className: "enyo-first", onSelected:'itemSelected', viewKind: "security.Encryption", title: "Encryption",
					description: "Encryption is now handled by the Key Manager service."},


				{kind: "Divider", caption: "Storage"},
				{className: "enyo-first", onSelected:'itemSelected', viewKind: "storage.SQLite", title: "SQLite",
					description: "Demonstrates using SQLite."},
				{viewKind: "storage.Cookie",
					onSelected:'itemSelected',
					title: "Cookie",
					description: "Demonstrates using Enyo's getter and setter cookie functions."},
			]}
		]}
	],	
	itemSelected: function(inSender, inEvent){
		this.doItemSelected(inEvent)
	}
});
