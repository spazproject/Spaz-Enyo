/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind ({
	name: "SetPasswordDialog", 
	kind: enyo.Dialog,
	modal: true,
	published: {
		policy: ""
	},
	events: {
		onDone: "",
		onCancel: ""
	},
	components: [		
		{name: "title", content: rb_auth.$L("Set Password"), className: "enyo-dialog-prompt-title"},
		{name: "hint", className: "enyo-dialog-prompt-message"},
		{name: "error", showing: false},
		{name: "password", kind: "PasswordInput", hint: rb_auth.$L("enter password..."), onkeypress:"handleKeyPress"},
		{name: "passwordconfirm", kind: "PasswordInput", hint: rb_auth.$L("confirm password..."), onkeypress:"handleKeyPress"},
		{name: "acceptButton", content:rb_auth.$L("Done"), className:"enyo-button-affirmative", kind: "Button", onclick: "acceptClick"},
		{name: "cancelButton", content:rb_auth.$L("Cancel"), kind: "Button", onclick: "cancelClick"},
		{name: "setPassword", kind:"PalmService", service:"palm://com.palm.systemmanager/", method: "setDevicePasscode", onSuccess:"setPasswordSuccess", onFailure: "setPasswordFailure"}
	],
	policyChanged: function() {
		this.log(this.policy)
		if ( this.policy.alphaNumeric === true ) {
			if ( this.policy.minLength > 1 ) {
				this.$.hint.setContent((new enyo.g11n.Template(rb_auth.$L("Password must be #{len} or more characters long and contain both numbers and letters."))).evaluate({
					len: this.policy.minLength
				}));
			} else {
				this.$.hint.setContent(rb_auth.$L("Password must contain both numbers and letters."))
			}
		} else {
			if ( this.policy.minLength > 1 ) {
				// enyo.application.Utils.interpolate($L("Password must be #{len} or more characters long."),{len: this.policy.minLength})
				this.$.hint.setContent((new enyo.g11n.Template(rb_auth.$L("Password must be #{len} or more characters long."))).evaluate({
					len: this.policy.minLength
				}));
				//this.$.hint.setContent(rb_auth.$L("Password must be " + this.policy.minLength + " or more characters long."));
			}
		}
	},
	acceptClick: function() {
		if (this.$.password.getValue() !== this.$.passwordconfirm.getValue()){
			this.setErrorMessage(rb_auth.$L("Passwords do not match."));
			this.$.password.forceFocus();
		} else {
			this.$.setPassword.call({
				passCode: this.$.password.getValue(),
				lockMode: "password"
			});
		}
	},
	open: function() {
		this.inherited(arguments);
		this.$.password.forceFocus();
	},
	cancelClick: function(inSender) {
		this.setErrorMessage();
		this.doCancel();
		this.close();
	},
	setPasswordSuccess: function(inSender) {
		console.log("### set password success");
		this.setErrorMessage();
		this.doDone();
		this.close();
	},
	setPasswordFailure: function() {
		this.setErrorMessage(rb_auth.$L("Password does not match security requirements."));
		this.$.password.forceFocus();
	},
	// resets and sets error message, if one defined
	setErrorMessage: function(message) {
		this.$.password.setValue('');
		this.$.passwordconfirm.setValue('');
		this.$.error.setContent(message || '');
		this.$.error.setShowing(!!message);
	},
	
	handleKeyPress: function(inSender, inEvent) {
		if(inEvent && inEvent.keyCode == 13) {
			if(this.$.password.hasFocus())
				this.$.passwordconfirm.forceFocus();
			else if(this.$.passwordconfirm.hasFocus()) {
				this.$.passwordconfirm.forceBlur();
				this.acceptClick();	
			}
		}
	}
}); 
