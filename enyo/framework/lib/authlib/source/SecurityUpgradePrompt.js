/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */

enyo.kind({
	name: "SecurityUpgradePrompt",
	kind: enyo.Dialog,
	modal: true,
	published: {
		title: "",
		policy: ""
	},
	events: {
		onPin: "",
		onPassword: ""
	},
	components: [
		{name: "title", className: "enyo-dialog-prompt-title"},
		{className: "enyo-dialog-prompt-content", components: [
			{name: "message", className: "enyo-dialog-prompt-message"},
			{name: "pinButton", kind: "Button", className:"enyo-button-affirmative", caption: rb_auth.$L("Set Pin"), onclick:"selectPin"},
			{name: "passwordButton", kind: "Button", className:"enyo-button-affirmative", caption: rb_auth.$L("Set Password"), onclick:"selectPassword"}
		]}
	],
	titleChanged: function() {
		this.$.title.setContent(this.title);
	},
	policyChanged: function() {
		if (this.policy.password && this.policy.password.alphaNumeric === true) {
			this.$.pinButton.hide();
			this.$.message.setContent(rb_auth.$L("A security policy has been implemented for your Exchange ActiveSync account. You must set a device password in order to use it."));
		} else {
			this.$.message.setContent(rb_auth.$L("A security policy has been implemented for your Exchange ActiveSync account. You must set a password or PIN in order to use it."));
		}
	},
	selectPin: function() {
		this.doPin();
		this.close();
	},
	selectPassword: function() {
		this.doPassword();
		this.close();
	}
});