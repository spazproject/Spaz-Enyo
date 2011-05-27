/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// Get the list of templates from the Accounts service
//
// Usage:
// ======
//
// Kind:
// {name: "templates", kind: "Accounts.getTemplates", onGetTemplates_TemplatesAvailable: "onTemplatesAvailable"}
//
// Making the call:
// this.$.templates.getAccountTemplates({
// 		capability: "MAIL",		// Specify a capability to filter the templates (optional)
// 		refreshCache: true		// Force the retrieval of templates, otherwise the results are returned from the cache (default is false)
// });
//
// The callback:
// onTemplatesAvailable: function(inSender, inResponse, inRequest) {
// 		this.templates = inResponse;		
// }


enyo.kind({
	name: "Accounts.getTemplates",
	kind: "Component",
	events: {
		onGetTemplates_TemplatesAvailable: ""
	},
	components: [{
		kind: "PalmService",
		service: enyo.palmServices.accounts,
		method: "listAccountTemplates",
		name: "listAccountTemplates",
		onResponse: "gotAccountTemplates"
	}],
	
	// Cache the templates to improve performance
	accountTemplates: [],
	
	// Get the account templates.  If the templates are in the cache then return those instead
	// of making a service call.  Use {"refreshCache":true} to force the retrieval of the templates 
	getAccountTemplates: function (options) {
		var filter = (options && options.capability)? {"capability": options.capability}: {}; 
		//this.log("getAccountTemplates: accountTemplates.length=" + this.accountTemplates.length + " filter=" + enyo.json.stringify(filter));
		// Used the cached templates unless they don't exist, or the call is forced
		if (this.accountTemplates.length == 0 || (options && options.refreshCache === true)) {
			// Only pass the "capability" option to the service
			this.$.listAccountTemplates.call(filter);
		}
		else 
			this.doGetTemplates_TemplatesAvailable(this.accountTemplates);
	},

	// Success and failure calls for template retrieval from the accounts service	
	gotAccountTemplates: function(inSender, inResponse) {
		// Cache the service response
		this.accountTemplates = inResponse.results || [];
		//this.log("gotAccountTemplates: accountTemplates.length=" + this.accountTemplates.length);
		this.doGetTemplates_TemplatesAvailable(this.accountTemplates);
	}
	
});

