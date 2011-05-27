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
		this.watchDelay = 1;
		// Get the accounts.  Include those that are being deleted so the "Remove account" can be displayed
		this.$.accounts.getAccounts({showDeleted: true});
	},
	
	// The list of accounts has been obtained
	onAccountsAvailable: function(inSender, inResponse) {
		this.accounts = inResponse.accounts;
		console.log("There are " + this.accounts.length + " accounts");
		
		// Update the account information in the sync status array
		for (accountId in this.accountStatus) {
			var account = SyncUIUtil.getAccount(this.accounts, accountId);
			if (account)
				this.accountStatus[accountId].account = account;
		}

		// Get the sync status of the accounts
		if (!this.accountStatus) {
			this.accountStatus = {};
			this.$.getSyncStatus.call();
		}
	},

	syncWatchFired: function() {
		// Get the account status (after waiting a little bit to prevent multiple updates from multiple transports)
		if (!this.getStatusTimer) {
			console.log("SyncUI.syncDashboard: watch fired, waiting " + this.watchDelay + " msec");
			this.getStatusTimer = setTimeout(this.getAccountStatus.bind(this), this.watchDelay);
		}
	},
	
	getAccountStatus: function() {
		//console.log("SyncUI.syncDashboard: gettting account sync status");
		// Get the sync status of the accounts
		this.$.getSyncStatus.call();
	},
	
	// Get the credentials for the current account
	receivedSyncStatus: function(inSender, inResponse, inRequest) {
		if (!inResponse || !inResponse.returnValue)
			return;
		var deletedSources = [];

		// Clear the timeout to allow sync watches to fire
		if (this.getStatusTimer) {
			clearTimeout(this.getStatusTimer);
			delete this.getStatusTimer;
		}
		
		// Create an array of accounts with account ID, dashboard (if present) and status
		console.log("Processing " + inResponse.results.length + " sync state entries ...");
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
			SyncUIUtil.saveHighestStatus(this.accountStatus[syncSource.accountId], syncSource);
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
					// If a sync or delete has finished then display a "sync/delete done" banner
					if (syncAccount.bannerEndText) {
						enyo.windows.addBannerMessage(syncAccount.bannerEndText, "{}", syncAccount.dashboard.smallIcon);
						delete syncAccount.bannerEndText;
					}
					syncAccount.dashboard.destroy();
					delete syncAccount.dashboard;
					syncAccount.dashboardStatus = "IDLE";

					// Be quick to put up the next dashboard
					this.watchDelay = 1;
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
			console.log("Creating dashboard " + syncAccount.dashboardStatus + " for account " + accountId + " (" + syncAccount.stateBlame + ")");
			
			switch(syncAccount.status) {
				case "INITIAL_SYNC":
					icon = SyncUIUtil.libPath + "images/notification-small-sync.png";
					text = SyncUIUtil.SYNCING_ACCOUNT;
					syncAccount.bannerEndText = SyncUIUtil.SYNC_FINISHED;
					break;
				case "DELETE":
					icon = SyncUIUtil.libPath + "images/notification-small-sync.png";
					if (syncAccount.account.beingDeleted) {
						text = SyncUIUtil.REMOVING_ACCOUNT;
						syncAccount.bannerEndText = SyncUIUtil.REMOVE_FINISHED;
					}
					else {
						text = SyncUIUtil.REMOVING_ACCOUNT_DATA;
						syncAccount.bannerEndText = SyncUIUtil.REMOVE_DATA_FINISHED;
					}
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

			// Display a banner
			if (syncAccount.status === "INITIAL_SYNC" || syncAccount.status === "DELETE") {
				enyo.windows.addBannerMessage(text, "{}", icon);
				// Be slow to take the dashboard down
				this.watchDelay = 3000;
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
