/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// Allow the editing of account credentials when creating or editing an account
//
// Usage:
// ======
//
// Depends:
// Add this line to your app's depends.js file:
// "$enyo-lib/accounts/"
//
// Kind:
// Two kinds are available, depending on whether you want a Page Title and "Cancel" button on your screen or not
// {kind: "Accounts.credentialView", name: "changeCredentials", onCredentials_ValidationSuccess: "onValidationSuccess", onCredentials_Cancel: "backHandler"}  // Full screen incl. title and Cancel
// {kind: "Accounts.credentials", name: "changeCredentials", onCredentials_ValidationSuccess: "onValidationSuccess"}, // No title or Cancel button
//
// Prompt the user for credentials:
// account: The account credentials to change.  Pass in the account account if creating an account
// capability: With accounts having multiple validators this specifies the capability that MUST succeed for the account to be created.  Example, 'MAIL'
// this.$.changeCredentials.displayCredentialsView(account, capability);
//
// The callback:
// 	onValidationSuccess: function(inSender, validationObj) {
//		var validationObj = validationObj;	// Validation object used to create the account

enyo.kind({
	name: "Accounts.credentials",
	kind: enyo.Control,
	events: {
		onCredentials_ValidationSuccess: "",
		onCredentials_Cancel: "",
	},
	components: [
		{name: "usernameTitle", kind: "RowGroup", className:"accounts-group", components: [
			{kind: "Input", name: "username", spellcheck: false, autocorrect:false, autoCapitalize: "lowercase", inputType:"email", changeOnInput: true, onchange: "keyTapped", onkeydown:"checkForEnter"}
		]},
		{name: "passwordTitle", kind: "RowGroup", className:"accounts-group", components: [
			{kind: "PasswordInput", name: "password", changeOnInput: true, onchange: "keyTapped", onkeydown:"checkForEnter"}
		]},
		{name: "errorBox", kind: "enyo.HFlexBox", className:"error-box", align:"center", showing:false, components: [
			{name: "errorImage", kind: "Image", src: AccountsUtil.libPath + "images/header-warning-icon.png"},
			{name: "errorMessage", className: "enyo-text-error", flex:1}
		]},
		{name:"signInButton", kind: "ActivityButton", className:"enyo-button-affirmative accounts-btn", onclick: "signInTapped"},
		{name:"removeAccountButton", kind: "Accounts.RemoveAccount", className:"accounts-btn", onAccountsRemove_Removing: "removingAccount", onAccountsRemove_Done: "doCredentials_Cancel"},
		
		{name: "callValidators", kind: "PalmService", onResponse: "validationResponse"},
		
		{name: "accounts", kind: "Accounts.getAccounts", onGetAccounts_AccountsAvailable: "onAccountsAvailable", subscribe: false},
		{name: "modifyAccount", kind: "PalmService", service: enyo.palmServices.accounts, method: "modifyAccount"},
	],
	
	// Show the credentials
	displayCredentialsView: function(account, capability) {
		this.account = account;
		this.capability = capability || "";
		
		// Update the group captions
		if (this.account.loc_usernameLabel)
			this.$.usernameTitle.setCaption(this.account.loc_usernameLabel);
		else
			this.$.usernameTitle.setCaption(AccountsUtil.LIST_TITLE_USERNAME);
		if (this.account.loc_passwordLabel)
			this.$.passwordTitle.setCaption(this.account.loc_passwordLabel);
		else
			this.$.passwordTitle.setCaption(AccountsUtil.LIST_TITLE_PASSWORD);
		
		// Clear the password field and initialize the username field
		this.$.password.value = "";
		this.$.password.valueChanged();
		this.$.username.value = this.account.username || "";
		this.$.username.valueChanged();
		
		// Show the "Remove Account" button if the account is in error
		if (this.account.credentialError)
			this.$.removeAccountButton.init(this.account, this.capability);
		else
			this.$.removeAccountButton.hide();
		
		// Reset the form fields
		this.resetForm();
	},
	
	// If both the username and password fields have data in them then enable the "Sign In" button
	keyTapped: function() {
		this.username = this.$.username.getValue();
		this.password = this.$.password.getValue();
		if (this.username.length > 0 && this.password.length > 0)
			AccountsUtil.disableControl(this.$.signInButton, false);
		else
			AccountsUtil.disableControl(this.$.signInButton, true);
	},
	
	checkForEnter: function(inSender, inResponse) {
		// Was 'Enter' tapped?
		if (inResponse.keyCode != 13)
			return;
		if (inSender.getName() === "username") {
			// Advance to the password field
			enyo.asyncMethod(this.$.password, "forceFocus");
		} else {
			// Can the user sign in now?
			if (!this.$.signInButton.getDisabled()) {
				this.$.password.forceBlur();
				this.signInTapped();
			}
			else if (!this.$.username.getDisabled())
				enyo.asyncMethod(this.$.username, "forceFocus");
		}
	},
	
	// The "Sign In" button was tapped
	signInTapped: function() {
		// Disable the "Sign In" and "Remove Acount" buttons
		AccountsUtil.disableControl(this.$.signInButton, true);
		this.$.removeAccountButton.disableButton(true);
		// Change the text to Signing In
		this.$.signInButton.setCaption(AccountsUtil.BUTTON_SIGNING_IN);
		// Start the spinner on the button
		this.$.signInButton.active = true;
		this.$.signInButton.activeChanged();
		// Disable the username and password fields
		AccountsUtil.disableControl(this.$.username, true);
		AccountsUtil.disableControl(this.$.password, true);
		// Hide the error message, if there was one
		this.$.errorBox.hide();

		// The first validator is the one for the account
		this.validators = [{
			id: this.account.templateId,
			validator: LoginUtils.getValidatorAddress(this.account),
			config: this.account.config,
			capability: this.capability	// For now, assume that this is the validator for the requested capability
		}];
		// Add the validators for each capability (if they exist)
		this.account.capabilityProviders.forEach(function (c) {
			if (c.validator) {
				this.validators.push({
					id: c.id,
					validator: LoginUtils.getValidatorAddress(c),
					config: c.config,
					capability: c.capability
				});
				// If this capability supports the requested capability, then remove the capability from the default validator
				if (c.capability === this.capability)
					delete this.validators[0].capability;
			}
		}.bind(this));
		//console.log("signInTapped: validators=" + enyo.json.stringify(this.validators));
		
		// Clear any errors
		this.validationError = undefined;
		// Initialise the validation results
		this.results = {
			templateId: this.account.templateId,
			username: this.username,
			credentials: {},
		};
		
		// Call each validator to validate the credentials
		for (var i=0, l = this.validators.length; i < l; i++) {
			var v = this.validators[i];
			console.log("validate id=" + v.id);
			
			// Create the parameters that are passed to the service
			var params = LoginUtils.createValidatorParams(this.username, this.password, v.id, v.config, undefined, {accountId: this.account._id});
			
			// Create the service parameters
			var props = LoginUtils.getServiceMethod(v.validator);
			this.$.callValidators.call(params, props);
		}
	},
	
	validationResponse: function(inSender, inResponse, inRequest) {
//		console.log("validationResponse: results=" + enyo.json.stringify(inResponse));
//		console.log("validationResponse: inRequest=" + enyo.json.stringify(inRequest.params));
		var req = inRequest.params;
		
		// Loop through the validators.  Save these results and see if there are more outstanding
		var done = true; 
		for (var i=0, l=this.validators.length; i < l; i++) {
			v= this.validators[i];
			if (v.id === req.templateId) {
				// Was there an exception or error?
				if (inResponse.exception || !inResponse.returnValue) {
					// The validation request will fail is ANY capability fails to validate.  This differs from
					// earlier (webOS 2.0) behaviour but is much less confusing for users
					
					// Display the error message for the provided capability if that capability fails to validate
					// otherwise display the first failure since it is probably the most accurate
					if (this.capability && this.capability === v.capability)
						this.validationError = inResponse.errorCode;
					else
						this.validationError = this.validationError || inResponse.errorCode;
				}
				else {
					// Yes, validation worked!  Save the config and credentials
					this.results.config = this.results.config || inResponse.config;
					enyo.mixin(this.results.credentials, inResponse.credentials);
					
					this.results.username = inResponse.username || this.results.username;
					this.results.alias = inResponse.alias || this.results.alias;
				}
				v.done = true;
			}
			else {
				if (!v.done)
					done = false;
			}
		}
		if (!done)
			return;
			
		// All of the validation requests have returned
		console.log("validationResponse: All requests are in!! Error=" + this.validationError);

		// If there is an error then display it and re-enable the Sign In button
		if (this.validationError) {
			this.resetForm(this.validationError);
			return;
		}
		
		// If modifying an existing account then return the successful result now
		if (this.account.username) {
			// Stop the spinner
			this.$.signInButton.active = false;
			this.$.signInButton.activeChanged();
			this.doCredentials_ValidationSuccess(this.results);
		}
		else {
			// Make sure this account isn't a duplicate before it can be saved
			this.$.accounts.getAccounts({templateId: this.account.templateId});
		}
	},

	// The account list has been returned.  See if the account being added currently exists
	onAccountsAvailable: function(inSender, inResponse) {
		var account = inResponse.accounts;
		if (!this.results)
			return;
		if (account && account.length) {
			for (var i in account) {
				if (account[i].username !== this.results.username || account[i].beingDeleted)
					continue;

				// If there are no capabilities then the account was created from the Accounts app
				// In this case display a "duplicate account" error message
				if (!this.capability) {
					this.resetForm("DUPLICATE_ACCOUNT");	// Do not localize!  It will be localized by getErrorText
					return;
				}
				
				// The account is being created from a PIM app.  If the capability is enabled already
				// then this is an attempt to create a duplicate account
				for (var cp in account[i].capabilityProviders) {
					var c = account[i].capabilityProviders[cp];
					// Find the capability
					if (c.capability !== this.capability)
						continue;
					// Now see if the capability is already enabled
					if (c._id) {
						// The capability is already enabled. User is trying to create a duplicate account
						this.resetForm("DUPLICATE_ACCOUNT");	// Do not localize!  It will be localized by getErrorText
						return;
					}
					
					// The capability is currently disabled, but the user would like it enabled - so enable it!
					// Create an array of currently enabled capabilities, starting with this capability
					var enabledCapabilities = [{"id":c.id}];
					console.log("Enabling capability " + c.id + " for account " +  account[i]._id);
					for (var cap in account[i].capabilityProviders) {
						var c = account[i].capabilityProviders[cap];
						if (c._id)
							enabledCapabilities.push({"id":c.id});
					}

					// Modify the account
					var params = {
						"accountId":account[i]._id,
						"object": {
							config: this.results.config,
							credentials: this.results.credentials,
							capabilityProviders: enabledCapabilities
						}
					};
					this.$.modifyAccount.call(params);
					
					// Modify the result to let the caller know the capability was enabled
					this.results.capabilityWasEnabled = true;
					break;
				}
			}
		}
		this.doCredentials_ValidationSuccess(this.results);
		
		// Stop the spinner
		this.$.signInButton.active = false;
		this.$.signInButton.activeChanged();

		// Shouldn't need to delete the results, but the getAccounts is a subscription
		delete this.results;
	},
	
	// Reset all the fields on the form
	resetForm: function(error) {
		// Show an error if one was provided
		if (error) {
			this.$.errorMessage.content = AccountError.getErrorText(error);
			this.$.errorMessage.contentChanged();
			this.$.errorBox.show();
		}
		else {
			this.$.errorBox.hide();
		}
		
		// Enable the username and password fields
		if (this.account.username) {
			AccountsUtil.disableControl(this.$.username, true);
			if (error)
				this.$.password.setSelection({start: 0, end: this.password.length});
			if (this.account.allowPasswordFocus)
				enyo.asyncMethod(this.$.password, "forceFocus");
		}
		else {
			AccountsUtil.disableControl(this.$.username, false);
			if (error) {
				this.$.password.setSelection({start: 0, end: this.password.length});
				enyo.asyncMethod(this.$.password, "forceFocus");
			}
			else
				enyo.asyncMethod(this.$.username, "forceFocus");
		}
		AccountsUtil.disableControl(this.$.password, false);
		
		// Reset the "Sign In" button
		this.$.signInButton.setCaption(AccountsUtil.BUTTON_SIGN_IN);
		this.$.signInButton.active = false;
		this.$.signInButton.activeChanged();
		this.keyTapped();
		
		// Enable the "Remove Account" button
		this.$.removeAccountButton.disableButton(false);
	},
	
	// The account (or capability) is being removed
	removingAccount: function() {
		// Disable the "Sign In" button
		AccountsUtil.disableControl(this.$.signInButton, true);
		// Disable the username and password fields
		AccountsUtil.disableControl(this.$.username, true);
		AccountsUtil.disableControl(this.$.password, true);
	}
});

enyo.kind({
	name: "Accounts.credentialView",
	kind: "enyo.VFlexBox",
	className:"enyo-bg",
	events: {
		onCredentials_Cancel: "",
		onCredentials_ValidationSuccess: ""
	},
	components: [
		{kind:"Toolbar", className:"enyo-toolbar-light accounts-header", pack:"center", components: [
			{kind: "Image", name:"titleIcon"},
	        {kind: "Control", content: AccountsUtil.PAGE_TITLE_SIGN_IN}
		]},
		{className:"accounts-header-shadow"},
		{kind: "Scroller", flex: 1, components: [
			{kind: "Control", className:"box-center", components: [
				{kind: "Accounts.credentials", name: "credentials", onCredentials_ValidationSuccess: "doCredentials_ValidationSuccess", onCredentials_Cancel: "doCredentials_Cancel"},
			]}
		]},
		{className:"accounts-footer-shadow"},
		{kind:"Toolbar", className:"enyo-toolbar-light", components:[
			{kind: "Button", label: AccountsUtil.BUTTON_CANCEL, className:"accounts-toolbar-btn", onclick: "doCredentials_Cancel"}
		]},
	],
	
	displayCredentialsView: function(account, capability) {
		// Update the icon on the page title
		if (account && account.icon && account.icon.loc_48x48)
			this.$.titleIcon.src = account.icon.loc_48x48;
		else
			this.$.titleIcon.src = AccountsUtil.libPath + "images/acounts-48x48.png"
		this.$.titleIcon.srcChanged();

		account.allowPasswordFocus = true;
		this.$.credentials.displayCredentialsView(account, capability);
	}
})
