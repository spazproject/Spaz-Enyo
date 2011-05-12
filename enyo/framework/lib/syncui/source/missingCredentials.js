/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "SyncUI.missingCredentials",
	kind: "Component",
	published: {
		smallIcon: "",
		largeIcon: ""
	},
	components: [
		{name: "accounts", kind: "Accounts.getAccounts", onGetAccounts_AccountsAvailable: "onAccountsAvailable", subscribe: false},
		{name: "getCredentials", kind: "PalmService", service: enyo.palmServices.accounts, method: "hasCredentials", onResponse: "hasCredentialsResponse"},
		{name: "openAccountsApp", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"},
		{name: "addSyncStatus", kind: "TempDbService", dbKind: "com.palm.account.syncstate:1", method: "put"},
		{name: "getSyncStatus", kind: "TempDbService", dbKind: "com.palm.account.syncstate:1", subscribe: true, method: "find", onResponse: "receivedSyncStatus", onWatch: "syncWatchFired"},
	],
	
	// Generate the list of accounts
	verifyAllAccountsHaveCredentials: function () {
		this.$.accounts.getAccounts();
	},
	
	// The list of accounts has been obtained
	onAccountsAvailable: function(inSender, inResponse) {
		console.log("Checking " + inResponse.accounts.length + " accounts for missing credentials ...");
		this.accounts = inResponse.accounts;
		
		// See if the accounts have credentials (serially to lower CPU demands)
		this.nextAccountToCheck = 0;
		this.getAccountCredentials();
	},
	
	// Get the credentials for the current account
	getAccountCredentials: function() {
		while (this.nextAccountToCheck < this.accounts.length) {
			this.account = this.accounts[this.nextAccountToCheck];
			this.nextAccountToCheck ++;
			
			// Skip accounts without validators
			if (!this.account.validator)
				continue;
			
			// See if this account has credentials
			this.$.getCredentials.call({"accountId":this.account._id});
			return;
		}
		
		// If a dashboard is displayed then watch sync status so the dashboard can be automatically removed
		// The Accounts service will clear the status once valid credentials are entered by the user
		if (this.missingCredDashboard)
			this.getAccountStatus();
		else {
			console.log("No accounts are missing credentials");
			this.cleanup();
		}
	},
	
	hasCredentialsResponse: function(inSender, inResponse) {
		if (inResponse.returnValue && !inResponse.value) {
			// Credentials are missing
			console.log("Account is missing credentials:" + this.account.templateId + " " + this.account._id);
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
				accountId: this.account._id,
				syncState:"ERROR",
				errorCode: "CREDENTIALS_NOT_FOUND",
				capabilityProvider: "com.palm.app.accounts"
			}];
			this.$.addSyncStatus.call({objects: params});
		}
		
		// See if the next account is missing credentials
		this.getAccountCredentials();
	},
	
	dashboardTap: function() {
		// Launch the accounts app
		this.$.openAccountsApp.call({"id": "com.palm.app.accounts"});

		this.cleanup();
	},
	
	syncWatchFired: function() {
		// Get the account status (after waiting a little bit to prevent multiple updates from multiple transports)
		if (!this.getStatusTimer)
			this.getStatusTimer = setTimeout(this.getAccountStatus.bind(this), 1000);
	},
	
	getAccountStatus: function() {
		if (this.getStatusTimer) {
			clearTimeout(this.getStatusTimer);
			this.getStatusTimer = null;
		}
		// Get the sync status of the accounts
		this.$.getSyncStatus.call();
	},
	
	// Get the credentials for the current account
	receivedSyncStatus: function(inSender, inResponse, inRequest){
		if (!inResponse || !inResponse.returnValue)
			return;

		// If the dashboard has been dismissed already then we're done here
		if (!this.missingCredDashboard)
			return;

		// Check each entry to see if accounts are still missing credentials
		for (i in inResponse.results) {
			var syncSource = inResponse.results[i];
			if (syncSource.syncState === "ERROR" && syncSource.errorCode === "CREDENTIALS_NOT_FOUND") {
				console.log("Keeping dashboard because of account: " + syncSource.accountId);
				return;
			}
		}
		
		console.log("Removing 'Missing Credentials' dashboard");
		
		this.cleanup();
	},
	
	cleanup: function() {
		// Remove the dashboard
		if (this.missingCredDashboard) {
			this.missingCredDashboard.pop();
			delete this.missingCredDashboard;
		}
		
		// Free any object that were used
		if (this.accounts)
			delete this.accounts;
		if (this.account)
			delete this.account;

		// Stop listening for account status changes
		this.$.getSyncStatus.destroy();
	}
});
