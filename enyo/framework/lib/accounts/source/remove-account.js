/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// This provides a "Remove Account" button, and the supporting logic
//
// Usage:
// ======
//
// Depends:
// Add this line to your app's depends.js file:
// "$enyo-lib/accounts/"
//
// Kind:
// {kind: "Accounts.RemoveAccount", name: "removeAccountButton", onAccountsRemove_Done: "goBack"}
//
// Initialize the button:
// If no capability is specified then the entire account will be deleted when the "Remove Account" button is tapped
// Otherwise just the specified capability will be disabled (unless it is the last enabled capability in which case
// the entire account will be deleted.
// this.$.removeAccountButton.init(account, capability) 
//
// The callback:
// goBack: function() {
//		this.$.pane.selectViewByName("prefsAndAccounts");


enyo.kind({
	name: "Accounts.RemoveAccount",
	kind: "Control",
	published: {
		disabled: false,
	},
	events: {
		onAccountsRemove_Done: "",
		onAccountsRemove_Removing: ""
	},
	className:"accounts-modify",
	components: [
		{kind: "ActivityButton", name: "removeAccountButton", label: AccountsUtil.BUTTON_REMOVE_ACCOUNT, className: "enyo-button-negative accounts-btn", onclick: "confirmAccountRemoval"},
		{name: "removeConfirmDialog", kind: "ModalDialog", caption: AccountsUtil.BUTTON_REMOVE_ACCOUNT, modal: true, scrim: true, components: [
			{content: AccountsUtil.TEXT_REMOVE_CONFIRM, className:"enyo-paragraph"},
			{kind:"HFlexBox", components:[
				{kind: "Button", caption: AccountsUtil.BUTTON_KEEP_ACCOUNT, id:"button-entrymodify-keep", flex:0.8, className:"enyo-button-light", onclick: "keepAccount"},
				{kind: "Button", caption: AccountsUtil.BUTTON_REMOVE_ACCOUNT, id:"button-entrymodify-remove", flex:1, className: "enyo-button-negative", onclick: "removeAccount"}
			]}
		]},
		{name: "modifyAccount", kind: "PalmService", service: enyo.palmServices.accounts, method: "modifyAccount", onResponse: "removeDone"},
		{name: "deleteAccount", kind: "PalmService", service: enyo.palmServices.accounts, method: "deleteAccount", onResponse: "removeDone"}
	],
	
	init: function(account, capability) {
		// Stop the spinner on the "Remove Account" button
		this.$.removeAccountButton.active = false;
		this.$.removeAccountButton.activeChanged();
		// Enable the button
		AccountsUtil.disableControl(this.$.removeAccountButton, this.disabled);
		
		// Save the account information and capability
		this.capability = capability;
		this.account = account;
	},
	
	disableButton: function(disable) {
		// Do not change the button state if it is disabled
		if (!this.disabled)
			AccountsUtil.disableControl(this.$.removeAccountButton, disable);
	},
	
	setDisabled: function(disable) {
		this.disable = disable;
		AccountsUtil.disableControl(this.$.removeAccountButton, disable);
	},

	confirmAccountRemoval: function() {
		// Open the "remove confirm" dialog
		this.$.removeConfirmDialog.openAtCenter();
	},
	
	keepAccount: function() {
		// Close the dialog
		this.$.removeConfirmDialog.close();
	},

	// The "Remove Account" button in the "remove confirm" dialog was tapped
	removeAccount: function() {
		// Close the dialog
		this.$.removeConfirmDialog.close();

		// Start the spinner on the button and disable it
		this.$.removeAccountButton.active = true;
		this.$.removeAccountButton.activeChanged();
		AccountsUtil.disableControl(this.$.removeAccountButton, true);
		
		// Let the caller know that the account is being deleted so that controls can be disabled
		this.doAccountsRemove_Removing();
		
		// If no capability was specified then this is the Accounts app, and the account must be deleted
		if (!this.capability) {
			this.$.deleteAccount.call({accountId:this.account._id});
		}
		else {
			// This was called from a PIM app.  Remove only that capability from the account
			// Reduce the array of capabilities to only those that are enabled
			var enabledCapabilities = [];
			for (var i=0, l=this.account.capabilityProviders.length; i<l; i++) {
				var c = this.account.capabilityProviders[i];
				// Remove this capability from the array of capabilities.  This will disable it
				if (c.capability === this.capability)
					continue;
	
				// Keep capabilities enabled if they were before
				if (c._id)
					enabledCapabilities.push({"id":c.id});
			}
			
			// If there are no capabilities enabled then delete the account
			if (!enabledCapabilities.length) {
				this.$.deleteAccount.call({accountId:this.account._id});
			}
			else {
				// Remove this capability from the account
				var param = {
					"accountId": this.account._id,
					"object": {
						capabilityProviders: enabledCapabilities
					}
				}
				this.$.modifyAccount.call(param);
			}
		}
	},
	
	removeDone: function() {
		// Stop the spinner on the "Remove Account" button
		this.$.removeAccountButton.active = false;
		this.$.removeAccountButton.activeChanged();
		
		this.doAccountsRemove_Done();
	}
});
