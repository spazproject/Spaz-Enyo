enyo.kind({
	name: "Spaz.AccountsPopup",
	kind: enyo.Popup,
	events: {
		onClose: ""
	},
	scrim: true,
	modal: true,
	//style: "min-height: 250px",
	width: "400px",
	layoutKind: "VFlexLayout",
	components: [
		{kind: "HFlexBox", components: [
			{name: "topHeader", content: "Accounts", kind: "HtmlContent"},
			{name: "header", kind: "HFlexBox", components: [
			
			]},
			{kind: "Spacer"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"}
		]},	
		//very thin divider
		{name: "accountsList", kind: "Spaz.AccountsList", onAccountClick: "viewAccountFromListTap"},
		{kind: "Button", caption: "Add an Account", onclick: "newAccount"},
		
		{name: "typeButton", kind: "Button", style: "padding: 0px 5px;", showing: false, components: [
		   {name: "type", "kind":"ListSelector", onChange: "changeService", className: "accountSelection", value: SPAZCORE_SERVICE_TWITTER, items: [
				    {caption: "Twitter", value: SPAZCORE_SERVICE_TWITTER},
				    {caption: "Identi.ca", value: SPAZCORE_SERVICE_IDENTICA},
				    {caption: $L("Status.net/Custom"), value: SPAZCORE_SERVICE_CUSTOM},
			]},	
		]}
	],
	showAtCenter: function(){
		this.openAtCenter();
	},
	"goTopLevel": function(inSender, InEvent){
		this.editing_acc_id = null; // reset this

		this.$.header.destroyComponents();
		
		this.$.secondLevel.destroy();	
		
		this.$.typeButton.setShowing(false);
	
		this.createComponents(
			[
				{name: "accountsList", kind: "Spaz.AccountsList", onAccountClick: "viewAccountFromListTap"},
				{name: "button", kind: "Button", caption: "Add an Account", onclick: "newAccount"}
			]
		);
		this.$.accountsList.buildAccounts(); // rebuild the accounts array
		this.render();

	},
	"goDownLevel": function(inId){
		var label;

		if (inId === "new") {
			label = "New";
		} else {
			var account = App.Users.get(inId);
			var label   = App.Users.getLabel(inId);
		}


		this.$.header.createComponents([{content: ">", style: "padding: 0px 5px;"}, {content: label}]);
		if(this.$.accountsList){
			this.$.accountsList.destroy();	
		}
		if(this.$.button){
			this.$.button.destroy();			
		}

		this.render();
	},
	viewAccountFromListTap: function(inSender, inEvent, inIndex){
		this.viewAccount(this.$.accountsList.accounts[inIndex].id);
	},
	viewAccount: function(account_id){		
		this.editing_acc_id = account_id;

		this.goDownLevel(account_id);

		if (this.$.secondLevel) {
			this.$.secondLevel.destroy();
		}
		this.createComponents([ //this looks pretty bad. need to figure out what to display.
			{name: "secondLevel", components: [
				//{kind: "Group", components: [
					//{kind: "Item", components: [
						//{name: "accountInfo", content: App.Users.getLabel(account_id)},
					//]},
				//]},
				{kind: "Group", /*caption: "Options",*/ components: [
					{name: "viewUser", kind: "Button", content: "View Profile", onclick: "viewProfile", flex: 1, owner: this},
					{name: "removeAccountFlexBox", kind: "HFlexBox", components: [
						{name: "promptRemoveAccount", kind: "Button", content: "Remove Account", className: "enyo-button-negative", onclick: "promptRemoveAccount", flex: 1, owner: this}
						//{kind: "Button", flex: 1, content: "Change Credentials", account_id: account_id, onclick: "changeCredentials"},
						// ^this may be more pain than it is worth. we would need to flesh out goDownLevel to be able to go down more than one level and so forth.
					]},
				]},
				{kind: "Button", content: "Back", onclick: "goTopLevel", flex: 1}
			]}
		]);

		this.render();
		//this.createAccountEditComponents(App.Users.get(account_id));
	},
	changeCredentials: function(inSender, inEvent){
		this.createAccountEditComponents(App.Users.get(inSender.account_id));
	},
	"newAccount": function(inSender, inEvent){
		//this.$.header.destroyComponents();
		this.goDownLevel("new");
		this.createAccountEditComponents();
	},
	changeService: function(inSender){
		this.createAccountEditComponents();	
	},
	createAccountEditComponents: function(accountObject) {

		// @TODO - show custom api url input if STATUSNET or CUSTOM

		if (this.$.secondLevel) {
			this.$.secondLevel.destroy();
		}
		this.$.typeButton.setShowing(true);
		switch(this.$.type.getValue()){
			case SPAZCORE_SERVICE_TWITTER:
				this.createComponents([
					{name: "secondLevel", components: [	
						{kind: "Group", components: [
							{kind: "ActivityButton", caption: "Get Authorization", onclick: "getPinAuthorization"},
							{kind: "Item", components: [
								{name: "pinInput", kind: "Input", hint: "Pin Number", autoKeyModifier: "num-lock", autoCapitalize: "lowercase", autocorrect: false, spellcheck: false}	
							]},							
						]},
						{kind: "HFlexBox", components: [
							{kind: "Button", flex: 1, caption: "Cancel", onclick: "goTopLevel"},
							{name: "saveButton", kind: "ActivityButton", flex: 1, caption: "Save", onclick: "saveAccount"}
						]}
					]}
				]);
				break;
			case SPAZCORE_SERVICE_IDENTICA:
				this.createComponents([
					{name: "secondLevel", components: [	
						{kind: "Group", components: [
							{kind: "Item", components: [
								{name: "username", kind: "Input", hint: "username", autoCapitalize: "lowercase", autocorrect: false, spellcheck: false},
							]},
							{kind: "Item", components: [
								{name: "password", kind: "PasswordInput", hint: "password"},
							]},							
						]},
						{kind: "HFlexBox", components: [
							{kind: "Button", flex: 1, caption: "Cancel", onclick: "goTopLevel"},
							{name: "saveButton", kind: "ActivityButton", flex: 1, caption: "Save", onclick: "saveAccount"}
						]}
					]}
				]);
				break;
			case SPAZCORE_SERVICE_CUSTOM: 
				this.createComponents([
					{name: "secondLevel", components: [	
						{kind: "Group", components: [
							{kind: "Item", components: [
								{name: "username", kind: "Input", hint: "username", autoCapitalize: "lowercase", autocorrect: false, spellcheck: false},
							]},
							{kind: "Item", components: [
								{name: "password", kind: "PasswordInput", hint: "password"},
							]},	
							{kind: "Item", components: [
								{name: "api_base_url", kind: "Input", hint: "Custom API URL"}
							]}						
						]},
						{kind: "HFlexBox", components: [
							{kind: "Button", flex: 1, caption: "Cancel", onclick: "goTopLevel"},
							{name: "saveButton", kind: "ActivityButton", flex: 1, caption: "Save", onclick: "saveAccount"}
						]}
					]}
				]);
				break;

		}		

		this.render();

		if (accountObject) {
			this.editing_acc_id = accountObject.id;

			this.$.username.setValue(accountObject.username);

			if (accountObject.type === SPAZCORE_SERVICE_TWITTER) {
				this.$.password.show();
			} else {
				this.$.password.show();
				this.$.password.setValue(accountObject.password);
			}

			this.$.type.setValue(accountObject.type);
			if (accountObject.type === SPAZCORE_SERVICE_CUSTOM) {
				this.$.api_base_url.show();
				this.$.api_base_url.setValue(App.Users.getMeta(accountObject.id, 'twitter-api-base-url'));
			} else {
				this.$.api_base_url.hide();
			}

		} else {
			this.editing_acc_id = null;
		}
	},
	getPinAuthorization: function(inSender, inEvent){
		//launch browser.
		inSender.setActive(true);
		//get stuff
		var r = new enyo.PalmService();
			r.service = "palm://com.palm.applicationManager/";
			r.method = "open";
			r.call({target: 'http://www.cnn.com'});
		
		inSender.setActive(false);
	},
	"saveAccount": function(inSender, inEvent){
		var self = this;

		var type = this.$.type.getValue()
			,username = this.$.username.getValue()
			,password = this.$.password.getValue()
			,api_base_url = (this.$.api_base_url) ? this.$.api_base_url.getValue() : null;

		var twit = new SpazTwit();

		/*
			prevent duplicate account
		*/

		var dupAcct = false;
		var allUsers = App.Users.getAll();
		
		for (i=0;i<allUsers.length;i++) {
			if ((username == allUsers[i].username) && (type == allUsers[i].type)) {
				dupAcct=true;
			}
		}

		if (dupAcct) {
			self.$.saveButton.setActive(false);
			self.$.saveButton.setDisabled(false);
			AppUtils.showBanner($L('Add account failed!<br>Reason: duplicate'));
		}

		/*
			now verify credentials against the Service API
		*/
		if (username && password && !dupAcct) {
			if (type !== SPAZCORE_SERVICE_CUSTOM) {
				twit.setBaseURLByService(type);
			} else {
				twit.setBaseURL(api_base_url);
			}
			
			var auth  = new SpazAuth(type);
			
			sch.error('authorizing…');
			
			self.$.saveButton.setActive(true);
			self.$.saveButton.setDisabled(true);
			auth.authorize(
				username,
				password,
				function(result) {
					if (result) {

						var auth_pickle = auth.save();

						sch.error('auth_pickle:');
						sch.error(auth_pickle);

						if (this.editing_acc_id) { // edit existing
							this.editing_acc_id = null;
						} else { // add new
							var newaccid = App.Users.add(username.toLowerCase(), auth_pickle, type);
							App.Users.setMeta(newaccid, 'twitter-api-base-url', api_base_url);
						}
						self.$.saveButton.setActive(false);
						self.$.saveButton.setDisabled(false);
						self.goTopLevel(); //this re-renders the accounts list.
					} else {
						self.$.saveButton.setActive(false);
						self.$.saveButton.setDisabled(false);
						AppUtils.showBanner($L('Verification failed!'));
					}
				}
			);
		}

		
	},
	promptRemoveAccount: function(inSender, inEvent){
		
		this.$.promptRemoveAccount.destroy();
		this.$.removeAccountFlexBox.createComponents([
			{kind: "Button", flex: 1, content: "Cancel", onclick: "goBackToViewAccount", owner: this},
			{kind: "Button", flex: 1, content: "Are you sure?", className: "enyo-button-negative", onclick: "removeAccount", owner: this}
		]);
		this.$.removeAccountFlexBox.render();

	},
	removeAccount: function(inSender, inEvent){
		App.Users.remove(this.editing_acc_id);
		//@TODO we should also delete any columns using this account

		this.editing_acc_id = null;

		this.goTopLevel(); //this re-renders the accounts list.
	},
	viewProfile: function(inSender, inEvent){
		var user = App.Users.get(this.editing_acc_id);
		AppUI.viewUser(user.username, user.type, this.editing_acc_id);	

		this.doClose();
	},
	goBackToViewAccount: function(inSender, inEvent){
		var id = this.editing_acc_id;
		this.goTopLevel(); //this re-renders the accounts list.
		this.viewAccount(id);
	},
});
