/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// Allow the editing of account credentials when creating or editing an account
//
// Usage:
// ======
//
//
// TODO:
// 1. Handle broken capabilities
// 2. Handle case where this is no template (restore to different device)



enyo.kind({
	name: "Accounts.modifyView",
	kind: "Pane",
	events: {
		onModifyView_Success: "",
		onModifyView_Cancel: "",
		onModifyView_ChangeLogin: ""
	},
	components: [
		{},		// Empty view so that nothing is shown when switching to the Credentials view from a "bad credentials" dashboard
		{kind: "VFlexBox", name:"standardModifyView", flex:1, className:"enyo-bg", components: [
			{kind:"Header", className:"accounts-header", pack:"center", components: [
				{kind: "Image", name:"titleIcon"},
		        {content: AccountsUtil.PAGE_TITLE_ACCOUNT_SETTINGS}
			]},
			{kind: "Scroller", flex: 1, components: [
				{kind: "VFlexBox", className:"box-center accounts-body", components: [
					{kind: "RowGroup", caption: AccountsUtil.GROUP_TITLE_ACCOUNT_NAME, components: [
						{kind: "Input", name: "accountName", spellcheck: false, autocorrect:false}
					]},
					{name: "useAccountWith", kind: "RowGroup", caption: AccountsUtil.GROUP_TITLE_USE_ACCOUNT_WITH, components: [
						{name: "capabilitiesList", kind: "VirtualRepeater", onGetItem: "listGetItem", onclick: "accountSelected", className:"accounts-rowgroup-item", components: [
							{kind: "Item", name: "capabilityRow", layoutKind: "HFlexLayout", flex: 1, className:"accounts-list-item", components: [
								{name: "capability", flex: 1},
								{name: "capabilityEnabled",	kind: "ToggleButton", onChange: "capabilityToggled"}
							]}
						]},
					]},
					{name:"changeLoginButton", kind: "Button", caption: AccountsUtil.BUTTON_CHANGE_LOGIN, onclick: "changeLoginTapped", className:"accounts-btn"},
					{name:"removeAccountButton", kind: "ActivityButton", caption: AccountsUtil.BUTTON_REMOVE_ACCOUNT, className: "enyo-button-negative accounts-btn", onclick: "confirmAccountRemoval"},
					{name:"createAccountButton", kind: "ActivityButton", caption: AccountsUtil.BUTTON_CREATE_ACCOUNT, onclick: "createAccountTapped", className:"enyo-button-affirmative accounts-btn"},
				]},
			]},
			{kind:"Toolbar", components:[
				{name:"cancelButton", kind: "Button", className:"enyo-button-dark accounts-toolbar-btn", onclick: "backHandler"},
			]},
			{name: "removeConfirmDialog", kind: "Popup", modal: true, scrim: true, className: "accounts-dialog-width", components: [
				{content: AccountsUtil.BUTTON_REMOVE_ACCOUNT},
				{content: AccountsUtil.TEXT_REMOVE_CONFIRM},
				{kind: "Button", caption: AccountsUtil.BUTTON_REMOVE_ACCOUNT, className: "enyo-button-negative", onclick: "removeAccount"},
				{kind: "Button", caption: AccountsUtil.BUTTON_KEEP_ACCOUNT, onclick: "keepAccount"}
			]},
		]},
		{kind: "CrossAppUI", name:"customAccountsUI", onResult: "doModifyView_Success"},
		
		{name: "createAccount", kind: "PalmService", service: enyo.palmServices.accounts, method: "createAccount", onResponse: "createResponse"},
		{name: "modifyAccount", kind: "PalmService", service: enyo.palmServices.accounts, method: "modifyAccount", onResponse: "doModifyView_Success"},
		{name: "deleteAccount", kind: "PalmService", service: enyo.palmServices.accounts, method: "deleteAccount", onResponse: "doModifyView_Success"}
	],
	
	// Pass in a validationResult if creating the account, or the account and template if modifying it
	displayCreateView: function(validationResult, template, capability) {
		this.validationResult = validationResult;
		this.template = template || {};
		this.capability = capability || "";
		
		// Hide buttons not needed when creating a new account
		this.$.changeLoginButton.hide();
		this.$.removeAccountButton.hide();
		// Get the "Create Account" button back to normal
		this.$.createAccountButton.active = false;
		this.$.createAccountButton.activeChanged();
		AccountsUtil.changeCaption(this.$.createAccountButton, AccountsUtil.BUTTON_CREATE_ACCOUNT);
		AccountsUtil.disableControl(this.$.createAccountButton, false);

		AccountsUtil.disableControl(this.$.accountName, false);
		AccountsUtil.disableControl(this.$.changeLoginButton, false);
		AccountsUtil.disableControl(this.$.removeAccountButton, false);
		AccountsUtil.changeCaption(this.$.cancelButton, AccountsUtil.BUTTON_CANCEL);
		
		// Set the account name
		this.$.accountName.value = validationResult.alias || this.template.loc_name;
		this.$.accountName.valueChanged();
		
		// Update the icon on the page title
		if (this.template && this.template.icon && this.template.icon.loc_48x48)
			this.$.titleIcon.src = this.template.icon.loc_48x48;
		else
			this.$.titleIcon.src = AccountsUtil.libPath + "images/acounts-48x48.png"
		this.$.titleIcon.srcChanged();

		// Set the focus on the account name
//		enyo.asyncMethod(this.$.accountName, "forceFocus");
		
		this.displayCapabilities(true);
		this.selectViewByName("standardModifyView");
	},
	
	// Pass in a validationResult if creating the account, or the account and template if modifying it
	displayModifyView: function(account, capability) {
		this.displayModifyData(account, capability);
		this.selectViewByName("standardModifyView");
	},
	
	// Display the view for Bad credentials
	displayBadCredentialsView: function(account) {
		// Set up the data on this view, so that control can return to it
		this.displayModifyData(account);
		
		// Go to the credentials view
		enyo.asyncMethod(this, "changeLoginTapped");
	},
	
	// Pass in a validationResult if creating the account, or the account and template if modifying it
	displayModifyData: function(account, capability) {
		this.account = account || {};
		this.template = account || {};	// The template has been merged into the account
		this.capability = capability || "";
		
		// Hide buttons not needed when modifying an account
		this.$.createAccountButton.hide();
		// Stop the spinner on the button
		this.$.removeAccountButton.active = false;
		this.$.removeAccountButton.activeChanged();

		AccountsUtil.changeCaption(this.$.cancelButton, AccountsUtil.BUTTON_BACK);
			
		// Set the account name
		this.$.accountName.value = this.account.alias || this.account.loc_name;
		this.$.accountName.valueChanged();
		
		// Enable all the buttons
		AccountsUtil.disableControl(this.$.accountName, false);
		AccountsUtil.disableControl(this.$.changeLoginButton, false);
		AccountsUtil.disableControl(this.$.removeAccountButton, false);
		
		// Update the icon on the page title
		if (this.template && this.template.icon && this.template.icon.loc_48x48)
			this.$.titleIcon.src = this.template.icon.loc_48x48;
		else
			this.$.titleIcon.src = AccountsUtil.libPath + "images/acounts-48x48.png"
		this.$.titleIcon.srcChanged();

		this.displayCapabilities(false);
	},
	
	// Display the list of capabilites that the template supports
	displayCapabilities: function(newAccount) {
		// Determine which capabilities are active, and which should be disabled
		if (this.template.capabilityProviders) {
			for (var i=0, l=this.template.capabilityProviders.length; i<l; i++) {
				var c = this.template.capabilityProviders[i];
				// Get the localized name of the capability
				c.displayText = AccountsUtil.getCapabilityText(c.capability);
				
				// For new accounts, all capabilities should be enabled
				if (newAccount)
					c.enabled = true;
				else {
					c.enabled = !!c._id;
				}
				// Can the capability be toggled?
				c.changeAllowed = false;
				if (!c.alwaysOn && c.capability != this.capability)
					c.changeAllowed = true;
					
				// Does this capability have a config?
				if (c.config)
					this.config = c.config;
			}
			// Prevent a singleton capability on accounts with only one possible capability from being turned off
			if (this.template.capabilityProviders.length === 1 && this.template.capabilityProviders[0].enabled)
				this.template.capabilityProviders[0].changeAllowed = false;
		}
		
		// Render the list of capabilities
		this.$.capabilitiesList.render();
		this.capabilitiesDirty = false;
	},

	listGetItem: function(inSender, inIndex) {
		if (!this.template || !this.template.capabilityProviders || inIndex >= this.template.capabilityProviders.length)
			return false;
		var c = this.template.capabilityProviders;
		this.$.capability.setContent(c[inIndex].displayText);
		this.$.capabilityEnabled.state = c[inIndex].enabled;
		this.$.capabilityEnabled.disabled = !c[inIndex].changeAllowed;
		this.$.capabilityEnabled.ready();
		console.log("listGetItem: " + c[inIndex].displayText + " changeAllowed = " + c[inIndex].changeAllowed)
		return true;
	},
	
	capabilityToggled: function(inSender) {
		// Make a note of the new value
		this.template.capabilityProviders[this.$.capabilitiesList.fetchRowIndex()].enabled = inSender.getState(); 
		this.capabilitiesDirty = true;
	},
	
	// The "Change Login" button was tapped
	changeLoginTapped: function() {
		this.doModifyView_ChangeLogin({
			account: this.account
		});
	},
	
	confirmAccountRemoval: function() {
		// Open the "remove confirm" dialog
		this.$.removeConfirmDialog.openAtCenter();
	},
	
	// The "Remove Account" button in the "remove confirm" dialog was tapped
	removeAccount: function() {
		// Close the dialog
		this.$.removeConfirmDialog.close();

		// Start the spinner on the button
		this.$.removeAccountButton.active = true;
		this.$.removeAccountButton.activeChanged();

		// Delete this account
		this.$.deleteAccount.call({accountId:this.account._id});
	},
	
	keepAccount: function() {
		// Close the dialog
		this.$.removeConfirmDialog.close();
	},

	// The "Create Account" button was tapped
	createAccountTapped: function() {
		// Disable the "Create Account" button
		AccountsUtil.disableControl(this.$.createAccountButton, true);
		// Change the text to "Creating Account..."
		AccountsUtil.changeCaption(this.$.createAccountButton, AccountsUtil.BUTTON_CREATING_ACCOUNT);
		// Start the spinner on the button
		this.$.createAccountButton.active = true;
		this.$.createAccountButton.activeChanged();
		// Disable the account name field
		AccountsUtil.disableControl(this.$.accountName, true);
		
		// See which capabilities are enabled
		var enabledCapabilities = [];
		for (var i = 0, l = this.template.capabilityProviders.length; i < l; i++) {
			if (this.template.capabilityProviders[i].enabled)
				enabledCapabilities.push({"id":this.template.capabilityProviders[i].id});
		}
		console.log("enabledCapabilities:" + enyo.json.stringify(enabledCapabilities));
		
		// Create the account
		this.$.createAccount.call({
			templateId: this.validationResult.templateId,
			username: this.validationResult.username,
			alias:  this.$.accountName.getValue(),
			credentials: this.validationResult.credentials,
			config: this.validationResult.config || this.config,
			capabilityProviders: enabledCapabilities
		});
	},
	
	createResponse: function(inSender, inResponse) {
		// Return to the account list of account creation was successful
		if (inResponse.returnValue)
			this.doModifyView_Success();
	},
	
	// Back was tapped
	backHandler: function() {
		var name = this.$.accountName.getValue();
		var nameDirty = name && this.account && name !== this.account.alias;

		// If the capabilities or account name was changed then save them
		if (this.account && (this.capabilitiesDirty || nameDirty)) {
			var param = {
				"accountId": this.account._id,
				"object": {}
			}
			if (this.capabilitiesDirty) {
				// See which capabilities are enabled
				var enabledCapabilities = [];
				for (var i = 0, l = this.template.capabilityProviders.length; i < l; i++) {
					if (this.template.capabilityProviders[i].enabled) 
						enabledCapabilities.push({"id":this.template.capabilityProviders[i].id});
				}
				console.log("enabledCapabilities:" + enyo.json.stringify(enabledCapabilities));
				param.object.capabilityProviders = enabledCapabilities;
			}
			
			if (nameDirty) {
				param.object.alias = name;
			}

			// Modify the account
			this.$.modifyAccount.call(param);
		}

		this.doModifyView_Cancel();
	}
	
});
