/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "PasswordUnlock",
	kind: enyo.Dialog,
	events: {
		onCancelClick: "",
		onPasswordVerified:""
	},
	published: {
		securityPolicyState: "none"
	},	
	components: [
		//{name: "label", content: rb_auth.$L("Phone Locked"), style: "text-align: center; color: white; width: 100%; font-size: 26px;"},
		{name: "errorMsg", style: "text-align: left; color: yellow; width: 100%; font-size: 22px; padding: 12px", showing: false},
		{kind: "Group", caption: rb_auth.$L("ENTER PASSWORD"),  components: [
			{name: "passwordInput", kind: "PasswordInput",  focused: true, hint: "",onkeypress:"handleKeyPress"},
		]},
		{name: "groupButton", layoutKind: "HFlexLayout", defaultKind: "Button", components: [
			{name: "buttonCancel", flex: 1, pack: "center", layoutKind: "VFlexLayout", caption: rb_auth.$L("Cancel"), onclick: "cancel", className: "pin-menu-button"},
			{flex: 1, layoutKind: "VFlexLayout", pack: "center", caption: rb_auth.$L("Done"), onclick: "unlock", className: "pin-menu-button"}
		]},		
				
		{name: "matchDevicePasscode", kind:"PalmService", service:"palm://com.palm.systemmanager/", method:"matchDevicePasscode", onResponse: "devicePasswordVerifyResponse"}					
	],
	open: function() {
		this.inherited(arguments);
		this.$.passwordInput.forceFocus();
	},
	unlock: function() {
		var value = this.$.passwordInput.getValue();
		if ( value ) {
			this.$.matchDevicePasscode.call({
				passCode: value
			});
		}
	},
	reset: function() {
		this.$.errorMsg.setContent('');
		this.$.errorMsg.setShowing(false);
		this.$.passwordInput.setValue('');
	},
	cancel: function() {
		this.reset();
		this.doCancelClick();
	},
	onEmergencyPopup: function() {
		this.$.popEmergencyMenu.openAt({left: 0, bottom: 24});			
	},	
	devicePasswordVerifyResponse: function(inSender, response){
		if (response.returnValue) {
			this.reset();
			this.doPasswordVerified();
		} else {
			this.$.errorMsg.setShowing(true); 
						
			// TODO: Need to check response.lockedOut === true? Then initiate device reset?
			if (this.securityPolicyState === "active" && response.retriesLeft > 0) {
				if (response.retriesLeft === 1) {
					this.$.errorMsg.setContent(rb_auth.$L("If you enter an incorrect PIN now your phone will be erased."));
				}
				else {
					var t = new enyo.g11n.Template(rb_auth.$L("1#Incorrect passcode. One try remaining.|#Incorrect passcode. #{tries} tries remaining.")); 
					var str = t.formatChoice(response.retriesLeft, {tries: this.numberToWord(response.retriesLeft)});	
					this.$.errorMsg.setContent(str);		
				}
			} else {
				if (response.lockedOut) {
					this.$.errorMsg.setContent(rb_auth.$L('Phone Locked.  Try Again Later.'));
				}
				else {
					this.$.errorMsg.setContent(rb_auth.$L('Try Again'));
				}				
			}	
			this.$.passwordInput.setValue('');
			this.$.passwordInput.forceFocus();
		}		
	},
	numberToWord: function(number){
		var word=[rb_auth.$L('Zero'),rb_auth.$L('One'),rb_auth.$L('Two'), rb_auth.$L('Three'),rb_auth.$L('Four'),rb_auth.$L('Five'),rb_auth.$L('Six'),rb_auth.$L('Seven'),rb_auth.$L('Eight'),rb_auth.$L('Nine')];
		return word[number];
	},
	handleKeyPress: function(inSender, inEvent) {
		if(inEvent && inEvent.keyCode == 13) {
			this.$.passwordInput.forceBlur();
			this.unlock();
		}
	}
});