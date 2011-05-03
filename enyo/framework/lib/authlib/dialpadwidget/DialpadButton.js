/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*globals enyo */

enyo.kind({
	name: "DialpadButton",
	kind: enyo.CustomButton,
	className: "", /* .enyo-button adds unwanted styles */
	layoutKind: enyo.VFlexLayout,
	align: "center",
	pack: "center",
	published: {
		number: "",
		numberFontSize: "",
		subtext: "",
		subtextShowing: true
	},
	components: [
		{name: "number", className: "keypad-digit"},
		{name: "subtext", className: "keypad-letters"}
	],
	events: {
		onButtonDown: "virtualDown",
		onButtonUp: "virtualUp",
		onmousehold: "virtualHold"
	},
	create: function() {
		this.inherited(arguments);
		this.numberChanged();
		this.subtextChanged();
		this.numberFontSizeChanged();
		this.subtextShowingChanged();
	},
	
	// optimization
	// event handlers are here only to block event propogation
	mousedownHandler: function(inSender) {
		this.doButtonDown(inSender);
		this.inherited(arguments);
		return true;
	},
	mouseupHandler: function(inSender) {
		this.doButtonUp(inSender);
		this.inherited(arguments);
		return true;
	},
	clickHandler: function() {
		this.inherited(arguments);
		return true;
	},
	mouseoverHandler: function() {
		this.inherited(arguments);
		return true;
	},
	
	numberChanged: function() {
		this.$.number.setContent(this.number);
	},
	numberFontSizeChanged: function() {
		this.$.number.applyStyle("font-size", this.numberFontSize);
	},
	subtextChanged: function() {
		this.$.subtext.setContent(this.subtext);
	},
	subtextShowingChanged: function() {
		this.$.subtext.setShowing(this.subtextShowing);
	}
});