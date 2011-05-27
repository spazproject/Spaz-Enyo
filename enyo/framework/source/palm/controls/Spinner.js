/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that displays a spinner animation to indicate that activity is taking place.

It's typical to show and hide the spinner to indicate activity. The spinner animation 
will automatically start when the spinner is shown. It's also possible to call start
and stop to control the animation directly.

For example, to show a spinner while a service response is being requested:

	components: [
		{kind: "PalmService", onResponse: "serviceResponse"},
		{kind: "Button", caption: "Call Service", onclick: "buttonClick"},
		{kind: "Spinner"}
	],
	buttonClick: function() {
		this.$.service.call();
		this.$.spinner.show();
	},
	serviceResponse: function() {
		this.$.spinner.hide();
	}

Note, extra care must be taken to use a Spinner in a list item. The spinner animation must be started
manually, asynchronous to list rendering. It's possible to do this as follows:

setupRow: function(inSender, inIndex) {
	if (this.data[inIndex].busy) {
		enyo.asyncMethod(this, "startSpinner", inIndex);
	}
},
startSpinner: function(inIndex) {
	this.$.list.prepareRow(inIndex);
	this.$.spinner.show();
}
*/
enyo.kind({
	name: "enyo.Spinner", 
	kind: enyo.AnimatedImage,
	className: "enyo-spinner",
	easingFunc: enyo.easing.linear,
	showing: false,
	imageHeight: 32,
	imageCount: 12,
	//* @protected
	repeat: -1,
	// FIXME: start/stop spinning on showing change
	// but need to do after animation properties are set, which is
	// after showingchanged is called.
	rendered: function() {
		this.inherited(arguments);
		this.disEnableAnimation(this.showing);
	},
	disEnableAnimation: function(inEnable) {
		this[inEnable ? "start" : "stop"]();
	},
	showingChanged: function(inOldValue) {
		this.inherited(arguments);
		if (inOldValue !== undefined) {
			this.disEnableAnimation(this.showing);
		}
	}
});

/**
 A control that displays a large spinner animation to indicate that activity is taking place.
 */
enyo.kind({
	name: "enyo.SpinnerLarge", 
	kind: enyo.Spinner,
	className: "enyo-spinner-large",
	imageHeight: 128
});