/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, document, enyo, console, Mojo, _, com */

enyo.kind({
	name: "com.palm.library.contacts.AccountList",
	kind: "Component",
	published: {},
	events: {
	},
	components: [
		{name: "getAccounts", kind: "Accounts.getAccounts", onGetAccounts_AccountsAvailable: "_accountsChanged"}
	],
	
	create: function () {
		this.inherited(arguments);
	},
	
	ready: function () {
		console.log("------------in AccountList ready method-------------");     
		this.refresh();
	},
	
	refresh : function () {
		this._fetchingAccounts = true;
	
		if (this._listObj) {
			this._listObj.cancel();
		}
	
		//TODO: do we need to get IM accounts too, for their contacts?
		this._listObj = this.$.getAccounts.getAccounts({
			capability: "CONTACTS"
		});
	},

	constructor : function (onReady) {

		console.log("------------in AccountList constructor method-------------");     
		this.inherited(arguments);
		this.list = [];
		this.ids = {}; // hash of accounts by accountId
		this.providersBySubKinds = {}; // TODO: Possibly take this out when exchange fixes their account stuff
		this.templateIds = {};
		this._fetchingAccounts = false;
	
		this._onReady = onReady;
	
//		Contacts.Utils.mixInBroadcaster(this);
		this._defaultAccountsListeners = [];
	},

	//copied from mixInBroadcaster
	addDefaultAccountsListener : function (callback) {
		if (callback) {
			this._defaultAccountsListeners.push(callback);
		}
	},

	//copied from mixInBroadcaster
	_notifyDefaultAccountsListeners : function (newDefaultAccountsList, oldDefaultAccountsList) {
		// Call all listeners with whatever arguments we were passed.
		_.invoke(this._defaultAccountsListeners, "apply", undefined, arguments);
	},

	//copied from mixInBroadcaster
	removeDefaultAccountsListener : function (callback) {
		var i = this._defaultAccountsListeners.indexOf(callback);
		if (i !== -1) {
			this._defaultAccountsListeners.splice(i, 1);
		} else {
			console.error("removeDefaultAccountsListener: Cannot find callback to remove.");
		}
	},

	getIconById : function (accountId, big) {
		var provider,
			account,
			iconData;
	
		// Get the contacts capability provider info for this account
		provider = this.getProvider(accountId);
		// Return one icon or the other, depending on whether or not the "big" one was requested.
		if (provider && provider.icon) {
			iconData = provider.icon;
		} else {
			// There is no capability specific icon so get the account's icon
			account = this.getAccount(accountId);
			if (account && account.icon) {
				iconData = account.icon;
			}
		}
	
		if (iconData) {
			if (big) {
				return iconData.loc_48x48;
			} else {
				return iconData.loc_32x32;
			}
		}
	},

	getIconByKind : function (kindName, big) {
		var provider = this.getProviderByKind(kindName);
	
		if (provider && provider.icon) {
			if (big) {
				return provider.icon.loc_48x48;
			} else {
				return provider.icon.loc_32x32;
			}
		}
	},

	/** 
	 * This method supplies an icon for an account
	 */
	getAccountIcon : function (accountId, kindName) {
		var icon;
	
		if (kindName) {
			icon = this.getIconByKind(kindName, false);
		}
	
		if (!icon && accountId) {
			icon = this.getIconById(accountId, false);
		}
	
		return icon || 'images/header-icon-contacts.png'; 
	},

	getDisplayName : function (account) {
		if (account.alias) { 
			return account.alias;
		} 
		return account.username;
	},

	getAccountName : function (accountId) {
		var account = this.getAccount(accountId);
	
		return account ? account.loc_name : "";
	},

	// Checks if the provider of the contact is read-only or if the contact is from an SDN entry on a SIM
	isContactReadOnly : function (contact) {
		var isReadOnly = false,
			provider = this.getProvider(contact.getAccountId().getValue());
	
		if (provider && provider.readOnlyData) 
		{
			isReadOnly = true;
		}
		else if (contact && contact.getDBObject() && contact.getDBObject().simEntryType === "sdn")
		{
			// even if we have a provider that is writable, this particular contact may still be read only ("sdn" on a sim)
			isReadOnly = true;
		}
		return isReadOnly;
	},

	getAccount : function (accountId) {
		return this.ids[accountId];
	},

	getAccountsByTemplateId : function (templateId) {
		return this.templateIds[templateId];
	},

	getProvider : function (accountId) {
		var account = this.ids[accountId];
	
		// This happens when we are called with a fake account ID (like the one used for the unified account dashboard).
		if (!account || !account.capabilityProviders) {
			return;
		}

		// Get the contact capability provider info for this account
		return _.detect(account.capabilityProviders, function (p) {
			return p.capability === "CONTACTS";
		});
	},

	getProviderByKind : function (kindName) {
		return this.providersBySubKinds[kindName];
	},

	getAccountsList : function () {
		return this.list;
	},

	getDefaultAccountsList : function () {
		return this.defaultAccountsList;
	},

	getDefaultAccountsDisplayList : function () {
		//TODO: should this be owned by the prefs scene and have that scene generate/update the list as appropriate?
		return this.defaultAccountsDisplayList;
	},

	/*
	// An example of what is passed to _accountsChanged:
	[{
		"_id": "2AZd",
		"_kind": "com.palm.account:1",
		"_rev": 47405,
		"beingDeleted": false,
		"capabilityProviders": [{
			"_id": "2AZi",
			"capability": "CONTACTS",
			"id": "com.palm.google.contacts",
			"loc_name": "Google Contacts",
			"implementation": "palm://com.palm.service.contacts.google/",
			"onCreate": "palm://com.palm.service.contacts.google/onCreate",
			"onEnabled": "palm://com.palm.service.contacts.google/onEnabled",
			"onDelete": "palm://com.palm.service.contacts.google/onDelete",
			"sync": "palm://com.palm.service.contacts.google/sync"
		}],
		"templateId": "com.palm.google",
		"username": "palmtest4",
		"loc_name": "Google",
		"icon": {
			"loc_32x32": "/usr/palm/public/accounts/com.palm.google/images/google-32x32.png",
			"loc_48x48": "/usr/palm/public/accounts/com.palm.google/images/google-48x48.png"
		},
		"validator": "palm://com.palm.service.contacts.google/checkCredentials"
	};
	{
		"_id": "2AeJ",
		"_kind": "com.palm.account:1",
		"_rev": 47768,
		"beingDeleted": false,
		"capabilityProviders": [{
			"_id": "2AeO",
			"capability": "CONTACTS",
			"id": "com.palm.yahoo.contacts",
			"loc_name": "Yahoo! Contacts",
			"implementation": "palm://com.palm.service.contacts.yahoo/",
			"onCreate": "palm://com.palm.service.contacts.yahoo/onCreate",
			"onEnabled": "palm://com.palm.service.contacts.yahoo/onEnabled",
			"onDelete": "palm://com.palm.service.contacts.yahoo/onDelete",
			"sync": "palm://com.palm.service.contacts.yahoo/sync",
			"readOnlyData": true
		}],
		"templateId": "com.palm.yahoo",
		"username": "palmtest4",
		"loc_name": "Yahoo!",
		"icon": {
			"loc_32x32": "/usr/palm/public/accounts/com.palm.yahoo/images/yahoo-32x32.png",
			"loc_48x48": "/usr/palm/public/accounts/com.palm.yahoo/images/yahoo-48x48.png"
		},
		"validator": "palm://com.palm.service.contacts.yahoo/checkCredentials"
	}]
	*/
	_accountsChanged : function (inSender, inResponse) {
		var that = this,
			oldDefaultAccountsList = this.defaultAccountsList,
			accounts = inResponse.accounts;
		this.list = accounts;
		console.info("ContactsApp._accountsChanged: accounts #:" + accounts.length);
	
		// Build the new ids hash.
		this.ids = {};
		this.templateIds = {};
	
		this.defaultAccountsList = [];
		this.defaultAccountsDisplayList = [];
	
		accounts.forEach(function (account) {
			var id = account._id,
				templateId = account.templateId;
		
			that.ids[id] = account;
		
			if (that.templateIds[templateId]) {
				that.templateIds[templateId].push(account);
			} else {
				that.templateIds[templateId] = [account];
			}
		
			account.capabilityProviders.forEach(function (capabilityProvider) {
				var accountDisplayName;
			
				if (capabilityProvider && capabilityProvider.dbkinds && capabilityProvider.dbkinds.contact) {
					that.providersBySubKinds[capabilityProvider.dbkinds.contact] = capabilityProvider;
				}
				// Create the "defaultAccountsList" for selecting accounts
				if (capabilityProvider && capabilityProvider.capability === "CONTACTS" && !capabilityProvider.readOnlyData && account.templateId !== "com.palm.sim") {
					//console.log(templateId + "is NOT read only!!");
					that.defaultAccountsList.push(account);
				
					accountDisplayName = account.alias || capabilityProvider.loc_name || account.loc_name;
					that.defaultAccountsDisplayList.push({
						label: (account.username) ? accountDisplayName + " (" + account.username + ")" : accountDisplayName,
						secondaryIconPath: (capabilityProvider.icon) ? capabilityProvider.icon.loc_32x32 : account.icon.loc_32x32,
						command: account._id
					});
				}
			});
		});
	
		this._fetchingAccounts = false;
		// Notify listeners that accounts have changed.
		//this.broadcast();
		this._notifyDefaultAccountsListeners(this.defaultAccountsList, oldDefaultAccountsList);
	
		if (this._onReady) {
			this._gotAccounts = true;
			this._onReady();
			this._onReady = undefined;
		}
	},

	isReady : function () {
		return this._gotAccounts;
	},

	isFetchingAccounts : function () {
		return this._fetchingAccounts;
	}
});

com.palm.library.contacts.AccountList.defaultAccountPriority = ["com.palm.eas", "com.palm.google"];
