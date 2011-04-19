/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A button that serves as a base control for <a href="#enyo.Picker">Picker</a>.
*/
enyo.kind({
	name: "enyo.PickerButton",
	kind: enyo.CustomButton,
	className: "enyo-custom-button enyo-picker-button",
	published: {
		focus: false
	},
	events: {
		onFocusChange: ""
	},
	chrome: [
		{name: "caption", className: "enyo-picker-button-caption"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.focusChanged();
	},
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
	},
	focusChanged: function() {
		this.stateChanged("focus");
		this.doFocusChange();
	}
});
