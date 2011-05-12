/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// Add an account.  Show the list of accounts the user is able to add, based on the account templates
// This view provides a page header and cancel button.
//
// Usage:
// ======
//
// Depends:
// Add this line to your app's depends.js file:
// "$enyo-lib/accounts/"
//
// Kind:
// {kind: "Accounts.addAccountView", name: "addAccount", onAddAccount_AccountSelected: "editAccount", onAddAccount_Cancel: "addCancel"}
//
// Show the list of accounts the user can add:
// this.$.addAccount.showAvailableAccounts(templates, capability);
//
// The callback:
// addSelectedAccount: function(inSender, template) {
//		this.addAccountTemplate = template;		// The template of the account selected

enyo.kind({
	name: "Accounts.addAccountView",
	kind: "enyo.VFlexBox",
	className:"enyo-bg",
	published: {
		capability:["CALENDAR","CONTACTS","DOCUMENTS","MAIL","MEMOS","MESSAGING","PHONE","PHOTO","REMOTECONTACTS","TASKS","VIDEO.UPLOAD","IM","SMS"],
	},
	events: {
		onAddAccount_AccountSelected: "",
		onAddAccount_Cancel: ""
	},
	components: [
		{kind:"Toolbar", className:"enyo-toolbar-light accounts-header", pack:"center", components: [
				{kind: "Image", src: AccountsUtil.libPath + "images/acounts-48x48.png"},
				{content: AccountsUtil.PAGE_TITLE_ADD_ACCOUNT, className:""}
		]},
		{className:"accounts-header-shadow"},
		{kind: "Scroller", flex: 1, components: [
			{kind:"Control", className:"box-center", style:"margin-top:24px", components: [ 
				{name: "list", kind: "VirtualRepeater", onSetupRow: "listGetItem", onGetItem: "listGetItem", onclick: "templateSelected", className:"accounts-btn-list", components: [
					{kind: "Button", name: "Account", allowDrag:true, layoutKind: "HFlexLayout", align:"center", className:"accounts-btn", components: [
						{kind: "Image", name: "templateIcon", className:"icon-image"},
						{name: "templateName"}
					]}
				]},
			]},
		]},
		{className:"accounts-footer-shadow"},
		{kind:"Toolbar", className:"enyo-toolbar-light", components:[
			{kind: "Button", label: AccountsUtil.BUTTON_CANCEL, className:"accounts-toolbar-btn", onclick: "doAddAccount_Cancel"}
		]},
		{kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open", name: "openAppCatalog"}
	],
	
	// Show the list of available accounts the user can add, based on the list of templates
	showAvailableAccounts: function(templates, capability) {
		this.templates = templates;
		this.capability = capability || this.capability;
		this.$.list.render();
	},

	// Render an item in the list 
	listGetItem: function(inSender, inIndex) {
		if (!this.templates || inIndex > this.templates.length)
			return false;
		// The last item in the list is "Find More ..."
		if (inIndex == this.templates.length) {
			this.$.templateIcon.src = AccountsUtil.libPath + "images/appcatalog-32x32.png";
			this.$.templateIcon.srcChanged();
			this.$.templateName.setContent(AccountsUtil.TEXT_FIND_MORE);
			return true;
		}
		if (this.templates[inIndex].icon) {
			this.$.templateIcon.src = this.templates[inIndex].icon.loc_32x32;
			this.$.templateIcon.srcChanged();
		}
		this.$.templateName.setContent(this.templates[inIndex].loc_name);
		return true;
	},

	// User has selected to add a specific account
	templateSelected: function(inSender, inEvent) {
		if (!inEvent || !inEvent.rowIndex === undefined)
			return;
		// Was "Find More ..." tapped?
		if (inEvent.rowIndex == this.templates.length) {
			this.$.openAppCatalog.call({"id": "com.palm.app.enyo-findapps",	"params": {"common": {"sceneType": "search", "params": {
				"type": "connector",
				"connectorInfo": {
					"searchBarTitle" : AccountsUtil.getSynergyTitle(this.capability),
					"searchBarIcon" : AccountsUtil.libPath + "images/acounts-48x48.png",
					"types": (enyo.isArray(this.capability)? this.capability: [this.capability])
				}}}}});
		}
		else
			this.doAddAccount_AccountSelected(this.templates[inEvent.rowIndex]);
	},
});
