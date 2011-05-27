/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
var SyncUIUtil = (function () {
	var rb = new enyo.g11n.Resources({root: "$enyo-lib/syncui"});
	
	var stateValue = {
		"IDLE": 0,
		"INITIAL_SYNC": 1,
		"DELETE": 2,
		"401_UNAUTHORIZED": 3	// This is syncState="ERROR" and errorCode="401_UNAUTHORIZED"
	};
	

	return {
		// Exported methods
		
		// Return the highest of the old state and the new account state
		// Status: Credentials error > Removing account > initial sync > other states
		// List of all states: INITIAL_SYNC, DELETE, IDLE, PUSH, INCREMENTAL_SYNC and ERROR
		saveHighestStatus: function(accountState, newAccountStatus) {
			var newState = "IDLE";
			// Figure out the new account status
			switch (newAccountStatus.syncState) {
				case "INITIAL_SYNC":
					newState = "INITIAL_SYNC";
					break;
				case "DELETE":
					newState = "DELETE";
					break;
				case "ERROR":
					if (newAccountStatus.errorCode === "401_UNAUTHORIZED")
						newState = "401_UNAUTHORIZED";
					break;
			}
			// Save the most relevant state, and the capability to blame for it
			if (!accountState.status || stateValue[newState] > stateValue[accountState.status]) {
				accountState.status = newState;
				accountState.stateBlame = newAccountStatus.capabilityProvider;
			}
		},
		
		// Iterate through an array of accounts for the one that matches the given accountId
		getAccount: function(accountArray, accountId) {
			for (i in accountArray) {
				if (accountArray[i]._id === accountId)
					return accountArray[i];
			}
		},
		
		// The path to the accounts library		
		libPath: enyo.path.paths["-..-lib-syncui"],
		
		// Localized strings
		REMOVING_ACCOUNT:			rb.$L("Removing account..."),
		REMOVING_ACCOUNT_DATA:		rb.$L("Removing account data..."),
		REMOVE_FINISHED:			rb.$L("Account removed"),
		REMOVE_DATA_FINISHED:		rb.$L("Account data removed"),
		SYNCING_ACCOUNT:			rb.$L("Syncing account..."),
		SYNC_FINISHED:				rb.$L("Sync completed"),
		CHECK_LOGIN_PASSWORD:		rb.$L("Check your login and password"),
		NO_CREDS_TITLE:				rb.$L("Accounts: Action Needed"),
		NO_CREDS_TEXT:				rb.$L("Enter credentials for your accounts"),
		BAD_CREDS_TEXT:				rb.$L("Check your login and password")
	};
}());

