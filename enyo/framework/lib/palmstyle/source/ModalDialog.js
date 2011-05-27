/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
The ModalDialog is a standard modal dialog for core applications, and comes with a stylized header.

Usage:
-----
 Depends:
 --------
 	Add this line to your app's depends.js file:
 	"$enyo-lib/palmstyle/"

 Kind:
 -----
 	{kind: "ModalDialog", caption: "Dialog Title"}

**/

// Note - I changed the name to ModalDialog from PalmPopup, because it makes more sense for its interaction

enyo.kind({
	name: "ModalDialog",
	kind: enyo.Popup,
	scrim: true,
	modal: true,
	width: "320px",
	published: {
		caption: ""
	},
	chrome: [
		{style: "margin: -4px", components: [
			{name: "modalDialogTitle", className: "enyo-text-ellipsis palm-modal-dialog-title"},
			{name: "client", className: "palm-modal-dialog-content"}
		]}
	],

	create: function() {
		this.inherited(arguments);
		this.caption = this.caption || this.label || this.content;
		this.captionChanged();
	},
	captionChanged: function() {
		this.$.modalDialogTitle.setContent(this.caption);
	}
});
