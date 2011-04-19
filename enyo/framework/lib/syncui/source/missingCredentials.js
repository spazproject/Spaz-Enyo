/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "SyncUI.missingCredentials",
	kind: "Component",
	published: {
		smallIcon: "",
		largeIcon: ""
	},
	components: [
		{name: "accounts", kind: "Accounts.getAccounts", onGetAccounts_AccountsAvailable: "onAccountsAvailable"},
		{name: "getCredentials", kind: "PalmService", service: enyo.palmServices.accounts, method: "hasCredentials", onResponse: "hasCredentialsResponse"},
		{name: "openAccountsApp", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"}
	],
	
	// Generate the list of accounts
	verifyAllAccountsHaveCredentials: function () {
		console.log("verifyAllAccountsHaveCredentials called");
		this.$.accounts.getAccounts();
	},
	
	// The list of accounts has been obtained
	onAccountsAvailable: function(inSender, inResponse) {
		console.log("onAccountsAvailable: Received account list. len=" + inResponse.accounts.length);
		
		// If there is already a list of accounts then ignore this; the credentials check has been made already
		if (this.accounts)
			return;

		// Remove any accounts without validators
		this.accounts = inResponse.accounts.filter(function(account) {
			if (account.validator)
				return true;
			return false;
		});
		
		console.log("onAccountsAvailable: Removed accounts without validators. len=" + this.accounts.length);
		
		// See if the accounts have credentials (serially to lower CPU demands)
		this.currentAccount = 0;
		this.getAccountCredentials();
	},
	
	// Get the credentials for the current account
	getAccountCredentials: function() {
		if (this.accounts.length > this.currentAccount) {
			// See if this account has credentials
			console.log("getAccountCredentials: account = " + this.accounts[this.currentAccount]._id)
			this.$.getCredentials.call({"accountId":this.accounts[this.currentAccount]._id});
		}
	},
	
	hasCredentialsResponse: function(inSender, inResponse) {
		console.log("hasCredentialsResponse: response = " + enyo.json.stringify(inResponse));
		if (inResponse.returnValue && !inResponse.value) {
			// Credentials are missing
			console.log("hasCredentialsResponse: Account is missing credentials:" + this.accounts[this.currentAccount].templateId + " id=" + this.accounts[this.currentAccount]._id);
			// Show the dashboard
			this.missingCredDashboard = this.createComponent({
				kind:"Dashboard",
				name:"missingCredentials",
				onMessageTap: "dashboardTap",
				onIconTap: "dashboardTap",
				smallIcon: this.smallIcon
			});
			
			this.missingCredDashboard.push({icon:this.largeIcon, title: SyncUIUtil.NO_CREDS_TITLE, text: SyncUIUtil.NO_CREDS_TEXT});
		}
		else {
			// See if the next account is missing credentials
			this.currentAccount++;
			this.getAccountCredentials();
		}
	},
	
	dashboardTap: function() {
		// Remove the dashboard
		this.missingCredDashboard.pop();
		
		// Launch the accounts app
		this.$.openAccountsApp.call({"id": "com.palm.app.accounts"});
	}
});
