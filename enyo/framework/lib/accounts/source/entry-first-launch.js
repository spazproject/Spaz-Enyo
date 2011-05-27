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
		{kind: "VFlexBox", name: "loadingAccounts", className:"enyo-bg", components: [
			{kind:"Toolbar", className:"enyo-toolbar-light accounts-header", pack:"center", components: [
					{kind: "Image", name:"welcomeIconStart"},
					{kind: "Control", content: AccountsUtil.TEXT_WELCOME}
			]},
			{className:"accounts-header-shadow"},
			{kind: "HFlexBox", className:"box-center", style:"margin-top:0", flex:1, pack:"center", align:"center", components: [
				{kind:"Spinner", name:"getAccountsSpinner"},
				{content: AccountsUtil.LOADING_ACCOUNTS}
			]},
		]},

		// The next view actually shows the account information		
		{kind: "VFlexBox", name: "firstLaunchFromPIMApp", className:"enyo-bg", components: [
			// Display one of two headers depending on the number of accounts
			{kind:"Toolbar", name:"noAccountsSetUpHeader", className:"enyo-toolbar-light accounts-header", pack:"center", components: [
				{kind: "Image", name:"welcomeIcon"},
				{kind: "Control", content: AccountsUtil.TEXT_WELCOME}
			]},
			{kind:"Toolbar", name: "oneOrMoreAccountsHeader", className:"enyo-toolbar-light accounts-header", pack:"center", components: [
				{kind: "Image", name: "titleIcon"},
				{kind: "Control", name: "titleText"}
			]},
			{className:"accounts-header-shadow"},
			{kind: "Scroller", flex:1, components: [
				{kind:"Control", name: "noAccountsSetUpYet", style:"width:100%", components: [
					{kind:"Control", className:"box-center", components:[
						{name: "getStartedWithProfileAccount", components: [
							{content: AccountsUtil.TEXT_GET_STARTED_PROFILE_ACCOUNT, className:"accounts-body-title"},
							{kind: "Button", className: "enyo-button-affirmative accounts-btn", name: "profileButton", onclick: "doAccountsFirstLaunchDone"},
							{content: AccountsUtil.TEXT_OR_ADD_NEW_ACCOUNT, className:"accounts-body-title"}
						]},
						{name: "getStartedWithLocalStorageAccount", components: [
							{name:"localFileStorageMsg", className:"accounts-body-title"},
							{kind:"RowGroup", className:"accounts-group", components:[
								{kind: "Item", name: "Account", layoutKind: "HFlexLayout", align:"center", className:"accounts-list-item", components: [
									{kind: "Image", name:"localStorageImage", className:"icon-image"},
									{name: "localStorageName"}
								]}
							]},
							{kind: "Button", className: "enyo-button-affirmative accounts-btn", content: AccountsUtil.BUTTON_GO, onclick: "doAccountsFirstLaunchDone"},
							{content: AccountsUtil.TEXT_OR_ADD_NEW_ACCOUNT, className:"accounts-body-title"}
						]},
						{name: "welcomeMsg", className:"accounts-body-title"},
						{name: "templateList", kind: "VirtualRepeater", onSetupRow: "listGetTemplate", onGetItem: "listGetTemplate", onclick: "templateSelected", className:"accounts-btn-list", components: [
							{name: "template", kind: "Button", className:"accounts-btn", align:"center", layoutKind: "HFlexLayout", components: [
							        {kind: "Image", name:"templateIcon", className:"icon-image"},
							        {name: "templateName"}
							]}
						]},
					]},
				]},
				{kind:"Control", name: "oneOrMoreAccounts", style:"width:100%", components: [
					{kind:"Control", className:"box-center", components:[
						{content: AccountsUtil.TEXT_GET_STARTED_EXISTING_ACCOUNTS, className:"accounts-body-title"},
						{kind:"RowGroup", className:"accounts-group", components:[
							{kind: "Accounts.accountsList", name: "accountsList"},
						]},
						{kind: "enyo.Button", className: "enyo-button-affirmative accounts-btn", label:AccountsUtil.BUTTON_GO, onclick: "doAccountsFirstLaunchDone"},
						{content: AccountsUtil.TEXT_OR_ADD_NEW_ACCOUNT, className:"accounts-body-title"},
						{kind: "enyo.Button", className:"enyo-button-dark accounts-btn", label: AccountsUtil.BUTTON_ADD_ACCOUNT, onclick: "AddAccount"}
					]},
				]},
				{name: "client", style: "width: 100%; position: relative;"}
			]},

			{name: "accounts", kind: "Accounts.getAccounts", onGetAccounts_AccountsAvailable: "onAccountsAvailable"},
			{kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open", name: "openAppCatalog"},
		]},
		{kind: "AccountsUI", name: "AccountsView", capability: this.capability, onAccountsUI_Done: "goToFirstLaunchView"},
		{kind: "Accounts.credentialView", name: "changeCredentialsView", onCredentials_ValidationSuccess: "validationSuccess", onCredentials_Cancel: "goToFirstLaunchView"},
		{kind: "Accounts.modifyView", name: "modifyAccountView", onModifyView_Success: "goToFirstLaunchView", onModifyView_Cancel: "goToFirstLaunchView"},
		{kind: "Accounts.crossAppUI", name:"customAccountsUI", onResult: "handleCustomUIResult"}
	],
	
	startFirstLaunch: function(exclude, msgs) {
		this.exclude = AccountsUtil.toArray(exclude);
		if (!msgs || !msgs.pageTitle) {
			console.log("ERROR: msgs parameter missing pageTitle message!");
			return;
		}
		
		// Temp fix for Photos until they get their submission in
		if (this.capability === "PHOTO.UPLOAD") {
			this.capability = ["PHOTO.UPLOAD","LOCAL.FILESTORAGE"];
			msgs.localFileStorage = $L("Get started with photos on your device:");
		}
		// Temp fix for Quick Office until they get their submission in
		if (this.capability === "DOCUMENTS") {
			this.capability = ["DOCUMENTS","LOCAL.FILESTORAGE"];
			msgs.localFileStorage = $L("Get started with documents on your device:");
		}
		
		console.log("startFirstLaunch: capabilty = " + this.capability);
		this.msgs = msgs;
		// Set up the page title
		this.$.titleText.setContent(msgs.pageTitle);
		this.$.welcomeIcon.setSrc(this.iconSmall);
		this.$.welcomeIconStart.setSrc(this.iconSmall);
		this.$.titleIcon.setSrc(this.iconSmall);

		// Set up the "To get started, set up a XXX account" message
		this.$.welcomeMsg.setContent(msgs.welcome);
		
		// Get the list of accounts to determine which view to show.  Include the HP Profile account
		this.$.accounts.getAccounts({capability: this.capability}, this.exclude);
		
		// Get the list of accounts to display if there is more than one account
		this.$.accountsList.getAccountsList(this.capability, this.exclude, true);
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
		for (var i=0, l = inResponse.accounts.length; i< l; i++) {
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
			this.$.profileButton.setCaption(this.profileAccount.username);
		}
		else {
			// Hide the "Get started with your HP webOS account"
			this.$.getStartedWithProfileAccount.hide();
			this.$.getStartedWithLocalStorageAccount.hide();
		}
		
		// There are 2 views: one for no accounts and another for one or more accounts
		if (this.accounts.length) {
			this.$.noAccountsSetUpHeader.hide();
			this.$.noAccountsSetUpYet.hide();
			this.$.oneOrMoreAccountsHeader.show();
			this.$.oneOrMoreAccounts.show();
		}
		else {
			// There are no accounts yet
			this.$.oneOrMoreAccountsHeader.hide();
			this.$.oneOrMoreAccounts.hide();
			this.$.noAccountsSetUpHeader.show();
			this.$.noAccountsSetUpYet.show();
			
			// Is there a local storage account?
			if (this.profileAccount && this.msgs.localFileStorage) {
				this.$.getStartedWithLocalStorageAccount.show();
				this.$.getStartedWithProfileAccount.hide();
				this.$.localFileStorageMsg.setContent(this.msgs.localFileStorage);
				this.$.localStorageImage.setSrc(this.profileAccount.icon.loc_32x32);
				this.$.localStorageName.setContent(this.profileAccount.alias);
			}
			
			// Render the list of available accounts to add
			this.$.templateList.setStripSize(this.addTemplates.length);		
			this.$.templateList.render();
		}
		
		// Go to the Accounts view, if the current view is "Loading Accounts"
		if (this.getViewName() === "loadingAccounts") {
			this.selectViewByName("firstLaunchFromPIMApp");	
			enyo.asyncMethod(this.$.getAccountsSpinner, "hide");
		}
	},
	
	// Render an item in the list of accounts that can be added
	listGetTemplate: function(inSender, inIndex) {
		if (!this.addTemplates || inIndex > this.addTemplates.length)
			return false;
		// The last item in the list is "Find More ..."
		if (inIndex == this.addTemplates.length) {
			this.$.templateIcon.setSrc(AccountsUtil.libPath + "images/appcatalog-32x32.png");
			this.$.templateName.setContent(AccountsUtil.TEXT_FIND_MORE);
			return true;
		}
		if (this.addTemplates[inIndex].icon) {
			this.$.templateIcon.setSrc(this.addTemplates[inIndex].icon.loc_32x32);
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
			this.$.openAppCatalog.call({"id": "com.palm.app.enyo-findapps",	"params": {"common": {"sceneType": "search", "params": {
				"type": "connector",
				"connectorInfo": {
					"searchBarTitle" : AccountsUtil.getSynergyTitle(this.capability),
					"searchBarIcon" : this.iconSmall,
					"types": (enyo.isArray(this.capability)? this.capability: [this.capability])
				}}}}});
		}
		else {
			this.template = this.addTemplates[inEvent.rowIndex];
			// Does this template have custom UI?
			if (this.template.validator.customUI) {
				this.$.customAccountsUI.launchCrossAppUI(this.template.validator.customUI, {mode: "create", template: this.template, capability: this.capability});
				this.selectViewByName("customAccountsUI");
			}
			else {
				this.$.changeCredentialsView.displayCredentialsView(this.template, this.capability);
				this.selectViewByName("changeCredentialsView");
			}
		}
	},

	// Handle the validation response from the custom UI
	handleCustomUIResult: function(inSender, msg) {
		//console.log("handleCustomUIResult:" + enyo.json.stringify(msg));
		if (msg && msg.returnValue && msg.template) {
			msg.templateId = msg.template.templateId;
			this.$.modifyAccountView.displayCreateView(msg, msg.template, this.capability);
			this.selectViewByName("modifyAccountView");
		}
		else {
			// Return to the main First Launch view
			this.selectViewByName("firstLaunchFromPIMApp");
		}
	},
	
	goToFirstLaunchView: function() {
		// Go back from the credentials view to the modify account view
		this.selectViewByName("firstLaunchFromPIMApp");
	},
	
	// User's credentials validated okay
	validationSuccess: function(inSender, validationResult) {
		if (!validationResult)
			return;
		// Was the capability added to the account? (in which case there is nothing more to do here)
		if (validationResult.capabilityWasEnabled)
			this.selectViewByName("firstLaunchFromPIMApp");
		else {
			this.$.modifyAccountView.displayCreateView(validationResult, this.template, this.capability);
			this.selectViewByName("modifyAccountView");
		}
	},
	
	// "Add Account" button was tapped
	AddAccount: function(button) {
		this.$.AccountsView.AddAccount(this.addTemplates, this.capability);
		this.selectViewByName("AccountsView");
	},
	
});
