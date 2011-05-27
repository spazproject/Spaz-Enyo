/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that looks like a switch with labels for two states. Each time a ToggleButton is tapped,
it switches its state and fires an onChange event.

	{kind: "ToggleButton", onLabel: "foo", offLabel: "bar", onChange: "buttonToggle"}

	buttonToggle: function(inSender, inState) {
		this.log("Toggled to state" + inState);
	}

To find out the state of the button, use getState:

	queryToggleState: function() {
		return this.$.toggleButton.getState();
	}
*/
enyo.kind({
	name: "enyo.ToggleButton", 
	kind: enyo.Control,
	published: {
		state: false,
		onLabel: enyo._$L("On"),
		offLabel: enyo._$L("Off"),
		disabled: false
	},
	events: {
		/**
		The onChange event fires when the user changes the state of the toggle button, 
		but not when the state is changed programmatically.
		*/
		onChange: ""
	},
	className: "enyo-toggle-button",
	chrome: [
		{name: "labelOn", nodeTag: "span", className: "enyo-toggle-label-on", content: "On"},
		{name: "labelOff", nodeTag: "span", className: "enyo-toggle-label-off", content: "Off"}
	//	{name: "thumb", className: "enyo-toggle-thumb-off"}
	],
	//* @protected
	labels: {"true": "ON&nbsp;", "false": "OFF"},
	ready: function() {
		this.stateChanged();
		this.onLabelChanged();
		this.offLabelChanged();
		this.disabledChanged();
	},
	onLabelChanged: function() {
		this.$.labelOn.setContent(this.onLabel);
	},
	offLabelChanged: function() {
		this.$.labelOff.setContent(this.offLabel);
	},
	stateChanged: function() {
		this.setClassName("enyo-toggle-button " + (this.state ? "on" : "off"));
		this.$.labelOn.applyStyle("display", this.state ? "inline" : "none");
		this.$.labelOff.applyStyle("display", this.state ? "none" : "inline");
	},
	disabledChanged: function() {
		this.addRemoveClass("disabled", this.disabled);
		this.$.labelOn.addRemoveClass("enyo-disabled", this.disabled);
		this.$.labelOff.addRemoveClass("enyo-disabled", this.disabled);
	},
	updateState: function(inState) {
		if (!this.disabled) {
			this.setState(inState);
			this.doChange(this.state);
		}
	},
	clickHandler: function() {
		this.updateState(!this.getState());
	},
	flickHandler: function(inSender, inEvent) {
		if (Math.abs(inEvent.xVel) > Math.abs(inEvent.yVel)) {
			this.updateState(inEvent.xVel > 0);
		}
	},
	dragstartHandler: function(inSender, inEvent) {
		this._dx0 = inEvent.dx;
	},
	dragHandler: function(inSender, inEvent) {
		var d = inEvent.dx - this._dx0;
		if (Math.abs(d) > 15) {
			this.updateState(d > 0);
			this._dx0 = inEvent.dx;
		}
	},
	dragfinishHandler: function(inSender, inEvent) {
		inEvent.preventClick();
	}
});
