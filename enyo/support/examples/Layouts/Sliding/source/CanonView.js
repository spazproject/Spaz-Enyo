/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.CanonView",
	kind: "VFlexBox",
	className: "enyo-bg",
	published: {
		headerContent: ""
	},
	events: {
		onGo: ""
	},
	components: [
		{name: "header", kind: "Header"},
		{kind: "Scroller", flex: 1, components: [
			{name: "client"}
		]},
		{kind: "Toolbar", components: [
			{kind: "GrabButton"},
			{caption: "Go", onclick: "doGo"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.headerContentChanged();
	},
	headerContentChanged: function() {
		this.$.header.setContent(this.headerContent);
	}
});
