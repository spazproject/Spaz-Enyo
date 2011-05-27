/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A special <a href="#enyo.Dialog">Dialog</a> designed to prompt the user to answer a question 
affirmatively or negatively. It displays a title and message, along with accept and cancel buttons.

The title, message, acceptButtonCaption, and cancelButtonCaption can all be set as needed.

The onAccept and onCancel events are fired when the user clicks the accept 
and cancel buttons, respectively.
	
Here's an example:

	{
		kind: "DialogPrompt",
		title: "Mood Prompt",
		message: "Are you having a good day?",
		acceptButtonCaption: "Yes",
		cancelButtonCaption: "No",
		onAccept: "fetchMoreWork",
		onCancel: "fetchABreak"
	}
*/
enyo.kind({
	name: "enyo.DialogPrompt",
	kind: enyo.Dialog,
	scrim: true,
	published: {
		title: "",
		message: "",
		acceptButtonCaption: enyo._$L("OK"),
		cancelButtonCaption: enyo._$L("Cancel")
	},
	events: {
		onAccept: "",
		onCancel: ""
	},
	//* @protected
	components: [
		{name: "client", className: "enyo-dialog-inner", components: [
			{name: "title", className: "enyo-dialog-prompt-title"},
			{className: "enyo-dialog-prompt-content", components: [
				{name: "message", className: "enyo-dialog-prompt-message"},
				{name: "acceptButton", kind: "Button", onclick: "acceptClick"},
				{name: "cancelButton", kind: "Button", onclick: "cancelClick"}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.validateComponents();
		this.titleChanged();
		this.messageChanged();
		this.acceptButtonCaptionChanged();
		this.cancelButtonCaptionChanged();
	},
	//* @public
	open: function(inTitle, inMessage, inAcceptButtonCaption, inCancelButtonCaption) {
		if (inTitle) {
			this.setTitle(inTitle);
		}
		if (inMessage) {
			this.setMessage(inMessage);
		}
		if (inAcceptButtonCaption) {
			this.setAcceptButtonCaption(inAcceptButtonCaption);
		}
		if (inCancelButtonCaption !== undefined) {
			this.setCancelButtonCaption(inCancelButtonCaption);
		}
		this.inherited(arguments);
	},
	//* @protected
	titleChanged: function() {
		this.$.title.setContent(this.title);
		this.$.title.setShowing(this.title);
	},
	messageChanged: function() {
		this.$.message.setContent(this.message);
	},
	acceptButtonCaptionChanged: function() {
		this.$.acceptButton.setCaption(this.acceptButtonCaption);
	},
	cancelButtonCaptionChanged: function() {
		this.$.cancelButton.setCaption(this.cancelButtonCaption);
		this.$.cancelButton.setShowing(this.cancelButtonCaption);
	},
	acceptClick: function() {
		this.doAccept();
		this.close();
	},
	cancelClick: function() {
		this.doCancel();
		this.close();
	}
});
