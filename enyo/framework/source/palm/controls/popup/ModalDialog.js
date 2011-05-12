/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
The ModalDialog is a standard modal dialog for core applications, and comes with a stylized header.

Usage:
-----
 Kind:
 -----
 	{kind: "ModalDialog", caption: "Dialog Title"}

*/

enyo.kind({
	name: "enyo.ModalDialog",
	kind: enyo.Popup,
	className: "enyo-popup enyo-modaldialog",
	scrim: true,
	modal: true,
	published: {
		caption: ""
	},
	chrome: [
		{className: "enyo-modaldialog-container", components: [
			{name: "modalDialogTitle", className: "enyo-text-ellipsis enyo-modaldialog-title"},
			{name: "client", className: "enyo-modaldialog-content"}
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
