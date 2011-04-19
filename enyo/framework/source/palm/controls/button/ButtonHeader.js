/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A button with menu styling, meant to contain other components within.

	{kind: "ButtonHeader", components: [
		{content: "This text goes inside the button"}
	]}
*/
enyo.kind({
	name: "enyo.ButtonHeader", 
	kind: enyo.Button,
	style: "display: block",
	className: "enyo-button enyo-button-header",
	chrome: [
		{name: "client", className: "enyo-button-header-client"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.contentChanged();
	},
	// FIXME: do we want a more general system for promoting layoutKind and content to client?
	layoutKindChanged: function() {
		this.$.client.setLayoutKind(this.layoutKind);
	},
	contentChanged: function() {
		this.$.client.setContent(this.content);
	}
});
