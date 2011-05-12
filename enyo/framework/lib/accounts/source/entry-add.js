/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// This provides UI to add an account, including validation and turning capabilities on and off
// When this view is done the onAccountsUI_Done event will be sent to the calling app
//
// Usage:
// ======
//
// Depends:
// Add this line to your app's depends.js file:
// "$enyo-lib/accounts/"
//
// Kind:
// A capability (e.g. 'CONTACTS') can be specified here
// {kind: "AccountsUI", name: "AccountsView", capability: "CONTACTS", onAccountsUI_Done: "accountsDone"}
//
// Show the list of accounts the user can add:
// The templates parameter is optional; providing an array of templates the user can add will speed up display 
// this.$.AccountsView.AddAccount(templates, capability);
//
// The callback:
// accountsDone: function() {
//		this.$.pane.selectViewByName("prefsAndAccounts");

enyo.kind({
	name: "AccountsUI",
	kind: "Pane",
	flex:1,
	published: {
		capability:""
	},
	events: {
		onAccountsUI_Done: ""
	},
	components: [
		{kind: "Accounts.addAccountView", name: "addAccountView", onAddAccount_AccountSelected: "addSelectedAccount", onAddAccount_Cancel: "doAccountsUI_Done"},
		{kind: "Accounts.credentialView", name: "changeCredentialsView", onCredentials_ValidationSuccess: "validationSuccess", onCredentials_Cancel: "backHandler"},
		{kind: "Accounts.modifyView", name: "modifyAccountView", onModifyView_Success: "doAccountsUI_Done", onModifyView_Cancel: "doAccountsUI_Done"},
		{kind: "Accounts.crossAppUI", name:"customAccountsUI", onResult: "handleCustomUIResult"}
	],
	
	// "Add Account" button was tapped
	AddAccount: function(templates, capability) {
		if (!templates || !enyo.isArray(templates)) {
			throw "Expecting an array of templates to AddAccount";
		}
		this.capability = capability || this.capability;
		this.$.addAccountView.showAvailableAccounts(templates, this.capability);
		this.selectViewByName("addAccountView");
	},
	
	// User tapped on account to add.  Ask for credentials
	addSelectedAccount: function(inSender, template) {
		this.template = template;
		// Does this template have custom UI?
		if (template.validator.customUI) {
			this.$.customAccountsUI.launchCrossAppUI(template.validator.customUI, {mode:"create", template: template, capability: this.capability});
			this.selectViewByName("customAccountsUI");
		}
		else {
			this.$.changeCredentialsView.displayCredentialsView(template, this.capability);
			this.selectViewByName("changeCredentialsView");
		}
	},
	
	// Handle the validation response from the custom UI
	handleCustomUIResult: function(inSender, msg) {
		//console.log("handleCustomUIResult:" + enyo.json.stringify(msg));
		if (msg && msg.returnValue) {
			msg.template =  msg.template || this.template;
			msg.templateId = msg.template.templateId;
			this.$.modifyAccountView.displayCreateView(msg, msg.template, this.capability);
			this.selectViewByName("modifyAccountView");
		}
		else {
			// Return to the main accounts view
			this.doAccountsUI_Done();
		}
	},
	
	// User's credentials validated okay
	validationSuccess: function(inSender, validationResult) {
		if (!validationResult)
			return;
		//console.log("validationSuccess.  validation=" + enyo.json.stringify(validationResult));
		// Was the capability added to the account? (in which case there is nothing more to do here)
		if (validationResult.capabilityWasEnabled) {
			// Return to the main accounts view
			this.doAccountsUI_Done();
		}
		else {
			this.$.modifyAccountView.displayCreateView(validationResult, this.template, this.capability);
			this.selectViewByName("modifyAccountView");
		}
	},
	
	// Go back to the previous pane
	backHandler: function(inSender, e) {
		this.selectViewByName("addAccountView");
	},
});
