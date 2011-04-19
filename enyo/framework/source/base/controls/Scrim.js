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
	className: "enyo-scrim",
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
		if (inZIndex != undefined) {
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
	}
});

//* @protected
//
// Mock scrim instance exposing a subset of Scrim API. 
// After a call to 'show' or 'showAtZIndex', this object
// is replaced with a proper enyo.Scrim instance.
//
enyo.scrim = {
	make: function() {
		// FIXME:
		// Where to render this scrim is problematic.
		// We have no reference to find a 'root control', short
		// of enyo.master.
		// Simplest solution is to render the Scrim directly 
		// into a node in document.body.
		// Client code can make an enyo.Scrim inside a custom
		// container if necessary, but some framework objects
		// use enyo.scrim (e.g. Popup) and there is no hook
		// for customization.
		// One idea is that Popup create an enyo.Scrim in its 
		// rootParent, and use a caching scheme to prevent
		// proliferation.
		// Alternatively, show* could take a parent as an 
		// arguments and reposition the singleton scrim.
		var s = new enyo.Scrim({parentNode: document.body});
		s.renderNode();
		return s;
	},
	show: function() {
		// NOTE: replaces enyo.scrim (this) with an enyo.Scrim instance so this is only invoked once.
		enyo.scrim = enyo.scrim.make();
		enyo.scrim.show();
	},
	showAtZIndex: function(inZIndex) {
		enyo.scrim = enyo.scrim.make();
		enyo.scrim.showAtZIndex(inZIndex);
	},
	hideAtZIndex: enyo.nop,
	// in case somebody does this out of order
	hide: enyo.nop,
	destroy: enyo.nop
}