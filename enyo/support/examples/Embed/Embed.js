/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.Embed",
	kind: enyo.Control,
	style: "border: 1px solid red; padding: 8px; margin: 8px; position: static;",
	content: "Click Me",
	create: function() {
		this.inherited(arguments);
	},
	clickHandler: function() {
		this.applyStyle("background-color", "rgb(" + enyo.irand(256) + ", " + enyo.irand(256) + ", " + enyo.irand(256) + ")");
	}
});