/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A <a href="#enyo.Popup">Popup</a> that displays a set of controls over other content.
A dialog attaches to the bottom of the screen and, when shown, 
animates up from the bottom of the screen.

To show a dialog asking the user to confirm a choice, try the following:

	components: [
		{kind: "Button", caption: "Confirm choice", onclick: "showDialog"},
		{kind: "Dialog", components: [
			{content: "Are you sure?"},
			{layoutKind: "HFlexLayout", pack: center, components: [
				{kind: "Button", caption: "OK", onclick: "confirmClick"},
				{kind: "Button", caption: "Cancel", onclick: "cancelClick"}
			]}
		]}
	],
	showDialog: function() {
		this.$.dialog.open();
	},
	confirmClick: function() {
		// process confirmation
		this.doConfirm();
		// then close dialog
		this.$.dialog.close();
	},
	cancelClick: function() {
		this.$.dialog.close();
	}
*/
enyo.kind({
	name: "enyo.Dialog",
	kind: enyo.Toaster,
	className: "enyo-toaster enyo-dialog",
	//* @protected
	components: [
		{name: "client", className: "enyo-dialog-inner"}
	]
});
