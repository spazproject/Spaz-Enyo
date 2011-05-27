/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A <a href="#enyo.Button">Button</a> that has a
<a href="#enyo.Spinner">Spinner</a> as an activity indicator. Use
setActive() to start or stop the spinner.

	{kind: "ActivityButton", caption: "Hit me to spin", onclick: "toggleActivity"}
	
	toggleActivity: function(inSender) {
		var a = inSender.getActive();
		inSender.setActive(!a);
	}
*/
enyo.kind({
	name: "enyo.ActivityButton", 
	kind: enyo.Button,
	published: {
		active: false
	},
	layoutKind: "HFlexLayout",
	chrome: [
		{name: "caption", flex: 1},
		{name: "spinner", kind: "Spinner", className: "enyo-activitybutton-spinner"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.activeChanged();
	},
	activeChanged: function() {
		this.$.spinner.setShowing(this.active);
	},
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
	}
});
