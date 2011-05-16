//modified to use our custom NumberButtons

/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */

enyo.kind({
	name: "Spaz.RadioButton",
	kind: "Spaz.NumberButton",
	flex: 1,
	className: "enyo-radiobutton",
	published: {
		value: "",
		depressed: false
	},
	events: {
		onmousedown: ""
	},
	//* @protected
	getValue: function() {
		return this.value || this.manager.indexOfControl(this);
	},
	clickHandler: function(inSender, e) {
		if (!this.disabled) {
			// if our manager is not our owner (i.e. if we are not RadioGroup chrome), he won't get this via normal dispatch
			// manager could also simply be watching mousedown himself, but it's more convenient for us to identify ourselves
			// as inSender
			this.dispatch(this.manager, "radioButtonClick");
			this.fire("onclick", e);
		}
	}
});
