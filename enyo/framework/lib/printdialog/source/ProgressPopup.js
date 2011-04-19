/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "ProgressPopup",
	kind: enyo.Popup,
	scrim: true,
	modal: true,
	width: "351px",
	className: "enyo-popup print-dialog",
	published: {
	   caption: "",
	   message: "",
	   cancelOption: true
	},
	events: {
		onCancel: ""
	},
	components: [
		{name: "caption", content: "", flex: 1, className: "progress-caption"},
		{name: "message", content: "", className: "progress-message"},
		{name: "progressBar", kind: "ProgressBar", className: "progress-bar"},
		{kind: "VFlexBox", pack: 'justify', align: 'center', components: [
			{name: "cancelButton", kind: "Button", caption: "Cancel", onclick: "doCancel"}
		]}
	],
	
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.captionChanged();
		this.messageChanged();
		this.cancelOptionChanged();
	},
	
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
	},
	
	messageChanged: function() {
		this.$.message.setContent(this.message);
	},
	
	cancelOptionChanged: function() {
		this.$.cancelButton.setShowing(this.cancelOption);
	},
	
	clickCancelButton: function() {
		this.$.cancelButton.setDisabled(true);
		this.doCancel();
	},
	
	//* @public
	getProgressControl: function() {
		return this.$.progressBar;
	},
	
	//* @public
	showProgress: function(caption, message, cancelOption) {
		if (caption !== undefined) {
			this.setCaption(caption);
		}
		if (message !== undefined) {
			this.setMessage(message);
		}
		if (cancelOption !== undefined) {
			this.setCancelOption(cancelOption);
			this.$.cancelButton.setDisabled(false);
		}
		this.openAtCenter();
	}
});
