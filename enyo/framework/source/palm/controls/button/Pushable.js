/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A <a href="#enyo.Control">Control</a> that gets a gray
highlight on mouse down. It generates an ondown event on mouse down, and an
onup event on mouse up.

	{kind: "Pushable", content: "push me", ondown: "pushableDown", onup: "pushableUp}

	pushableDown: function(inSender) {
		this.log(inSender.content + "is down");
	},
	pushableUp: function(inSender) {
		this.log(inSender.content + "is up");
	}
*/
enyo.kind({
	name: "enyo.Pushable", 
	kind: enyo.Control,
	events: {
		ondown: "",
		onup: ""
	},
	//* @protected
	styleForDown: function() {
		this.applyStyle("background-color", "gray");
	},
	styleForUp: function() {
		this.applyStyle("background-color", "inherit");
	},
	mousedownHandler: function(inSender, e) {
		this.styleForDown();
		this.doDown();
	},
	mouseupHandler: function(inSender, e) {
		this.styleForUp();
		this.doUp();
	}
});
