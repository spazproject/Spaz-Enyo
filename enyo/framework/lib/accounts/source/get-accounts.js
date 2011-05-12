/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// Get the list of accounts from mojoDB
// Accounts that are hidden templates, or those without validators (as defined by the account template) are excluded
// Note: By default, a watch is placed on the accounts list in mojoDB so you will receive additional callbacks as accounts are added or deleted
//       You can use "subscribe: false" if you don't want the watch
//
// Usage:
// ======
//
// Depends:
// Add this line to your app's depends.js file:
// "$enyo-lib/accounts/"
//
// Kind:
// {kind: "Accounts.getAccounts", name: "accounts", onGetAccounts_AccountsAvailable: "onAccountsAvailable", subscribe: true}
//
// Making the call:
// this.$.accounts.getAccounts(filter, exclude);
// You can also specify multiple capabilities:    getAccounts({capability: ['MAIL', 'CONTACTS']});
// You can filter by templateId:                  getAccounts({templateId: 'com.palm.eas'});
// You can also exclude some templates:           getAccounts({capability: 'CONTACTS'}, 'com.palm.palmprofile');
//   ... or an array of templates:                getAccounts({capability: 'CONTACTS'}, ['com.palm.palmprofile', 'com.palm.sim']);
//
// The callback:
// onAccountsAvailable: function(inSender, inResponse) {
// 		this.accounts = inResponse.accounts;	// Accounts are returned as an array		
// 		this.templates = inResponse.templates;	// Array of all account templates, with hidden templates and those without validators removed 
// }

enyo.kind({
	name: "Accounts.getAccounts",
	kind: "Component",
	published: {
		subscribe: true // The default is to watch for account changes
	},
	events: {
		onGetAccounts_AccountsAvailable: ""
	},
	components: [
		{name: "templates", kind: "Accounts.getTemplates", onGetTemplates_TemplatesAvailable: "onTemplatesAvailable"},
	],
	
	// Get an array of account, filtered by the given parameters
	getAccounts: function(filterBy, exclude) {
		this.filterBy = filterBy;
		this.exclude = exclude;
		//console.log("getAccounts: filterBy=" + enyo.json.stringify(this.filterBy) + " exclude=" + exclude);
		
		// Make simultaneous calls to get both accounts and templates (speed things up!)
		// Get the account templates
		delete this.allTemplates;
		this.$.templates.getAccountTemplates(this.filterBy);
		
		// Get the accounts
		if (!this.accountComponent) {
			var component = {
				kind: "DbService",
				dbKind: "com.palm.account:1",
				method: "find",
				onResponse: "gotAccounts",
			}
			// Does the caller want to be subscribed to account changes?
			if (this.subscribe) {
				component.subscribe = true;
				component.onWatch = "watchFired";
			}
			this.accountComponent = this.createComponent(component);
		}

		// Create the parameters for the query
		this.query = {query: {where: AccountsUtil.createWhere(this.filterBy)}};
		
		// Get the list of accounts
		delete this.accounts;
		this.accountComponent.call(this.query);
	},
	
	// The array of templates has been returned
	onTemplatesAvailable: function(inSender, inResponse) {
		this.allTemplates = inResponse;
		//console.log("Accounts.getAccounts: received templates.  num=" + this.allTemplates.length);
		
		// Create a filtered list of templates suitable for adding an account
		// Filter out hidden templates and those without validators
		this.addTemplates = this.allTemplates.filter(function(template) {
			if (template.validator && !template.hidden)
				return true;
			return false;
		});
		
		// Are the accounts available?  If so, return the result to the user
		if (this.accounts)
			this.returnAccountList();
	},

	// The list of accounts has been returned	
	gotAccounts: function(inSender, inResponse, inRequest) {
		this.accounts = (inResponse && inResponse.returnValue == true)? inResponse.results: [];
		// Are the templates available?  If so, return the result to the user
		if (this.allTemplates)
			this.returnAccountList();
	},

	// Both the templates and accounts are available now	
	returnAccountList: function() {
		var accounts = this.accounts;
		if (accounts.length) {
			// Remove any accounts and templates matching the exclude filter
			if (this.exclude) {
				accounts = accounts.filter(AccountsUtil.filterTemplateId, this);
				this.addTemplates = this.addTemplates.filter(AccountsUtil.filterTemplateId, this);
			}

			// Dedupe accounts if the filterBy capability was an array
			if (this.filterBy && this.filterBy.capability && enyo.isArray(this.filterBy.capability))
				AccountsUtil.dedupeByProperty(accounts, "_id");
			
			// Supplement the account information with information from the template
			accounts = accounts.map(AccountsUtil.annotateAccount, this);
			
			// Remove any accounts marked "invisible" (like the "com.palm.telephony" account)
			accounts = accounts.filter(function(account) {
				if (account.invisible)
					return false;
				return true;
			});
			
			// Change the main account icons to those of the capability
			if (this.filterBy && this.filterBy.capability && !enyo.isArray(this.filterBy.capability))
				AccountsUtil.promoteCapabilityIcons(accounts, this.filterBy.capability);
			
			// Sort the list of accounts
			accounts.sort(function(inA, inB) {
				var a = inA.alias || inA.loc_name;
				var b = inB.alias || inB.loc_name;
				return a.localeCompare(b);
			});
		}
		
		// Destroy the query component if not subscribing
		if (!this.subscribe) {
			this.accountComponent.destroy();
			delete this.accountComponent;
			delete this.accounts;
		}
		
		console.log("Accounts.getAccounts: " + accounts.length + " accounts and " + this.addTemplates.length + " templates");
		this.doGetAccounts_AccountsAvailable({
			accounts: accounts,
			templates: this.addTemplates
		});
	},
	
	watchFired: function() {
		// Make the database call to get the accounts
		if (this.accountComponent)
			this.accountComponent.call(this.query);
	}

});


