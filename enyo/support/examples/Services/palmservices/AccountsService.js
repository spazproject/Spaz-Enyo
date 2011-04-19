/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "AccountsService",
	kind: "Service",
	requestKind: "AccountsService.IconsRequest",
	methodHandlers: {
		getAccountIcons: ""
	},
	getAccountIcons: function(inProps) {
		return this.request(inProps);
	}
});

// Request component for a chain of requests
enyo.kind({
	name: "AccountsService.IconsRequest",
	kind: "Request",
	components: [
		{
			name: "accounts",
			kind: "PalmService",
			service: enyo.palmServices.accounts,
			onFailure: "gotFailure"
		},
		{
			name: "db",
			kind: "DbService",
			dbKind: "com.palm.account:1",
			onFailure: "gotFailure"
		}
	],
	call: function() {
		this.$.accounts.call(null, {
			method: "listAccountTemplates",
			onSuccess: "gotAccountIcons"
		});
	},
	isFailure: function(inResponse) {
		return !inResponse || inResponse.returnValue === false;
	},
	gotFailure: function(inSender, inResponse) {
		return this.receive(inResponse);
	},
	gotAccountIcons: function(inSender, inResponse, inRequest) {
		this.accountTemplates = inResponse.results;
		var p = {
			method: "find",
			onSuccess: "gotAccounts"
		};
		if (this.params.capability) {
			var params = {
				query: {
					where: [{
						prop: "beingDeleted",
						op: "=",
						val: false
					}, {
						prop: "capabilityProviders.capability",
						op: "=",
						val: this.params.capability
					}]
				}
			};
		}
		this.$.db.call(params, p);
	},
	gotAccounts: function(inSender, inResponse, inRequest) {
		var icons = [];
		var templates = {};
		this.accountTemplates.forEach(function(t) {
			templates[t.templateId] = t;
		});
		inResponse.results.forEach(function(acct) {
			var template = templates[acct.templateId];
			if (template.icon && template.icon.loc_48x48) {
				icons.push(template.icon.loc_48x48);
			}
		});
		this.receive(icons);
	}
});