/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.AccountsService",
	kind: "PalmService",
	requestKind: "AccountsService.Request"
});

enyo.kind({
	name: "enyo.AccountsService.Request",
	kind: "PalmService.Request",
	components: [
		{name: "templatesService", kind: "PalmService", service: enyo.palmServices.accounts, method: "listAccountTemplates",
			onSuccess: "gotTemplates", subscribe: true, onFailure: "gotFailure"},
		{name: "accountsService", kind: "DbService", dbKind: "com.palm.account:1", subscribe: true, method: "find",
			onSuccess: "gotAccounts",
			onFailure: "gotFailure",
			onWatch: "gotWatch"},
	],
	createBridge: function() {
		this.bridge = {cancel: enyo.nop};
	},
	call: function() {
		if (!this.templates) {
			this.$.templatesService.call();
		} else {
			this.fetchAccounts();
		}
	},
	gotWatch: function() {
		this.call();
	},
	gotFailure: function(inSender, inResponse) {
		this.receive(inResponse);
	},
	gotTemplates: function(inSender, inResponse) {
		this.templates = inResponse.results;
		this.fetchAccounts();
	},
	fetchAccounts: function() {
		var w = this.createWhere();
		this.$.accountsService.call({query: {where: w}});
	},
	whereEquals: function(inProp, inValue) {
		return {
			prop: inProp,
			op: "=",
			val: inValue
		}
	},
	createWhere: function () {
		var where = [];
		var f = this.params.filterBy;
		if (f) {
			if (f.templateId) {
				where.push(this.whereEquals("templateId", filterBy.templateId));
			} else if (f.capability) {
				where.push(this.whereEquals("capabilityProviders.capability", f.capability));
			}
		}
		if (!(f && f.showDeleted)) {
			where.push(this.whereEquals("beingDeleted", false));
		}
		return where.length ? where : undefined;
	},
	gotAccounts: function(inSender, inResponse) {
		var accounts = [];
		var accounts = inResponse.results;
		for (var i=0, a; a=accounts[i]; i++) {
			this.annotateAccount(a);
		}
		this.accounts = accounts;
		this.receive(inResponse);
	},
	fetchTemplateById: function(inTemplateId) {
		for (var i=0, t; t=this.templates[i]; i++) {
			if (t.templateId == inTemplateId) {
				//this.log("found template with ID = " + inTemplateId);
				return t;
			}
		}
	},
	fetchTemplateCapabilityById: function(inTemplate, inId) {
		for (var i=0, cp; cp=inTemplate.capabilityProviders[i]; i++) {
			if (cp.id === inId) {
				return cp
			}
		}
	},
	annoateAccountCapabilities: function(ioAccount, inTemplate) {
		for (var i=0, c, tc; c=ioAccount.capabilityProviders[i]; i++) {
			enyo.mixin(c, this.fetchTemplateCapabilityById(inTemplate, c.id));
		}
	},
	annotateAccount: function(ioAccount) {
		var template = this.fetchTemplateById(ioAccount.templateId);
		this.annoateAccountCapabilities(ioAccount, template);
		//
		// mixin template except for capabilities, which have already been done.
		var tcp = template.capabilityProviders;
		delete template.capabilityProviders;
		enyo.mixin(ioAccount, template);
		template.capabilityProviders = tcp;
		return ioAccount;
	}
});