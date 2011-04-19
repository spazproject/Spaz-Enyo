/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A box that shows or hides a check mark when clicked.
The onChange event is fired when it is clicked. Use getChecked() to fetch
the checked status.

	{kind: "CheckBox", onChange: "checkboxClicked"}

	checkboxClicked: function(inSender) {
		if (inSender.getChecked()) {
			 this.log("I've been checked!");
		}
	}
*/
enyo.kind({
	name: "enyo.CheckBox",
	kind: enyo.Button,
	cssNamespace: "enyo-checkbox",
	className: "enyo-checkbox",
	published: {
		checked: false
	},
	events: {
		/**
		The onChange event fires when the user checks or unchecks the checkbox,
		but not when the state is changed programmatically.
		*/
		onChange: ''
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.checkedChanged();
	},
	captionChanged: function() {
	},
	checkedChanged: function() {
		this.stateChanged("checked");
	},
	mousedownHandler: function(inSender, e, node) {
		if (!this.disabled) {
			this.setChecked(!this.checked);
			this.doChange();
		}
	},
	mouseupHandler: function(inSender, e, node) {
	},
	mouseoutHandler: function(inSender, e, node) {
		this.setHot(false);
	}
});
