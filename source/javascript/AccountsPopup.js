enyo.kind({
	name: "Spaz.AccountsPopup",
	kind: Spaz.Popup,
	events: {
		onClose: "",
		onAccountAdded: "",
		onAccountRemoved: ""
	},
	scrim: true,
	modal: true,
	autoClose: false,
	dismissWithClick: false,
	//style: "min-height: 250px",
	width: "400px",
	layoutKind: "VFlexLayout",
	components: [
		{kind: "HFlexBox", components: [
			{name: "topHeader", content: "Accounts"},
			{name: "header", kind: "HFlexBox", components: [
			
			]},
			{kind: "Spacer"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"}
		]},	
		{name: "typeButton", kind: "Button", style: "padding: 0px 5px;", showing: false, components: [
		   {name: "type", "kind":"ListSelector", onChange: "changeService", className: "accountSelection", value: SPAZCORE_SERVICE_TWITTER, items: [
				    {caption: "Twitter", value: SPAZCORE_SERVICE_TWITTER},
				    {caption: "Identi.ca", value: SPAZCORE_SERVICE_IDENTICA},
				    {caption: $L("Status.net/Custom"), value: SPAZCORE_SERVICE_CUSTOM},
			]},	
		]}
	],
	oauth: null,
	showAtCenter: function(){
		if(this.lazy) {
			this.validateComponents();
		}
		this.goTopLevel();
		this.openAtTopCenter();
	},
	"goTopLevel": function(inSender, InEvent){
		this.editing_acc_id = null; // reset this

		this.$.header.destroyComponents();
		
		if(this.$.secondLevel) {
			this.$.secondLevel.destroy();	
		}
		
		this.$.typeButton.setShowing(false);
		
		if(!this.$.accountsList) {
			this.createComponent({name: "accountsList", kind: "Spaz.AccountsList", onAccountClick: "viewAccountFromListTap"});
			this.$.accountsList.render();
		}
		if(!this.$.button){
			this.createComponent({name: "button", kind: "Button", caption: "Add an Account", onclick: "newAccount"});
			this.$.button.render();
		}
		
		this.$.accountsList.buildAccounts(); // rebuild the accounts array
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

		var account = App.Users.get(account_id);
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
					{name: "accountInfo", kind: "Item", layoutKind: "HFlexLayout", flex: 1, owner: this, components: [
						{name: "spinner", width: "50px", height: "55px", owner: this, components: [
							{name: "innerSpinner", kind: "Spinner", style: "margin: auto;", showing: true},
						]},
						{name: "avatar", kind: "Image", height: "50px", width: "50px", className: "avatar", showing: false, owner: this},
						{width: "10px"},
						{kind: "VFlexBox", flex: 1, height: "50px", components: [
							{name: "realname", flex: 1, style: "font-weight: bold", content: account.username, owner: this},
							{name: "username", flex: 1, className: "link", onclick: "viewProfile", content: "@" + account.username}
						]}
					]},
					{name: "removeAccountFlexBox", kind: "Item", layoutKind: "HFlexLayout", flex: 1, components: [
						{name: "promptRemoveAccount", kind: "Button", content: "Remove Account", className: "enyo-button-negative", onclick: "promptRemoveAccount", flex: 1, owner: this}
						//{kind: "Button", flex: 1, content: "Change Credentials", account_id: account_id, onclick: "changeCredentials"},
						// ^this may be more pain than it is worth. we would need to flesh out goDownLevel to be able to go down more than one level and so forth.
					]},
				]},
				{kind: "Button", content: "Back", onclick: "goTopLevel", flex: 1}
			]}
		]);
		
		AppUtils.getAccount(account_id, enyo.bind(this, 
			function(user){
				this.$.realname.setContent(user.name);
				this.$.avatar.show();
				this.$.avatar.setSrc(user.profile_image_url);
				this.$.spinner.hide();
				this.$.innerSpinner.hide();
			}), 
			function(xhr, msg, exc){
				console.error("Couldn't find user's avatar");
			}
		);

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
							{kind: "ActivityButton", name:'getTwitterAuthButton', caption: "Log In and Get PIN", onclick: "getTwitterPinAuthorization"},
							{kind: "Item", components: [
								{name: "twitterPinInput", kind: "Input", hint: "Enter PIN", autoKeyModifier: "num-lock", autoCapitalize: "lowercase", autocorrect: false, spellcheck: false}	
							]},							
						]},
						{kind: "HFlexBox", components: [
							{kind: "Button", flex: 1, caption: "Cancel", onclick: "goTopLevel"},
							{name: "saveButton", kind: "ActivityButton", flex: 1, caption: enyo._$L("Save"), className: "enyo-button-affirmative", onclick: "saveTwitterAccount"}
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
	getTwitterPinAuthorization: function(inSender, inEvent){
		
		if (!SPAZCORE_CONSUMERKEY_TWITTER) {
			console.error('SPAZCORE_CONSUMERKEY_TWITTER not set, will not be able to authenticate against Twitter');
			AppUtils.showBanner($L('SPAZCORE_CONSUMERKEY_TWITTER not set, will not be able to authenticate against Twitter'));
			return;
		}

		this.oauth = OAuth({
			'consumerKey':SPAZCORE_CONSUMERKEY_TWITTER,
			'consumerSecret':SPAZCORE_CONSUMERSECRET_TWITTER,
			'requestTokenUrl':'https://twitter.com/oauth/request_token',
			'authorizationUrl':'https://twitter.com/oauth/authorize',
			'accessTokenUrl':'https://twitter.com/oauth/access_token',
		});
		
		AppUtils.showBanner($L('Getting Request Token from Twitter'));

		//launch browser.
		this.$.getTwitterAuthButton.setActive(true);
		this.$.getTwitterAuthButton.setDisabled(true);

		this.oauth.fetchRequestToken(_.bind(function(url) {
				this.$.getTwitterAuthButton.setActive(false);
				this.$.getTwitterAuthButton.setDisabled(false);
				this.authwindow = sch.openInBrowser(url, 'authorize');
			}, this),
			_.bind(function(data) {
				this.$.getTwitterAuthButton.setActive(false);
				this.$.getTwitterAuthButton.setDisabled(false);
				AppUtils.showBanner($L('Problem getting Request Token from Twitter'));
			}, this)
		);
		inSender.setActive(false);
	},
	'saveTwitterAccount': function(inSender, inEvent) {
		var self = this;
		
		var type = this.$.type.getValue();
		var api_base_url = (this.$.api_base_url) ? this.$.api_base_url.getValue() : null;
		var pin = this.$.twitterPinInput.getValue();
		

		if (pin && this.oauth) {
			this.oauth.setVerifier(pin);

			this.$.saveButton.setActive(true);
			this.$.saveButton.setDisabled(true);

			this.oauth.fetchAccessToken(function(data) {
					var qvars = AppUtils.getQueryVars(data.text);
					var auth_pickle = qvars.screen_name+':'+qvars.oauth_token+':'+qvars.oauth_token_secret;
					if (this.editing_acc_id) { // edit existing
						this.editing_acc_id = null;
					} else { // add new
						var newaccid = App.Users.add(qvars.screen_name.toLowerCase(), auth_pickle, type);
						App.Users.setMeta(newaccid, 'twitter-api-base-url', api_base_url);
					}
					self.$.saveButton.setActive(false);
					self.$.saveButton.setDisabled(false);
					self.goTopLevel(); //this re-renders the accounts list.
					self.doAccountAdded(newaccid ? newaccid.id : null);
					if(App.Users.getAll().length === 1) {
						self.doClose();
					}
				},
				function(data) {
					AppUtils.showBanner($L('Problem getting access token from Twitter; must re-authorize'));
					if (self.authwindow) {
						self.authwindow.close();
					}
					self.$.twitterPinInput.setValue('');
					self.$.getTwitterAuthButton.setCaption('Try Again');
					self.$.getTwitterAuthButton.setActive(false);
					self.$.saveButton.setActive(false);
					self.$.saveButton.setDisabled(false);
				}
			);
		} else {
			AppUtils.showBanner($L("You must log in enter the PIN you are given to continue", 3000));
		}
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
						self.doAccountAdded(newaccid ? newaccid.id : null);
						if(App.Users.getAll().length === 1) {
							self.doClose();
						}
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
		this.doAccountRemoved(this.editing_acc_id);

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
