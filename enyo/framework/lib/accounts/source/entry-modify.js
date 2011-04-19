/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// This provides UI to edit an account.  These fields are provided:
// 1. Account Name
// 2. Email address (field name can be overwritten by loc_usernameLabel in the account template)
// 3. Password (field name can be overwritten by loc_passwordLabel in the account template)
// 4. "Sign In" button
// 5. "Remove Account" button
// 6. Custom app chrome (can be used to add additional fields to the bottom of the view)
//
// When this view is done the onAccountsUI_Done event will be sent to the calling app
//
// Usage:
// ======
//
// Depends:
// Add this line to your app's depends.js file:
// "$enyo-lib/accounts/"
//
// Kind:
// {kind: "AccountsModify", name: "AccountsModify", capability: "CONTACTS", onAccountsModify_Done: "accountsDone"}
// You can add custom components to the view that will appear between the "Remove Account" and "Back" buttons, like this:
// {kind: "AccountsModify", name: "AccountsModify", capability: "CONTACTS", onAccountsModify_Done: "accountsDone", components: [{kind:"Button", label:"Additional prefs"}]},
//
// Initialise the view:
// this.$.AccountsModify.ModifyAccount(account, template, capability) // template is optional; the template information is included in the account
//
// The callback:
// onAccountsUI_Done: function() {
//		this.$.pane.selectViewByName("prefsAndAccounts");

enyo.kind({
	name: "AccountsModify",
	kind: "Pane",
	published: {
		capability:"",
	},
	events: {
		onAccountsModify_Done: ""
	},
	className:"accounts-modify",
	components: [
		{},		// Empty view so that nothing is shown when switching to the Credentials view from a "bad credentials" dashboard
		{name: "accountModificationFromPIMApp", kind: "enyo.VFlexBox", components: [
			{kind:"Header", className:"accounts-header", pack:"center", components: [
				{kind: "Image", src: AccountsUtil.libPath + "images/acounts-48x48.png"},
		        {content: AccountsUtil.PAGE_TITLE_ACCOUNT_SETTINGS}
			]},
			{kind: "enyo.VFlexBox", className:"box-center accounts-body", components: [
				{kind: "RowGroup", caption: AccountsUtil.GROUP_TITLE_ACCOUNT_NAME, components: [
					{kind: "Input", name: "accountName", spellcheck: false, autocorrect:false}
				]},
				{kind: "Accounts.credentials", name: "credentials", onCredentials_ValidationSuccess: "saveAccountCredentials"},
				{kind: "ActivityButton", name: "removeAccountButton", label: AccountsUtil.BUTTON_REMOVE_ACCOUNT, className: "enyo-button-negative accounts-btn", onclick: "confirmAccountRemoval"}
			]},
			{name: "removeConfirmDialog", kind: "Popup", dismissWithClick: true, scrim: true, components: [
				{className: "popup-title", content: AccountsUtil.BUTTON_REMOVE_ACCOUNT},
				{className: "popup-message ", content: AccountsUtil.TEXT_REMOVE_CONFIRM},
				{kind: "Button", caption: AccountsUtil.BUTTON_REMOVE_ACCOUNT, className: "enyo-button-negative", onclick: "removeAccount"},
				{kind: "Button", caption: AccountsUtil.BUTTON_KEEP_ACCOUNT, onclick: "keepAccount"}
			]},
			{name: "client"},
			// {name: "Spacer", flex:1},
			{kind: "enyo.Button", label: AccountsUtil.BUTTON_BACK, onclick: "saveAccountName", className:"accounts-btn box-center"},
			
			{name: "modifyAccount", kind: "PalmService", service: enyo.palmServices.accounts, method: "modifyAccount", onResponse: "doAccountsModify_Done"}
		]},
		
		{kind: "Accounts.credentialView", name: "changeCredentialsView", onCredentials_ValidationSuccess: "saveAccountCredentials", onCredentials_Cancel: "backHandler"},
		{kind: "Accounts.modifyView", name: "modifyAccountView", onModifyView_ChangeLogin: "editCredentials", onModifyView_Cancel: "doAccountsModify_Done", onModifyView_Success: "doAccountsModify_Done"},
		{kind: "CrossAppUI", name:"customAccountsUI", onResult: "doAccountsModify_Done"}
	],
	
	// Account to modify was tapped on
	ModifyAccount: function(account, template, capability) {
		// If no capability is provided then Accounts.modifyView provides the necessary functionality
		// Typically only the Accounts app won't provide a capability; all PIM apps must provide a capability
		this.account = account;
		this.template = template || account;
		this.capability = capability || this.capability;
		if (!this.capability) {
			this.$.modifyAccountView.displayModifyView(account);
			this.selectViewByName("modifyAccountView");
		}
		else if (this.account.templateId === "com.palm.palmprofile"){
			throw "Not possible to edit com.palm.palmprofile account";
		}
		else if (this.template.validator.customUI) {
			// This template has custom UI
			AccountsUtil.setCrossAppParameters(this.$.customAccountsUI, template.validator.customUI, {mode:"modify", account: this.account});
			this.selectViewByName("customAccountsUI");
		}
		else {
			this.selectViewByName("accountModificationFromPIMApp");
			this.capability = capability || this.capability;
			// Display the account credentials 
			this.$.credentials.displayCredentialsView(account, capability);
			
			// Set the account name
			this.$.accountName.value = account.alias;
			this.$.accountName.valueChanged();
			
			// Stop the spinner on the "Remove Account" button
			this.$.removeAccountButton.active = false;
			this.$.removeAccountButton.activeChanged();
		}
	},
	
	// Entry point for "bad credentials" dashboard
	ModifyCredentials: function(account) {
		this.account = account;
		this.$.modifyAccountView.displayBadCredentialsView(account);
	},
	
	// Back was tapped.  Save the account name (the only editable field on the screen)
	saveAccountName: function() {
		var name = this.$.accountName.getValue();
		if (name && name !== this.account.alias)
			this.$.modifyAccount.call({"accountId":this.account._id, "object": {"alias": name}})
		this.doAccountsModify_Done();
	},
	
	// The user changed the credentials on the account 
	saveAccountCredentials: function(inSender, validationResult) {
		console.log("saveAccountCredentials: " + enyo.json.stringify(validationResult));
		// Save the validation results
		var param = {
			"accountId": this.account._id,
			"object": {
				config: validationResult.config,
				credentials: validationResult.credentials,
			}
		}
		// Save the account name, if it changed
		var name = this.$.accountName.getValue();
		if (name && name !== this.account.alias)
			param.object.alias = name;

		this.$.modifyAccount.call(param);
		this.doAccountsModify_Done();
	},
	
	confirmAccountRemoval: function() {
		// Open the "remove confirm" dialog
		this.$.removeConfirmDialog.openAtCenter();
	},
	
	// The "Remove Account" button in the "remove confirm" dialog was tapped (PIM apps only)
	removeAccount: function() {
		// Close the dialog
		this.$.removeConfirmDialog.close();

		// Start the spinner on the button
		this.$.removeAccountButton.active = true;
		this.$.removeAccountButton.activeChanged();

		// Remove the capability from the array of capabilities.  This will disable it
		// The account can only be removed from the Accounts app
		for (i=0, l=this.account.capabilityProviders.length; i<l; i++) {
			if (this.account.capabilityProviders[i].capability === this.capability) {
				this.account.capabilityProviders.splice(i, 1);
				break;
			}
		}	
		var param = {
			"accountId": this.account._id,
			"object": {
				capabilityProviders: this.account.capabilityProviders
			}
		}
		// Remove this capability from the account
		this.$.modifyAccount.call(param);
	},
	
	keepAccount: function() {
		// Close the dialog
		this.$.removeConfirmDialog.close();
	},

	editCredentials: function(inSender, details) {
		if (!details || !details.account)
			return;
			
		var account = details.account;
		// If this template has custom UI then switch to it
		if (account.validator && account.validator.customUI) {
			// This template has custom UI
			AccountsUtil.setCrossAppParameters(this.$.customAccountsUI, account.validator.customUI, {mode: "modify", account: account});
			this.selectViewByName("customAccountsUI");
		}
		else {
			this.$.changeCredentialsView.displayCredentialsView(account, this.capability);
			this.selectViewByName("changeCredentialsView");
		}
	},
	
	backHandler: function() {
		// Go back from the credentials view to the modify account view
		this.$.modifyAccountView.displayModifyView(this.account);
		this.selectViewByName("modifyAccountView");
	}
});
