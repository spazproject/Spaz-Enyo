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
		{name: "accountsList", kind: "Spaz.AccountsList", onAccountClick: "viewAccount"},
		{kind: "Button", caption: "Add an Account", onclick: "newAccount"}
	],
	showAtCenter: function(){
		this.openAtCenter();
	},
	"goTopLevel": function(inSender, InEvent){
		this.editing_acc_id = null; // reset this

		this.$.header.destroyComponents();
		
		this.$.secondLevel.destroy();		

		this.createComponents(
			[
				{name: "accountsList", kind: "Spaz.AccountsList", onAccountClick: "viewAccount"},
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

		this.$.accountsList.destroy();
		this.$.button.destroy();

		this.render();
	},
	viewAccount: function(inSender, inEvent, inIndex){
		
		var account_id = this.$.accountsList.accounts[inIndex].id;

		this.goDownLevel(account_id);

		if (this.$.secondLevel) {
			this.$.secondLevel.destroy();
		}
		this.createComponents([
			{name: "secondLevel", components: [
				{kind: "Group", components: [
					{kind: "Item", components: [
						{name: "accountInfo", content: App.Users.getLabel(account_id)},
					]}
				]},
				{kind: "Button", content: "Change Credentials"},
				{kind: "Button", content: "Log Out"},
				{kind: "Spacer"},
				{kind: "Button", content: "Cancel", onclick: "goTopLevel"}
			]}
		]);

		this.render();
		//this.createAccountEditComponents(App.Users.get(account_id));
	},
	"newAccount": function(inSender, inEvent){
		//this.$.header.destroyComponents();
		this.goDownLevel("new");
		this.createAccountEditComponents();
	},
	createAccountEditComponents: function(accountObject) {

		// @TODO - show custom api url input if STATUSNET or CUSTOM

		if (this.$.secondLevel) {
			this.$.secondLevel.destroy();
		}

		this.createComponents([
			{name: "secondLevel", components: [
				{kind: "Group", components: [
					{name: "username", kind: "Input", hint: "username"},
					{name: "password", kind: "Input", hint: "password"},
					{name: "type", kind: "ListSelector", value: SPAZCORE_SERVICE_TWITTER, items: [
					    {caption: "Twitter", value: SPAZCORE_SERVICE_TWITTER},
					    {caption: "Identi.ca", value: SPAZCORE_SERVICE_IDENTICA},
					    {caption: $L("Status.net/Custom"), value: SPAZCORE_SERVICE_CUSTOM},
					]},
					{name: "api_base_url", kind: "Input", hint: "Custom API URL"}
				]},
				{kind: "HFlexBox", components: [
					{kind: "Button", flex: 1, caption: "Cancel", onclick: "goTopLevel"},
					{kind: "Button", flex: 1, caption: "Save", onclick: "saveAccount"}
				]}
			]}
		]);

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
	"saveAccount": function(inSender, inEvent){
		var self = this;

		var type = this.$.type.getValue()
			,username = this.$.username.getValue()
			,password = this.$.password.getValue()
			,api_base_url = this.$.api_base_url.getValue();

		var twit = new SpazTwit();

		/*
			now verify credentials against the Service API
		*/
		if (username && password) {
			if (type !== SPAZCORE_SERVICE_CUSTOM) {
				twit.setBaseURLByService(type);
			} else {
				twit.setBaseURL(api_base_url);
			}
			
			var auth  = new SpazAuth(type);
			
			sch.error('authorizing…');
			
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
						self.goTopLevel(); //this re-renders the accounts list.
					} else {					
						alert($L('Verification failed!'));
					}
				}
			);
		}

		
	}
});