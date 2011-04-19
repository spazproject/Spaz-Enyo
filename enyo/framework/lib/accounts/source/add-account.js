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
// this.$.addAccount.showAvailableAccounts(templates);
//
// The callback:
// addSelectedAccount: function(inSender, template) {
//		this.addAccountTemplate = template;		// The template of the account selected

enyo.kind({
	name: "Accounts.addAccountView",
	kind: "enyo.VFlexBox",
	events: {
		onAddAccount_AccountSelected: "",
		onAddAccount_Cancel: ""
	},
	components: [
		{kind:"Header", className:"accounts-header", pack:"center", components: [
				{kind: "Image", src: AccountsUtil.libPath + "images/acounts-48x48.png"},
				{content: AccountsUtil.PAGE_TITLE_ADD_ACCOUNT}
		]},
			
		{kind: "Scroller", flex: 1, components: [
			{kind:"VFlexBox", className:"box-center accounts-body", style:"margin-top:22px", components: [ 
				{name: "list", kind: "VirtualRepeater", onGetItem: "listGetItem", onclick: "templateSelected", components: [
					{kind: "Button", name: "Account", layoutKind: "HFlexLayout", className:"enyo-button-light accounts-btn", components: [
						{kind: "Image", name: "templateIcon", className:"icon-image"},
						{name: "templateName", className:"account-name"}
					]}
				]},
				{kind: "Button", label: AccountsUtil.BUTTON_CANCEL, className:"accounts-btn", onclick: "doAddAccount_Cancel"}
			]},
		]},
		{kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open", name: "openAppCatalog"}
	],
	
	// Show the list of available accounts the user can add, based on the list of templates
	showAvailableAccounts: function(templates) {
		this.templates = templates;
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
		if (inEvent.rowIndex == this.templates.length)
			this.$.openAppCatalog.call({"id": "com.palm.app.enyo-findapps"});
		else
			this.doAddAccount_AccountSelected(this.templates[inEvent.rowIndex]);
	},
});
