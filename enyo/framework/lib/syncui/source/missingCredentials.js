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
		{name: "openAccountsApp", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"},
		{name: "addSyncStatus", kind: "TempDbService", dbKind: "com.palm.account.syncstate:1", method: "put"}
	],
	
	// Generate the list of accounts
	verifyAllAccountsHaveCredentials: function () {
		console.log("Missing creds: start");
		this.$.accounts.getAccounts();
	},
	
	// The list of accounts has been obtained
	onAccountsAvailable: function(inSender, inResponse) {
		// If there is already a list of accounts then ignore this; the credentials check has been made already
		if (this.accounts)
			return;

		console.log("Missing creds: Received account list. len=" + inResponse.accounts.length);
		this.accounts = inResponse.accounts;
		
		// See if the accounts have credentials (serially to lower CPU demands)
		this.currentAccount = 0;
		this.getAccountCredentials();
	},
	
	// Get the credentials for the current account
	getAccountCredentials: function() {
		if (this.accounts.length > this.currentAccount) {
			// See if this account has credentials
			if (this.accounts[this.currentAccount].validator)
				this.$.getCredentials.call({"accountId":this.accounts[this.currentAccount]._id});
			else {
				console.log("Missing creds: Skipping account without validator: " +  this.accounts[this.currentAccount].templateId);
				this.currentAccount++;
				this.getAccountCredentials();
			}
		}
	},
	
	hasCredentialsResponse: function(inSender, inResponse) {
		if (inResponse.returnValue && !inResponse.value) {
			// Credentials are missing
			console.log("Missing creds: Account is missing credentials:" + this.accounts[this.currentAccount].templateId + this.accounts[this.currentAccount]._id);
			// Show the dashboard
			if (!this.missingCredDashboard) {
				this.missingCredDashboard = this.createComponent({
					kind: "Dashboard",
					name: "missingCredentials",
					onMessageTap: "dashboardTap",
					onIconTap: "dashboardTap",
					smallIcon: this.smallIcon
				});
				this.missingCredDashboard.push({icon:this.largeIcon, title: SyncUIUtil.NO_CREDS_TITLE, text: SyncUIUtil.NO_CREDS_TEXT});
			}
			
			// Add the status in tempdb too (so that the Accounts app can show the accounts with errors)
			var params = [{
				_kind: "com.palm.account.syncstate:1",
				accountId: this.accounts[this.currentAccount]._id,
				syncState:"ERROR",
				errorCode: "CREDENTIALS_NOT_FOUND",
				capabilityProvider: "com.palm.app.accounts"
			}];
			this.$.addSyncStatus.call({objects: params});
		}
		
		// See if the next account is missing credentials
		this.currentAccount++;
		this.getAccountCredentials();
	},
	
	dashboardTap: function() {
		// Remove the dashboard
		this.missingCredDashboard.pop();
		
		// Launch the accounts app
		this.$.openAccountsApp.call({"id": "com.palm.app.accounts"});
	}

});
