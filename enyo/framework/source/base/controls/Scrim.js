/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A scrim is used to temporarily disable an application's user interface.
It covers the screen with a translucent layer.

It's possible to create a scrim in a components block, but this usage is not common. Typically, a scrim is
shown using enyo.scrim.show().

To show a scrim for 5 seconds:

	buttonClick: function() {
		enyo.scrim.show();
		setTimeout(enyo.scrim.hide, 5000);
	}
	
To show a scrim while a service is in flight:

	components: [
		{kind: "PalmService", onResponse: "serviceResponse"},
		{kind: "Button", caption: "Call Service", onclick: "buttonClick"}
	],
	buttonClick: function() {
		this.$.service.call();
		enyo.scrim.show();
	},
	serviceResponse: function() {
		enyo.scrim.hide();
	}

To show a scrim and then hide it when the user clicks on it:

	components: [
		{kind: "Button", caption: "Show scrim", onclick: "buttonClick"},
		{kind: "Scrim", onclick: "scrimClick"}
	],
	buttonClick: function() {
		this.$.scrim.show();
	},
	scrimClick: function() {
		this.$.scrim.hide();
	}
*/
enyo.kind({
	name: "enyo.Scrim",
	kind: enyo.Control,
	showing: false,
	className: "enyo-scrim enyo-popup-float",
	create: function() {
		this.inherited(arguments);
		this.zStack = [];
	},
	addZIndex: function(inZIndex) {
		if (enyo.indexOf(inZIndex, this.zStack) < 0) {
			this.zStack.push(inZIndex);
		}
	},
	removeZIndex: function(inControl) {
		enyo.remove(inControl, this.zStack);
	},
	showAtZIndex: function(inZIndex) {
		this.addZIndex(inZIndex);
		if (inZIndex !== undefined) {
			this.setZIndex(inZIndex);
		}
		this.show();
	},
	hideAtZIndex: function(inZIndex) {
		this.removeZIndex(inZIndex);
		if (!this.zStack.length) {
			this.hide();
		} else {
			var z = this.zStack[this.zStack.length-1];
			this.setZIndex(z);
		}
	},
	setZIndex: function(inZIndex) {
		this.zIndex = inZIndex;
		this.applyStyle("z-index", inZIndex);
	},
	make: function() {
		return this;
	}
});

//* @protected
//
// Scrim singleton exposing a subset of Scrim API. 
// After a call to 'show' or 'showAtZIndex', this object
// is replaced with a proper enyo.Scrim instance.
//
enyo.kind({
	name: "enyo.scrimSingleton",
	constructor: function(inName, inClassName) {
		this.instanceName = inName;
		enyo.setObject(this.instanceName, this);
		this.className = inClassName || "";
	},
	make: function() {
		// NOTE: scrim singleton is rendered in the popup layer, where all popups live.
		var s = new enyo.Scrim({parent: enyo.getPopupLayer()});
		s.addClass(this.className);
		enyo.setObject(this.instanceName, s);
		s.renderNode();
		return s;
	},
	show: function() {
		// NOTE: replaces enyo.scrim (this) with an enyo.Scrim instance so this is only invoked once.
		var s = this.make();
		s.show();
	},
	showAtZIndex: function(inZIndex) {
		var s = this.make();
		s.showAtZIndex(inZIndex);
	},
	// in case somebody does this out of order
	hideAtZIndex: enyo.nop,
	hide: enyo.nop,
	destroy: enyo.nop
});

new enyo.scrimSingleton("enyo.scrim");
new enyo.scrimSingleton("enyo.scrimTransparent", "enyo-scrim-transparent");
