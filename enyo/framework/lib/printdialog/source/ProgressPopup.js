/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "ProgressPopup",
	kind: "ModalDialog",
	className: "enyo-popup enyo-modaldialog print-dialog",
	published: {
	   message: "",
	   cancelOption: true
	},
	events: {
		onCancel: ""
	},
	components: [
		{name: "message", content: "", className: "progress-message"},
		{name: "progressBar", kind: "ProgressBar", className: "progress-bar"},
		{kind: "VFlexBox", pack: 'justify', align: 'center', components: [
			{name: "cancelButton", kind: "Button", caption: "Cancel", onclick: "doCancel"}
		]}
	],
	
	//* @protected
	componentsReady: function() {
		this.inherited(arguments);
		this.messageChanged();
		this.cancelOptionChanged();
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
		// Make sure all components are created
		this.validateComponents();
		return this.$.progressBar;
	},
	
	//* @public
	showProgress: function(caption, message, cancelOption) {
		// Make sure all components are created
		this.validateComponents();
		
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
