/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// This provides UI for the First Launch of an app.  
// When this view is done the onAccountsFirstLaunchDone event will be sent to the calling app
//
// Usage:
// ======
//
// Depends:
// Add this line to your app's depends.js file:
// "$enyo-lib/accounts/"
//
// Kind:
// {
//	name: "AccountsFirstLaunch",
//	kind: "enyo.VFlexBox",
//	components: [
//	    {
//	    	name:"firstLaunch",
//	    	kind: "firstLaunchView",
//	    	iconSmall: "images/icon-64x64.png",				// Icon used on First Launch view
//	    	components: [{kind:"Button", label:"Connect phone", name:"myPhone", onclick: "myButtonTapped"}],	// Optional: Custom UI that will appear at the bottom of the scene
//	    	onAccountsFirstLaunchDone: "goToMainAppView"	// Callback when First Launch is finished.  Go to your main view
//	    	capability: 'MAIL'								// The calling app's capability (e.g. 'CONTACTS')
//	    }
//
// Show the First Launch view:
// 		var msgs = {
//				pageTitle: $L("Your contacts accounts"),				// Page title if user has accounts they can use
//				welcome: $L("To get started, set up an IM account"),	// Optional - needed if HP Profile account doesn't support the app's capability
//		}
//		// Templates to exclude from the accounts list (can be an array if you need more than one)
//		// Do not exclude com.palm.palmprofile; the library will do the right thing WRT that template
//		var exclude = undefined; 
//		this.$.firstLaunch.startFirstLaunch(this.capability, exclude, msgs);
//
// The callback:
// goToMainAppView: function() {
//		this.$.pane.selectViewByName("myMainView");

enyo.kind({
	name: "firstLaunchView",
	kind: "Pane",
	flex:1,
	published: {
		iconSmall: "",	// Small icon used for the page title
		capability:"",
	},
	events: {
		onAccountsFirstLaunchDone: ""
	},
	components: [
		// The first view shows "Loading Accounts"
		{kind: "VFlexBox", name: "loadingAccounts", components: [
			{kind:"Header", className:"accounts-header", pack:"center", components: [
					{kind: "Image", name:"welcomeIconStart"},
					{content: AccountsUtil.TEXT_WELCOME}
			]},
			{kind: "HFlexBox", className:"box-center", flex:1, pack:"center", align:"center", components: [
				{kind:"Spinner", name:"getAccountsSpinner"},
				{content: $L("Loading Accounts...")}
			]},
		]},
		
		{name: "firstLaunchFromPIMApp", kind: "FadeScroller", flex:1, components: [
			{kind: "VFlexBox", align: "center", components: [
				{name: "noAccountsSetUpYet", style:"width:100%", components: [
					{kind:"Header", className:"accounts-header", pack:"center", components: [
							{kind: "Image", name:"welcomeIcon"},
							{content: AccountsUtil.TEXT_WELCOME}
					]},
					{kind:"VFlexBox", className:"box-center accounts-body", components:[
						{name: "getStartedWithProfileAccount", components: [
							{content: AccountsUtil.TEXT_GET_STARTED_PROFILE_ACCOUNT, className:"accounts-body-text"},
							{kind: "Button", className: "enyo-button-affirmative accounts-btn", name: "profileButton", onclick: "doAccountsFirstLaunchDone"},
							{content: AccountsUtil.TEXT_OR_ADD_NEW_ACCOUNT, className:"accounts-body-text"},
						]},
						{name: "welcomeMsg", className:"accounts-body-text"},
						{name: "templateList", kind: "VirtualRepeater", onGetItem: "listGetTemplate", onclick: "templateSelected", style:"margin-top: 8px", components: [
							{name: "template", kind: "Button", className:"enyo-button-light accounts-btn", align:"center", layoutKind: "HFlexLayout", components: [
						        {kind: "Image", name:"templateIcon", className:"icon-image"},
						        {name: "templateName"}
							]}
						]}
					]},
				]},
				{name: "oneOrMoreAccounts", style:"width:100%", components: [
					{kind:"Header", className:"accounts-header", pack:"center", name: "firstLaunchPageTitle", components: [
						{kind: "Image", name: "titleIcon"},
					    {name: "titleText"}
					]},
					{kind:"VFlexBox", className:"box-center accounts-body", components:[
						{content: AccountsUtil.TEXT_GET_STARTED_EXISTING_ACCOUNTS, className:"accounts-body-text"},
						{kind:"RowGroup", components:[
							{kind: "Accounts.accountsList", name: "accountsList"},
						]},
						{kind: "enyo.Button", className: "enyo-button-affirmative accounts-btn", label:AccountsUtil.BUTTON_GO, onclick: "doAccountsFirstLaunchDone"},
						{content: AccountsUtil.TEXT_OR_ADD_NEW_ACCOUNT, className:"accounts-body-text"},
						{kind: "enyo.Button", className:"enyo-button-light accounts-btn", label: AccountsUtil.BUTTON_ADD_ACCOUNT, onclick: "AddAccount"}
					]},
				]},
				{name: "client", style: "width: 100%; position: relative;"}
			]}, 

			{name: "accounts", kind: "Accounts.getAccounts", onGetAccounts_AccountsAvailable: "onAccountsAvailable"},
			{kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open", name: "openAppCatalog"}
		]},
		{kind: "AccountsUI", name: "AccountsView", capability: this.capability, onAccountsUI_Done: "goToFirstLaunchView"},
		{kind: "Accounts.credentialView", name: "changeCredentialsView", onCredentials_ValidationSuccess: "validationSuccess", onCredentials_Cancel: "goToFirstLaunchView"},
		{kind: "Accounts.modifyView", name: "modifyAccountView", onModifyView_Success: "goToFirstLaunchView", onModifyView_Cancel: "goToFirstLaunchView"}
		
	],
	
	startFirstLaunch: function(exclude, msgs) {
		this.exclude = AccountsUtil.toArray(exclude);
		if (!msgs || !msgs.pageTitle) {
			console.log("ERROR: msgs parameter missing pageTitle message!");
			return;
		}
		console.log("startFirstLaunch: capabilty = " + this.capability);
		// Set up the page title
		this.$.titleText.content = msgs.pageTitle;
		this.$.titleText.contentChanged();
		this.$.welcomeIcon.src = this.iconSmall;
		this.$.welcomeIcon.srcChanged();
		this.$.welcomeIconStart.src = this.iconSmall;
		this.$.welcomeIconStart.srcChanged();
		this.$.titleIcon.src = this.iconSmall;
		this.$.titleIcon.srcChanged();

		// Set up the "To get started, set up a XXX account" message
		this.$.welcomeMsg.content = msgs.welcome;
		this.$.welcomeMsg.contentChanged();
		
		// Get the list of accounts to determine which view to show.  Include the HP Profile account
		this.$.accounts.getAccounts({capability: this.capability}, this.exclude);
		
		// Get the list of accounts to display if there is more than one account
		this.$.accountsList.getAccountsList(this.capability, this.exclude);
		console.log("accountsList.getAccountsList= " + enyo.json.stringify(this.exclude));
		
		this.$.getAccountsSpinner.show();
	},
	
	// The list of accounts has been obtained.  Render the list now
	onAccountsAvailable: function(inSender, inResponse) {
		console.log("onAccountsAvailable: Received account list. len=" + inResponse.accounts.length);
		console.log("onAccountsAvailable: Received add template list. len=" + inResponse.templates.length);
		this.accounts = inResponse.accounts;		
		this.addTemplates = inResponse.templates;
		
		// Special case the HP Profile account
		// Remove it from the array, if it exists
		for (i=0, l = inResponse.accounts.length; i< l; i++) {
			if (this.accounts[i].templateId === "com.palm.palmprofile") {
				this.profileAccount = this.accounts[i];
				this.accounts.splice(i, 1);
				break;
			}
		}
		console.log("onAccountsAvailable: Account list after removing profile. len=" + this.accounts.length);
		
		if (this.profileAccount) {
			// Hide the "To get started, set up a XXX account" message
			this.$.welcomeMsg.hide();
			
			// Put the user's name on the button
			this.$.profileButton.caption = this.profileAccount.username;
			this.$.profileButton.captionChanged(); 
		}
		else {
			// Hide the "Get started with your HP webOS account"
			this.$.getStartedWithProfileAccount.hide();
		}
		
		// There are 2 views: one for no accounts and another for one or more accounts
		if (this.accounts.length) {
			this.$.noAccountsSetUpYet.hide();
			this.$.oneOrMoreAccounts.show();
		}
		else {
			// There are no accounts yet
			this.$.oneOrMoreAccounts.hide();
			this.$.noAccountsSetUpYet.show();

			// Render the list of available accounts to add
			this.$.templateList.render();
		}
		
		// Go to the Accounts view, if the current view is "Loading Accounts"
		if (this.getViewName() === "loadingAccounts")
			this.selectViewByName("firstLaunchFromPIMApp");	
	},
	
	// Render an item in the list of accounts that can be added
	listGetTemplate: function(inSender, inIndex) {
		if (!this.addTemplates || inIndex > this.addTemplates.length)
			return false;
		// The last item in the list is "Find More ..."
		if (inIndex == this.addTemplates.length) {
			this.$.templateIcon.src = AccountsUtil.libPath + "images/appcatalog-32x32.png";
			this.$.templateIcon.srcChanged();
			this.$.templateName.setContent(AccountsUtil.TEXT_FIND_MORE);
			return true;
		}
		if (this.addTemplates[inIndex].icon) {
			this.$.templateIcon.src = this.addTemplates[inIndex].icon.loc_32x32;
			this.$.templateIcon.srcChanged();
		}
		this.$.templateName.setContent(this.addTemplates[inIndex].alias || this.addTemplates[inIndex].loc_name);
		return true;
	},
	
	// User has selected to add a specific account
	templateSelected: function(inSender, inEvent) {
		if (!inEvent || !inEvent.rowIndex === undefined)
			return;
		// Was "Find More ..." tapped?
		if (inEvent.rowIndex == this.addTemplates.length) {
			this.$.openAppCatalog.call({"id": "com.palm.app.enyo-findapps"});
		}
		else {
			this.template = this.addTemplates[inEvent.rowIndex];
			this.$.changeCredentialsView.displayCredentialsView(this.template, this.capability);
			this.selectViewByName("changeCredentialsView");
		}
	},

	goToFirstLaunchView: function() {
		// Go back from the credentials view to the modify account view
		this.selectViewByName("firstLaunchFromPIMApp");
	},
	
	// User's credentials validated okay
	validationSuccess: function(inSender, validationResult) {
		this.$.modifyAccountView.displayCreateView(validationResult, this.template, this.capability);
		this.selectViewByName("modifyAccountView");
	},
	
	// "Add Account" button was tapped
	AddAccount: function(button) {
		this.$.AccountsView.AddAccount(this.addTemplates, this.capability);
		this.selectViewByName("AccountsView");
	},
	
});
