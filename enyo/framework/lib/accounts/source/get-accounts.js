/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// Get the list of accounts from mojoDB
// Accounts that are hidden templates, or those without validators (as defined by the account template) are excluded
// Note: A watch is placed on the accounts list in mojoDB so you will receive additional callbacks as accounts are added or deleted
//
// Usage:
// ======
//
// Depends:
// Add this line to your app's depends.js file:
// "$enyo-lib/accounts/"
//
// Kind:
// {kind: "Accounts.getAccounts", name: "accounts", onGetAccounts_AccountsAvailable: "onAccountsAvailable"}
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
	events: {
		onGetAccounts_AccountsAvailable: ""
	},
	components: [
		{name: "templates", kind: "Accounts.getTemplates", onGetTemplates_TemplatesAvailable: "onTemplatesAvailable"},
		{name: "listAccounts", kind: "DbService", dbKind: "com.palm.account:1", subscribe: true, method: "find", onResponse: "gotAccounts", onWatch: "watchFired"},
	],
	
	// Start off by getting the account templates.  Once those have been retrieved then get the accounts
	getAccounts: function(filterBy, exclude) {
		this.filterBy = filterBy;
		this.exclude = exclude;
		console.log("getAccounts: filterBy=" + enyo.json.stringify(this.filterBy) + " exclude=" + exclude);
		// Get the account templates
		this.$.templates.getAccountTemplates(this.filterBy);
	},
	
	// The array of templates has been returned
	onTemplatesAvailable: function(inSender, inResponse) {
		this.allTemplates = inResponse;
		//console.log("Accounts.getAccounts: received templates.  num=" + this.allTemplates.length);
		
		// Create a filtered list of templates suitable for adding an account
		// Filter out hidden templates and those without validators
		this.addTemplates = [];
		for (var i=0, l=this.allTemplates.length; i<l; i++) {
			if (this.allTemplates[i].validator && !this.allTemplates[i].hidden)
				this.addTemplates.push(this.allTemplates[i])
		}  
		
		// The templates have been retrieved.  Now get the list of accounts
		this.prop = {query: {where: AccountsUtil.createWhere(this.filterBy)}};
		
		// Make the database call to get the accounts
		this.$.listAccounts.call(this.prop);
	},
	
	gotAccounts: function(inSender, inResponse, inRequest) {
		var accounts = [];
		if (inResponse && inResponse.returnValue == true) {
			var accounts = inResponse.results;
			if (accounts) {
				//console.log("gotAccounts: received accounts.  num=" + accounts.length);
				// Remove any accounts and templates matching the exclude filter
				if (this.exclude) {
					accounts = accounts.filter(AccountsUtil.filterTemplateId, this);
					this.addTemplates = this.addTemplates.filter(AccountsUtil.filterTemplateId, this);
				}

				// Dedupe accounts if the filterBy capability was an array
				if (this.filterBy && this.filterBy.capability && enyo.isArray(this.filterBy.capability))
					AccountsUtil.dedupeByProperty(accounts, "_id");
				
				// Supplement the account information with information from the template
				accounts = accounts.map(AccountsUtil.annotateAccount, {templates: this.allTemplates});
				
				// Remove any accounts marked "invisible" (like the "com.palm.telephony" account)
				accounts = accounts.filter(function(account) {
					if (account.invisible)
						return false;
					return true;
				});
				
				// Sort the list of accounts
				accounts.sort(function(inA, inB) {
					var a = inA.alias || inA.loc_name;
					var b = inB.alias || inB.loc_name;
					return a.localeCompare(b);
				});
			}
		}
		else {
			// There was an error
			console.log("Accounts.getAccounts - Error getting accounts: " + enyo.json.stringify(inResponse));
		}
		
		console.log("Accounts.getAccounts: returning " + accounts.length + " accounts and " + this.addTemplates.length + " templates.")
		this.doGetAccounts_AccountsAvailable({
			accounts: accounts,
			templates: this.addTemplates
		});
	},
	
	watchFired: function() {
		// Make the database call to get the accounts
		this.$.listAccounts.call(this.prop);
	}

});


