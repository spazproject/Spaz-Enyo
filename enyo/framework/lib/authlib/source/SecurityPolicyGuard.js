/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// main entry point for security policy stuff
enyo.kind({name: "SecurityPolicyGuard", 
			kind: "Control", 
			height:"0px",
			width: "100%",
			events: {
				onSuccess: "",
				onFailure: "",
				onCancel: ""
			},
			published: {
				policy: ""
			},
			components: [
			    {kind:"Popup", name: "secPops",  lazy:false, width:"360px", height:"360px",  className: "cust-enyo-popup",  components: [
			        {kind: enyo.VFlexBox, width: "320px", height: "325px", components: [                                                           	
				        {name:"pane", flex:1, kind:"Pane", transitionKind:enyo.transitions.Simple, height:"100%", components:[
			     			{name:"blank"},
			     			{name:"pinUnlock", kind: "PinUnlock", onCancelClick: "cancelLogin", onSetPinSuccess: "setPinSuccess"}
		     			]}
			        ]}
			    ]},
			             
	            // Dialogs
	            {name:"securityUpgradePrompt", lazy:false, kind:"SecurityUpgradePrompt", onPin:"choosePin", onPassword:"choosePassword", onCancel: "cancelUpgrade"},
	     		{name:"setPasswordDialog", lazy:false, kind:"SetPasswordDialog", onDone:"setPassword", onCancel:"cancelLogin"}
			],
			setSecurityPolicy: function(policyToLoad) {
				this.$.pinUnlock.reset();
				this.$.pinUnlock.setPinSet(true);
				this.$.secPops.openAtCenter();
			},
			
			policyChanged: function(){
				this.pendingSecurityPolicy = this.policy;
				
				if (this.lockMode !== "none") {
					this.$.securityUpgradePrompt.setCaption(rb_auth.$L("Device Password Upgrade Required")); 
				} else {
					this.$.securityUpgradePrompt.setCaption(rb_auth.$L("Device Password Required"));
				}
				this.$.securityUpgradePrompt.setPolicy(this.pendingSecurityPolicy);
				this.$.securityUpgradePrompt.openAtCenter();
			},
			
			cancelLogin: function() {
				this.$.secPops.close();
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
				this.$.setPasswordDialog.openAtCenter();
			},
			setPassword: function(inSender, response) {
				this.doSuccess()
				this.$.secPops.close();
			},
			cancelUpgrade: function() {
				this.$.secPops.close();
				this.doCancel();
			}
});
