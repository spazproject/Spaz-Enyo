/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// Show the list of accounts
// Accounts that have templates marked hidden, or those without validators (as defined by the account template) are excluded
// Note: A watch is placed on the accounts list in mojoDB so the list will auto-update as accounts are added or deleted
//
// Usage:
// ======
//
// Depends:
// Add this line to your app's depends.js file:
// "$enyo-lib/accounts/"
//
// Kind:
// {kind: "Accounts.accountsList", name: "accountsList", onAccountsList_AccountSelected: "editAccount"}
//
// Populating the list of accounts
// Params: capability - capability to filter by (optional)
//         exclude - template to exclude (optional)
// this.$.accountsList.getAccountsList('CONTACTS', 'com.palm.palmprofile');
//
// The callback:
// editAccount: function(inSender, inResults) {
//		var account = inResults.account;	// The selected account
// 		var template = inResults.template;	// The template for the selected account 

enyo.kind({
	name: "Accounts.accountsList",
	kind: "VFlexBox",
	events: {
		onAccountsList_AccountSelected: "",
		onAccountsList_AddAccountTemplates: ""
	},
	components: [
		{name: "accounts", kind: "Accounts.getAccounts", onGetAccounts_AccountsAvailable: "onAccountsAvailable"},
		{name: "list", kind: "VirtualRepeater", onGetItem: "listGetItem", onclick: "accountSelected", components: [
			{kind: "Item", name: "Account", layoutKind: "HFlexLayout", className:"accounts-list-item", components: [
				{kind: "Image", name:"accountIcon", className:"icon-image"},
				{name: "accountName", className:"account-name"},
				{name: "emailAddress", className:"email-address"}
			]}
		]} 
	],
	
	// Generate the list of accounts
	getAccountsList: function (capability, exclude) {
		console.log("getAccountsList create: capability=" + capability + " exclude=" + enyo.json.stringify(exclude));
		this.$.accounts.getAccounts({capability: capability}, exclude);
	},
	
	// The list of accounts has been obtained.  Render the list now
	onAccountsAvailable: function(inSender, inResponse) {
		//console.log("onAccountsAvailable: Received account list. len=" + inResponse.accounts.length);
		this.accounts = inResponse.accounts;		
		this.$.list.render();
		
		// PIM apps may want the list of templates for their "Add" button
		this.doAccountsList_AddAccountTemplates(inResponse.templates);
	},

	// Render an item in the list
	listGetItem: function(inSender, inIndex) {
		if (!this.accounts || inIndex >= this.accounts.length)
			return false;
		var a = this.accounts[inIndex];
		if (a.icon && a.icon.loc_32x32) {
			this.$.accountIcon.src = a.icon.loc_32x32;
			this.$.accountIcon.srcChanged();
		}
		this.$.accountName.setContent(a.alias || a.loc_name);
		this.$.emailAddress.setContent(a.username);
		return true;
	},

	// An account has been tapped on.  Return the account information
	accountSelected: function(inSender, inEvent) {
		console.log("accountSelected:" + (this.accounts[inEvent.rowIndex].alias || this.accounts[inEvent.rowIndex].loc_name));
		this.doAccountsList_AccountSelected({account: this.accounts[inEvent.rowIndex]});
	}
});
