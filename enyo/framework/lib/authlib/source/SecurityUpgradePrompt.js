/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */

enyo.kind({
	name: "SecurityUpgradePrompt",
	kind: enyo.ModalDialog,
	modal: true,
	published: {
		policy: ""
	},
	events: {
		onPin: "",
		onPassword: "",
		onCancel: ""
	},
	components: [
		{className: "enyo-dialog-prompt-content", components: [
			{name: "message", className: "enyo-dialog-prompt-message"},
			{name: "pinButton", kind: "Button", className:"enyo-button-affirmative", caption: rb_auth.$L("Set Pin"), onclick:"selectPin"},
			{name: "passwordButton", kind: "Button", className:"enyo-button-affirmative", caption: rb_auth.$L("Set Password"), onclick:"selectPassword"},
			{name: "cancelButton", kind: "Button", caption: rb_auth.$L("Cancel"), onclick:"cancel"}
		]}
	],
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
	},
	cancel: function() {
		this.doCancel();
		this.close();
	}
});