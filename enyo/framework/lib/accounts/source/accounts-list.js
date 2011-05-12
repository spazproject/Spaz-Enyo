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
//         dontDisplayErrors - don't display a yellow error triangle next to accounts with missing/bad credentials
// this.$.accountsList.getAccountsList('CONTACTS', 'com.palm.palmprofile');
//
// The callback:
// editAccount: function(inSender, inResults) {
//		var account = inResults.account;	// The selected account
// 		var template = inResults.template;	// The template for the selected account 

enyo.kind({
	name: "Accounts.accountsList",
	kind: enyo.Control,
	events: {
		onAccountsList_AccountSelected: "",
		onAccountsList_AddAccountTemplates: ""
	},
	components: [
		{name: "accounts", kind: "Accounts.getAccounts", onGetAccounts_AccountsAvailable: "onAccountsAvailable"},
		{name: "list", kind: "VirtualRepeater", onGetItem: "listGetItem", onSetupRow: "listGetItem", onclick: "accountSelected", className:"accounts-rowgroup-item", components: [
			{kind: "Item", name: "Account", layoutKind: "HFlexLayout", align:"center", className:"accounts-list-item", components: [
				{kind: "Image", name:"accountIcon", className:"icon-image"},
				{kind:"HFlexBox", style:"width:420px", align:"center", components:[
					{name: "accountName"},
					{name: "emailAddress", className:"email-address enyo-text-ellipsis", flex:1},
					{kind: "Image", name:"errorIcon", src: AccountsUtil.libPath + "images/header-warning-icon.png", className:"warning-icon"},
				]}
			]}
		]},
		{name: "getSyncStatus", kind: "TempDbService", dbKind: "com.palm.account.syncstate:1", subscribe: true, method: "find", onResponse: "receivedSyncStatus", onWatch: "syncWatchFired"},
	],
	
	// Generate the list of accounts
	// Set dontDisplayErrors to true if you don't want the yellow triagles to display
	getAccountsList: function (capability, exclude, dontDisplayErrors) {
		this.dontDisplayErrors = dontDisplayErrors;
		console.log("getAccountsList: cap=" + capability + " excl=" + enyo.json.stringify(exclude));
		this.$.accounts.getAccounts({capability: capability}, exclude);
	},
	
	// The list of accounts has been obtained.  Render the list now
	onAccountsAvailable: function(inSender, inResponse) {
		//console.log("accountsList len=" + inResponse.accounts.length);
		this.accounts = inResponse.accounts;
		this.$.list.setStripSize(this.accounts.length);		
		this.$.list.render();
		
		// PIM apps may want the list of templates for their "Add" button
		this.doAccountsList_AddAccountTemplates(inResponse.templates);

		// Get the sync status of the accounts
		if (!this.accountStatus && !this.dontDisplayErrors) {
			this.accountStatus = {};
			this.$.getSyncStatus.call();
		}
	},

	syncWatchFired: function() {
		// Get the account status (after waiting a little bit to prevent multiple updates from multiple transports)
		if (!this.getStatusTimer)
			this.getStatusTimer = setTimeout(this.getAccountStatus.bind(this), 100);
	},
	
	getAccountStatus: function() {
		if (this.getStatusTimer) {
			clearTimeout(this.getStatusTimer);
			this.getStatusTimer = null;
		}
		// Get the sync status of the accounts
		this.$.getSyncStatus.call();
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
		if (this.accountStatus && this.accountStatus[a._id] && this.accountStatus[a._id].currentError)
			this.$.errorIcon.show();
		else
			this.$.errorIcon.hide();
		return true;
	},

	// An account has been tapped on.  Return the account information
	accountSelected: function(inSender, inEvent) {
		var account = this.accounts[inEvent.rowIndex];
		console.log("accountSelected:" + (account.alias || account.loc_name));
		account.credentialError = this.accountStatus && this.accountStatus[account._id] && this.accountStatus[account._id].currentError;
		this.doAccountsList_AccountSelected({account: account});
	},
	
	// The sync status of accounts has been received
	receivedSyncStatus: function(inSender, inResponse, inRequest) {
		if (!inResponse || !inResponse.returnValue)
			return;
		var needsRedraw = false;
		
		// Create an array of accounts with account ID, dashboard (if present) and status
		for (var i=0, l=inResponse.results.length; i < l; i++) {
			var syncSource = inResponse.results[i];
			var account = AccountsUtil.getAccount(this.accounts, syncSource.accountId);
			
			// Has the account for this sync information been deleted?
			if (!account) {
				// If there is an entry for this account then delete it
				if (this.accountStatus[syncSource.accountId])
					delete this.accountStatus[syncSource.accountId];
				continue;
			}
			
			// Is this a credentials error state?
			var error = (syncSource.syncState === "ERROR" && (syncSource.errorCode === "401_UNAUTHORIZED" || syncSource.errorCode === "CREDENTIALS_NOT_FOUND"));
			
			// Is this the first status entry for this account?
			if (!this.accountStatus[syncSource.accountId]) {
				// Add this status
				this.accountStatus[syncSource.accountId] = {error: error};
				// If this is an error then the account list needs to be redrawn
				if (error)
					needsRedraw = true;
				continue;
			}
			
			// The account has a status already.  Does the account have credentials error?
			if (!this.accountStatus[syncSource.accountId].error)
				this.accountStatus[syncSource.accountId].error = error;
		}
		
		// Save the error state for the next update
		for (var accountId in this.accountStatus) {
			// Was there a error state change on this account?
			if (this.accountStatus[accountId].error != !!this.accountStatus[accountId].currentError)
				needsRedraw = true;
			this.accountStatus[accountId].currentError = this.accountStatus[accountId].error;
			this.accountStatus[accountId].error = false; 
		}
		//console.log("Accounts list error status: redraw =" + needsRedraw + "  array=" + enyo.json.stringify(this.accountStatus));
		
		if (needsRedraw)
			this.$.list.render();
	}
	
});
