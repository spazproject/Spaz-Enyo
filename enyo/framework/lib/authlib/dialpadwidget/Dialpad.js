/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*globals enyo rb*/

rb_auth = new enyo.g11n.Resources({root: "$enyo-lib/authlib"});

enyo.kind({
	name: "Dialpad",
	kind: enyo.VFlexBox,
	events: {
		onNumberAdded: "", // called when clicked or by keypress
		onHandleDelete: "",
		onKeyHeld: ""
	},
	published: {
		useFeedback: undefined, // use dtmf
		feedbackOnly: undefined, // DON'T send dtmf code, just play sound (read only if useFeedback == true)
		subtextShowing: true,
		azertyKey: false 
	},   
	className: "dialpad-container",
	chrome: [
		{kind: "HFlexBox", flex: 1, height: "4px", defaultKind: "DialpadButton", components: [
			{number: "1", flex: 1, className: "dialpadbutton-top-left voicemail"},
			{number: "2", subtext: "ABC", flex: 1, className: "dialpadbutton-top-middle"},
			{number: "3", subtext: "DEF", flex: 1, className: "dialpadbutton-top-right"}
		]},
		{kind: "HFlexBox", flex: 1, defaultKind: "DialpadButton", components: [
			{number: "4", subtext: "GHI", flex: 1, className: "dialpadbutton-left"},
			{number: "5", subtext: "JKL", flex: 1, className: "dialpadbutton-middle"},
			{number: "6", subtext: "MNO", flex: 1, className: "dialpadbutton-right"}
		]},
		{kind: "HFlexBox", flex: 1, defaultKind: "DialpadButton", components: [
			{number: "7", subtext: "PQRS", flex: 1, className: "dialpadbutton-bottom-left"},
			{number: "8", subtext: "TUV", flex: 1, className: "dialpadbutton-bottom-middle"},
			{number: "9", subtext: "WXYZ", flex: 1, className: "dialpadbutton-botton-right"}
		]},
		{name: "client", flex: 1, layoutKind: "VFlexLayout"},
		
		{name: "playDialTone", kind: enyo.PalmService, service: "palm://com.palm.audio/dtmf/", method: "playDTMF", onSuccess: "", onFailure:""},
		{name: "stopDialTone", kind: enyo.PalmService, service: "palm://com.palm.audio/dtmf/", method: "stopDTMF", onSuccess: "", onFailure:""}
	],
	create: function() {
		this.inherited(arguments);
		this.subtextShowingChanged();
		this.ignoreFirstDtmf = true;
		this.virtualDownHoldTimout = 0;
		this.hasKeydownBeenReleased = true;

		// skip the first, likely inadvertently pressed, dtmf key events
		enyo.job("ignoreFirstDtmf", enyo.hitch(this, "ignoreFirstDtmfTimeout"), 2000);

		var deviceInfo = window.PalmSystem && JSON.parse(PalmSystem.deviceInfo);
		if (deviceInfo && deviceInfo.keyboardType) {
			if (deviceInfo.keyboardType === 'AZERTY' || deviceInfo.keyboardType === 'AZERTY_FR') {
				this.azertyKey = true; 
			}
		}
	},
	subtextShowingChanged: function() {
		var component;
		for (component in this.$) {
			component = this.$[component];
			if (component instanceof DialpadButton) {
				component.setSubtextShowing(this.subtextShowing);
			}
		}
	},
	//physical keyboard button keyup
	keyup: function(e) {
		this.hasKeydownBeenReleased = true;
		var keyValue = enyo.application.Utils.keyFromEvent(e); 	
		this.up(this.translateKey(keyValue));			
	},

	//physical keyboard button keydown
	keydown: function(e) {

		// hasKeydownBeenReleased is used to cancel out the multiple key down events from the HW keyboard
		if(this.hasKeydownBeenReleased == true) {
			this.hasKeydownBeenReleased = false;
	
			var value = this.translateKey(enyo.application.Utils.keyFromEvent(e));
			this.down(value);
		
			if(this.useFeedback && this.virtualDownHoldTimout == 0) {
				//on physical keyboard button hold we are getting multiple keydown events...			
				this.virtualDownHoldTimout = setTimeout(enyo.bind(this,"held", value), 500);
			}		
		}
	},

	virtualUp: function(e, event) {
		this.up(e.number || e.value);
	},
	
	virtualDown: function(e, event) {
		this.down(e.number || e.value);
	},
	
	virtualHold: function(e, event) {
		this.held(e.number || e.value);
		this.doKeyHeld(e.number || e.value); //for soft keypad key holding event				
	}, 
	
	//virtual keyboard button keyup
	up: function(value) {
		this.clearvirtualHoldTimout(value);
		return true; 
	},
	
	clearvirtualHoldTimout: function(value) {
		if ( this.useFeedback ) {
			//if ( this.virtualDownHoldTimout ) {
				clearTimeout(this.virtualDownHoldTimout);
				this.virtualDownHoldTimout = 0;
				var tone = enyo.application.Utils.isDTMFKey(value); 
				if (tone != "") {
					this.sendShortDTMF(null, tone);
				}
			//} else {
				this.endContinuousDTMF();
			//}
		}	
	}, 	
	
	//virtual keyboard button keydown
	down: function(value) {
		this.doNumberAdded(value);
		/*if ( this.useFeedback ) {
			// multiple keys
			clearTimeout(this.virtualDownHoldTimout);
			this.endContinuousDTMF();
		}*/
		return true; 
	},

	held: function(value) {
		this.sendContinuousDTMF(value);
	},

	translateKey:function(c){
		//console.log( "translateKey: " + c);
		switch (c){
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
			case 'z':
			case 'Z':
				return this.azertyKey ? "" : '*';
			case 'b':
			case 'B':
				return '#';
			case 'w': case 'W':
				if (this.azertyKey == true) {
					return this.dtmfMode ? "" : '*';
				}
				else {
					return this.dtmfMode ? "" : '+';
				}
			default:
				return this.dtmfMode ? "" : c; 
		}
	},
	
	// clear timeout used skip the first, likely inadvertently pressed, dtmf
	ignoreFirstDtmfTimeout: function() {
		console.log("ignoreFirstDtmfTimeout");
		this.ignoreFirstDtmf = false;
	},
    
	// TODO: 'assumes the id has the key at position 5' might be a bit workaroundish.
	sendShortDTMF: function(evt, tone){
		if (this.continuousDTMFInProgress === undefined || this.continuousDTMFInProgress === false) {
			// assumes the id has the key at position 5
			//console.log( "sendShortDTMF : " + tone);
			if (this.useFeedback && this.feedbackOnly) {
				 this.$.playDialTone.call({
				 		"id": String(tone),
				 		"oneshot": true,
				 		"feedbackOnly": this.feedbackOnly
		                        });//sendDTMF
                        } else {
	                        var held = false;
				enyo.application.CallSynergizer.callDtmf(tone, held);
			}
		}
	},
    
	sendContinuousDTMF: function(tone){
		if (this.continuousDTMFInProgress === undefined || this.continuousDTMFInProgress === false) {
			// assumes the id has the key at position 5
			this.continuousDTMFInProgress = true;
			//console.log( "sendContinuousDTMF : " + tone);
			if (this.useFeedback && this.feedbackOnly) {
				 this.$.playDialTone.call({
				 		"id": String(tone),
				 		"oneshot": false,
				 		"feedbackOnly": this.feedbackOnly
		                        });
			} else {
				var held = true;
				enyo.application.CallSynergizer.callDtmf(tone, held);
			}
		}

	},
    
	endContinuousDTMF: function() {
		if (this.continuousDTMFInProgress === true) {
			this.continuousDTMFInProgress = false;
			//console.log( "endContinuousDTMF");
			this.$.stopDialTone.call({});
			enyo.application.CallSynergizer.callDtmfEnd();

		}
	},

});

enyo.kind({
	name: "DtmfDialpad",
	kind: "Dialpad",
 	useFeedback: true,
	feedbackOnly: false,
	components: [
		{kind: "HFlexBox", flex: 1, defaultKind: "DialpadButton", components: [
			{number: "*", flex: 1, className: "dialpadbutton-left", numberFontSize: "52px"},
			{number: "0", subtext: "+", flex: 1, className: "dialpadbutton-middle"},
			{number: "#", flex: 1, className: "dialpadbutton-right"}
		]}
	],
	
	isDTMFKey: function(c) {
		c = this.translateKey(c);
		if (((c >= '0' && c <= '9') || c == '*' || c == '#') ) {
			return c;
		} else {
			return "";	
		}
	}
});

enyo.kind({
	name: "PhoneDialpad",
	kind: "Dialpad",
 	useFeedback: true,
  feedbackOnly: true, 
	className: "dialpad-container", 
	components: [
		{kind: "HFlexBox", flex: 1, defaultKind: "DialpadButton", components: [
			{number: "*", flex: 1, className: "dialpadbutton-left", numberFontSize: "52px"},
			{number: "0", subtext: "+", flex: 1, className: "dialpadbutton-middle"},
			{number: "#", flex: 1, className: "dialpadbutton-right"}
		]}
	]
});

enyo.kind({
	name: "PinDialpad",
	kind: "Dialpad",
	useFeedback: false,
	feedbackOnly: true,
	subtextShowing: false,
	components: [
		{kind: "HFlexBox", flex: 1, defaultKind: "DialpadButton", components: [
			{flex: 1, className: "dialpadbutton-bottom-left", disabled: true },
			{number: "0", flex: 1, className: "dialpadbutton-bottom-middle dialpadbutton-bottom-single"},
			{kind: "IconButton", flex: 1, value: "backspace", layoutKind: "VFlexLayout", pack: "center", className: "dialpadbutton-bottom-back dialpad-backspace",  icon:enyo.path.rewrite("$enyo-lib/authlib/images/dialpad-backspace.png"), onclick: "handleBackspace"}
		]}
	],
	create: function(){
		this.inherited(arguments);
	},	
	handleBackspace: function(){
		this.doHandleDelete(); 		
	}	
});
