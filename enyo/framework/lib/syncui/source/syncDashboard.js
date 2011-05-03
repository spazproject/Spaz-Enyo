/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "SyncUI.syncDashboard",
	kind: "Component",
	components: [
		{name: "accounts", kind: "Accounts.getAccounts", onGetAccounts_AccountsAvailable: "onAccountsAvailable"},
		{name: "getSyncStatus", kind: "TempDbService", dbKind: "com.palm.account.syncstate:1", subscribe: true, method: "find", onResponse: "receivedSyncStatus", onWatch: "syncWatchFired"},
		{name: "deleteSyncStatus", kind: "TempDbService", dbKind: "com.palm.account.syncstate:1", method: "del"},
		{name: "openAccountsApp", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"}
	],
	
	// Generate the list of accounts
	startSyncDashboard: function () {
		this.$.accounts.getAccounts();
	},
	
	// The list of accounts has been obtained
	onAccountsAvailable: function(inSender, inResponse) {
		this.accounts = inResponse.accounts;

		// Get the sync status of the accounts
		if (!this.accountStatus) {
			this.accountStatus = {};
			this.$.getSyncStatus.call();
		}
	},
	
	syncWatchFired: function() {
		// Get the account status (after waiting a little bit to prevent multiple updates from multiple transports)
		console.log("SyncUI.syncDashboard: watch fired, waiting 500 msec");
		if (!this.getStatusTimer)
			this.getStatusTimer = setTimeout(this.getAccountStatus.bind(this), 500);
	},
	
	getAccountStatus: function() {
		console.log("SyncUI.syncDashboard: gettting account sync status");
		if (this.getStatusTimer) {
			console.log("SyncUI.syncDashboard: getAccountStatus - clearing timer");
			clearTimeout(this.getStatusTimer);
			this.getStatusTimer = null;
		}
		// Get the sync status of the accounts
		this.$.getSyncStatus.call();
	},
	
	// Get the credentials for the current account
	receivedSyncStatus: function(inSender, inResponse, inRequest) {
		if (!inResponse || !inResponse.returnValue)
			return;
		var deletedSources = [];
		
		// Create an array of accounts with account ID, dashboard (if present) and status
		for (var i=0, l=inResponse.results.length; i < l; i++) {
			var syncSource = inResponse.results[i];
			var account = SyncUIUtil.getAccount(this.accounts, syncSource.accountId);
			
			// Has the account for this sync information been deleted?
			if (!account) {
				console.log("Sync status "+ syncSource._id + " not needed because account " + syncSource.accountId + " no longer exists");
				deletedSources.push(syncSource._id);
				
				// Delete the dashboard for this account, if it exists
				if (this.accountStatus[syncSource.accountId]) {
					if (this.accountStatus[syncSource.accountId].dashboard)
						this.accountStatus[syncSource.accountId].dashboard.pop();
					delete this.accountStatus[syncSource.accountId];
				}
				continue;
			}
			
			// Create a new entry for this account if needed
			if (!this.accountStatus[syncSource.accountId])
				this.accountStatus[syncSource.accountId] = {"accountId": syncSource.accountId, account: account};
				
			// Save the "highest" status for this account (there may be multiple transports/status for a single account)
			this.accountStatus[syncSource.accountId].status = SyncUIUtil.getHighestStatus(this.accountStatus[syncSource.accountId].status, syncSource);
			//console.log("ac=" + syncSource.accountId + "-" + syncSource.capabilityProvider + "=" + syncSource.syncState);
		}

		// Delete the status of accounts that no longer exist
		if (deletedSources.length)
			this.$.deleteSyncStatus.call({"ids": deletedSources});

		// Iterate through the array of accounts and update dashboards
		for (var accountId in this.accountStatus) {
			var icon, title, text, dashAccountId;
			var syncAccount = this.accountStatus[accountId];
			// console.log("receivedSyncStatus: Account " + accountId + " status=" + syncAccount.status);

			// Is the account now idle?
			if (syncAccount.status === "IDLE") {
				// Did this account have a dashboard that should be removed?
				if (syncAccount.dashboard) {
					console.log("Removing dashboard " + syncAccount.dashboardStatus + " for account " + accountId)
					syncAccount.dashboard.destroy();
					delete syncAccount.dashboard;
					syncAccount.dashboardStatus = "IDLE";
				}
				continue;
			}
			
			// Has the status changed?  Does the dashboard need updating?
			if (syncAccount.status === syncAccount.dashboardStatus) {
				syncAccount.status = "IDLE";
				continue;
			}
			
			// Save the status that corresponds to the dashboard
			syncAccount.dashboardStatus = syncAccount.status;
			console.log("Creating dashboard " + syncAccount.dashboardStatus + " for account " + accountId)
			
			switch(syncAccount.status) {
				case "INITIAL_SYNC":
					icon = SyncUIUtil.libPath + "images/notification-small-sync.png";
					text = SyncUIUtil.SYNCING_ACCOUNT;
					break;
				case "DELETE":
					icon = SyncUIUtil.libPath + "images/notification-small-sync.png";
					text = SyncUIUtil.REMOVING_ACCOUNT;
					break;
				case "401_UNAUTHORIZED":
					icon = syncAccount.account.icon.loc_32x32;
					text = SyncUIUtil.BAD_CREDS_TEXT;
					dashAccountId = accountId;
					break;
			}
			
			// Create a dashboard if one doesn't exist
			if (!syncAccount.dashboard) {
				syncAccount.dashboard = this.createComponent({
					kind: "Dashboard",
					name: "SyncUI-" + accountId,
					onMessageTap: "dashboardTap",
					onIconTap: "dashboardTap",
					smallIcon: icon,
					accountId: dashAccountId
				});
			}

			// Display the dashboard message			
			syncAccount.dashboard.setLayers([{
				icon: syncAccount.account.icon.loc_48x48,
				title: syncAccount.account.alias  || syncAccount.account.username,
				text: text,
			}]);
			
			// Reset the status for the next update
			syncAccount.status = "IDLE";
		}
	},
	
	dashboardTap: function(inSender) {
		console.log("dashboardTap: " + enyo.json.stringify(inSender.accountId));
		// Open the accounts app to change the credentials
		if (inSender.accountId) {
			this.$.openAccountsApp.call({
				"id": "com.palm.app.accounts",
				params: {
					launchType: "changelogin",
					accountId: inSender.accountId
				}
			});
		}
	}
});
