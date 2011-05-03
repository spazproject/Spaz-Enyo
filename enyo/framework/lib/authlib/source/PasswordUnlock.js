/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "PasswordUnlock",
	kind: enyo.VFlexBox,
	events: {
		onCancelClick: ""
	},
	published: {
		securityPolicyState: "none"
	},	
	components: [
		{name: "label", content: $L("Phone Locked"), style: "text-align: center; color: white; width: 100%; font-size: 26px;"},			
		{kind: "Group", caption: $L("ENTER PASSWORD"),  components: [
			{name: "passwordInput", kind: "PasswordInput",  focused: true, hint: ""},
		]},
		{name: "errorMsg", style: "text-align: left; color: yellow; width: 100%; font-size: 16px; padding: 12px", showing: false},
		{name: "groupButton", layoutKind: "HFlexLayout", defaultKind: "Button", components: [
			{name: "buttonCancel", flex: 1, pack: "center", layoutKind: "VFlexLayout", caption: $L("Cancel"), onclick: "cancel", className: "pin-menu-button"},
			{flex: 1, layoutKind: "VFlexLayout", pack: "center", caption: $L("Done"), onclick: "unlock", className: "pin-menu-button"}
		]},		
				
		{name: "matchDevicePasscode", kind:"PalmService", service:"palm://com.palm.systemmanager/", method:"matchDevicePasscode", onResponse: "devicePasswordVerifyResponse"},
		{name: "updatePinAppState", kind:"PalmService", service:"palm://com.palm.systemmanager/", method:"updatePinAppState"},					
	],
	rendered: function() {
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
			this.$.updatePinAppState.call({state: 'unlock'});
			this.reset();
		} else {
			this.$.errorMsg.setShowing(true); 
						
			// TODO: Need to check response.lockedOut === true? Then initiate device reset?
			if (this.securityPolicyState === "active" && response.retriesLeft > 0) {
				if (response.retriesLeft === 1) {
					this.$.errorMsg.setContent($L("If you enter an incorrect PIN now your phone will be erased."));
				}
				else {
					var t = new enyo.g11n.Template($L("1#Incorrect passcode. One try remaining.|#Incorrect passcode. #{tries} tries remaining.")); 
					var str = t.formatChoice(response.retriesLeft, {tries: enyo.application.Utils.numberToWord(response.retriesLeft)});	
					this.$.errorMsg.setContent(str);		
				}
			} else {
				if (response.lockedOut) {
					this.$.errorMsg.setContent($L('Phone Locked.  Try Again Later.'));
				}
				else {
					this.$.errorMsg.setContent($L('Try Again'));
				}				
			}			
		}		
	}
});