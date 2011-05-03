/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// main entry point for security policy stuff
enyo.kind({name: "SecurityPolicyGuard", 
			kind: "Control", 
			height:"0px",
			width: "100%",
			events: {
				onSuccess: "",
				onFailure: ""
			},
			published: {
				policy: ""
			},
			components: [
			    {kind:"Popup", name: "secPops", width:"360px", height:"400px",  components: [
			        {kind: enyo.VFlexBox, width: "320px", height: "380px", components: [                                                           	
				        {name:"pane", flex:1, kind:"Pane", transitionKind:enyo.transitions.Simple, height:"100%", components:[
			     			{name:"blank"},
			     			{name:"pinUnlock", kind: "PinUnlock", onCancelClick: "cancelLogin", onSetPinSuccess: "setPinSuccess"},
			     			{name:"passwordUnlock", kind: "PasswordUnlock", lazy:true, onCancelClick: "cancelLogin"}, 
			     			{name:"dialpad", kind:"Dialer", limited: true, lazy:true}
		     			]}
			        ]}
			    ]},
			             
	            // Dialogs
	            {name:"securityUpgradePrompt", kind:"SecurityUpgradePrompt", onPin:"choosePin", onPassword:"choosePassword"},
	     		{name:"setPasswordDialog", kind:"SetPasswordDialog", onDone:"setPassword", onCancel:"cancelLogin"},
	     		
	     		// service calls
	     		{name:"updatePinAppState", kind: enyo.PalmService, service:"palm://com.palm.systemmanager/", method:"updatePinAppState"},
			],
			setSecurityPolicy: function(policyToLoad) {
				this.$.pinUnlock.reset();
				this.$.pinUnlock.setPinSet(true);
				this.$.secPops.openAtCenter();
			},
			
			policyChanged: function(){
				this.pendingSecurityPolicy = this.policy;
				
				if (this.lockMode !== "none") {
					this.$.securityUpgradePrompt.setTitle($L("Device Password Upgrade Required")); 
				} else {
					this.$.securityUpgradePrompt.setTitle($L("Device Password Required"));
				}
				this.$.securityUpgradePrompt.setPolicy(this.pendingSecurityPolicy);
				this.$.securityUpgradePrompt.open();
			},
			
			cancelLogin: function() {
				this.$.secPops.close();
				this.$.updatePinAppState.call({state:"cancel"});
				this.doFailure()
			},			
			choosePin: function() {
				this.$.securityUpgradePrompt.close();
				this.$.pane.selectViewByName("pinUnlock",true);
				this.$.pinUnlock.setPinSet(true);
				this.$.secPops.openAtCenter();
			},
			
			setPinSuccess: function() {
				console.log("### set pin success");
				this.doSuccess()
				this.$.secPops.close();
			},
			choosePassword: function() {
				this.$.securityUpgradePrompt.close();
				this.log("-----------setting policy",this.pendingSecurityPolicy)
				this.$.setPasswordDialog.setPolicy(this.pendingSecurityPolicy.password);
				this.$.setPasswordDialog.open();
			},
			setPassword: function(inSender, response) {
				this.doSuccess()
				this.$.secPops.close();
				this.$.updatePinAppState.call({
					state: 'unlock'
				});
			}
});
