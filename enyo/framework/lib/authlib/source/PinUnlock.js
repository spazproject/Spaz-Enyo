/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "PinUnlock",
	kind: enyo.VFlexBox,
	published: {
		pinSet: false,
		subtext: ".",
		securityPolicyState: "none"
	},
	events: {
		onCancelClick: "",
		onSetPinSuccess: "",
		onPinVerified:""
	},
	components: [
		{name: "label", height:"30px", components: [
			{name: "Text", content: rb_auth.$L("Phone Locked"), style: "font-family: Prelude Medium; font-size: 20px; text-align: center; color: white; weight: bold;"},
			{name: "subText", content: rb_auth.$L("Enter PIN"), style: "font-size: 18px;  color: grey;  text-align: center;"},
			{name: "pinForm", components: [
				{name: "pinDisplay", content: " ", style: "font-size: 26px; text-align: center; color: white; weight: bold; line-height:20px;"}
			]},
		]},			
		{kind: "PinDialpad", flex: 1, onNumberAdded: "handleButtonClick", onHandleDelete: "handleBackspace"},			
		{name: "groupButton", layoutKind: "HFlexLayout", defaultKind: "Button", components: [
			{name: "buttonCancel", flex: 1, pack: "center", layoutKind: "VFlexLayout", caption: rb_auth.$L("Cancel"), onclick: "onCancel", height: "40px"},
			{flex: 1, layoutKind: "VFlexLayout", pack: "center", caption: rb_auth.$L("Done"), onclick: "unlock", height: "40px", className:"enyo-button-affirmative"}
		]},
		{className: "firstuse-bottom-corners"},		
		
		//{name: "popEmergencyMenu", kind: "EmergencyPopupMenu"},
		{name: "matchDevicePasscode", kind:"PalmService", service:"palm://com.palm.systemmanager/", method:"matchDevicePasscode", onSuccess: "", onFailure: ""},
		{name: "sysmanagerService", kind:"PalmService", service:"palm://com.palm.systemmanager/", subscribe: true, onSuccess: "", onFailure: ""},
		{name: "lastChanceAlert", kind: "DialogPrompt", 
			title: rb_auth.$L("Warning"),
			message: rb_auth.$L("If you enter an incorrect PIN now your phone will be erased."),
			acceptButtonCaption: rb_auth.$L("OK"),
			cancelButtonCaption: null,
			modal: true
		},
	],
	
	create: function(){
		this.inherited(arguments);
		this.maxPinLength = 29; // max length of the PIN
		this.minPinLength = 4; 
		this.pin = ""; 
		this.pinSetChanged();
		this.verifyPin = "";
		
		this.$.lastChanceAlert.$.acceptButton.addClass("enyo-button-affirmative");
		console.log("### done creating pinScene");
		// TODO: Do we need to query to figure out if there is only 1 retry remaining and set this.onlyOneRetryRemaining?
		//      (This is for the case when the user is in this state and the devices soft resets...)
	},
	
	pinSetChanged: function() {
		console.log("### pinSetChanged!!!!!");
		if (this.pinSet){
			console.log("### we need to enter a new pin!!!!!");
			this.$.Text.setContent(rb_auth.$L("Enter new PIN"));
			this.$.subText.setContent(" ");		
		} else {
			console.log("### pin already in place. this phone is locked!!!!!");
			this.$.Text.setContent(rb_auth.$L("Phone Locked"));
			
			if (this.onlyOneRetryRemaining === true) {
				this.$.subText.setContent(rb_auth.$L("Final Try"));
				this.$.lastChanceAlert.open();
			} else {
				this.$.subText.setContent(rb_auth.$L("Enter PIN"));
			}
		}
	}, 
	unlock: function() {	
		if (this.pinSet) {
			this.setPin(); 
		}
		else {
			if (this.pin && this.pin.length > 0) {
				this._timer = Date.now();
				this.$.matchDevicePasscode.call({
					passCode: this.pin
				}, {
					onResponse: "devicePinVerifyResponse"
				});
				this.reset();
			}
		}
	},
	handleButtonClick: function(e, value){	
		if (value) {
			if (this.pin.length < this.maxPinLength) {
				this.pin = this.pin + value;
			}
			this.updatePinDisplay();
		}
	},	
	handleBackspace: function () {
		if (this.pin.length > 0) {
			this.pin = this.pin.slice(0, -1);
			this.updatePinDisplay();
		}				
	}, 		
	updatePinDisplay: function() {
		var maskString = this.pin.replace(/./g,'.');
		this.$.pinDisplay.setContent(maskString);
        if(this.setPin){
			this.$.subText.setContent(" ");	
		}else if (this.pin){ 
			if( this.pin.length > 0) {
				this.$.subText.setContent(" ");	
			}else{
				this.$.subText.setContent(rb_auth.$L("Enter PIN"));
			}
		}		
	},
	
	setPin: function() {
		if (!this.verifyPin) {
			this.verifyPin = this.pin;
			this.$.Text.setContent(rb_auth.$L("Enter PIN again"));
			this.$.subText.setContent(" ");
			this.pin = "";
			this.updatePinDisplay();
		} else {
			if (this.verifyPin == this.pin) {
				this.$.sysmanagerService.call({
					passCode: this.pin,
					lockMode: "pin"
				},{
					method: 'setDevicePasscode',
					onSuccess: "onSetPin",
					onFailure: "onSetPinFailure"	
				});
			} else {
				this.verifyPin = "";
				this.pin = "";
				this.$.Text.setContent(rb_auth.$L("PIN numbers don't match"));
				this.$.subText.setContent(rb_auth.$L("Try Again"));
                this.$.pinDisplay.setContent(" ");
			}
		}
	}, 

	devicePinVerifyResponse: function(inSender, response){
		this.log("------------devicePinVerifyResponse: ",enyo.json.stringify(response, undefined, 2)); 
		if (response.returnValue) {
			this.log("time to get response: " + (Date.now() - this._timer))
			this.doPinVerified();
			this.onlyOneRetryRemaining = false;
		}else{
			this.$.Text.setContent(rb_auth.$L("PIN incorrect"));
			
			// TODO: Need to check response.lockedOut === true? Then initiate device reset?
			if (this.securityPolicyState === "active" && response.retriesLeft > 0) {
				if (response.retriesLeft === 1) {
					// Show Last Chance Warning Message
					this.onlyOneRetryRemaining = true;
					this.$.subText.setContent(rb_auth.$L("Final Try"));
					this.$.lastChanceAlert.open();
				}
				else {
					var t = new enyo.g11n.Template(rb_auth.$L("1#One try remaining|##{tries} tries remaining")); 
					var str = t.formatChoice(response.retriesLeft, {tries: this.numberToWord(response.retriesLeft)});
					this.$.subText.setContent(str);
				}
			} else {
				if (response.lockedOut) {
					this.$.Text.setContent(rb_auth.$L('Phone Locked'));
					this.$.subText.setContent(rb_auth.$L('Try Again Later'));
				}
				else {
					this.$.subText.setContent(rb_auth.$L('Try Again'));
				}				
			}
		}		
	}, 
	
	onSetPin: function(inSender, response) {
		console.log("### set pin success");
		this.doSetPinSuccess();
		console.log("onSetPin"+enyo.json.stringify(response, undefined, 2)); //todo: rui: take me out later		
		this.reset();
	}, 
	
	onSetPinFailure: function(inSender, response) {
this.log(enyo.json.stringify(response, undefined, 2)); //temp log to track a policy issue		
		this.setErrorMessage(rb_auth.$L("Passcode does not match security requirements."));
	},
	
	// resets and sets error message, if one defined
	setErrorMessage: function(message) {
		this.$.Text.setContent(message || '');
		this.$.subText.setContent(rb_auth.$L("Please try again"));
		this.reset();		
	},	
	
	reset: function() {
		this.pin = "";
		this.verifyPin = "";
		this.updatePinDisplay();	
	},
	
	onCancel: function() {	
		this.reset();
		this.doCancelClick();
	}, 

	translateKey: function(c) {
		switch (c) {
			case 'e':
			case 'E':
				return '1';
			case 'r':
			case 'R':
				return '2';
			case 't':
			case 'T':
				return '3';
			case 'd':
			case 'D':
				return '4';
			case 'f':
			case 'F':
				return '5';
			case 'g':
			case 'G':
				return '6';
			case 'x':
			case 'X':
				return '7';
			case 'c':
			case 'C':
				return '8';
			case 'v':
			case 'V':
				return '9';
			case '@':
				return '0';
			default:
				return c;
		}
	},
	
	//physical keyboard button keydown
	keydown: function(e) {
		var value = this.translateKey(enyo.application.Utils.keyFromEvent(e));
		switch (value) {
			case '\b':
				this.handleBackspace();
				break;
			case '\r':
				this.unlock();
				break;
			case '0': case '1': case '2': case '3': case '4':
			case '5': case '6': case '7': case '8': case '9':
				this.handleButtonClick(null, value);
				break;
		}
	},
	numberToWord: function(number){
		var word=[rb_auth.$L('Zero'),rb_auth.$L('One'),rb_auth.$L('Two'), rb_auth.$L('Three'),rb_auth.$L('Four'),rb_auth.$L('Five'),rb_auth.$L('Six'),rb_auth.$L('Seven'),rb_auth.$L('Eight'),rb_auth.$L('Nine')];
		return word[number];
	}
});