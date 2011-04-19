/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.kind({
	name: "enyo.TestBanner",
	kind: enyo.HFlexBox,
	align: "center",
	published: {
		message: ""
	},
	style: "z-index: 1000;", 
	chrome: [
		{kind: enyo.VFlexBox, flex: 1, align: "center", components: [
			{name: "message"}
		]},
	],
	create: function() {
		this.inherited(arguments);
		this.messageChanged();
	},
	messageChanged: function() {
		enyo.scrim.show();
		this.$.message.setContent(this.message);
	},
	show: function() {
		this.inherited(arguments);
		enyo.scrim.show();
	},
	hide: function() {
		this.inherited(arguments);
		enyo.scrim.hide();
	}
});