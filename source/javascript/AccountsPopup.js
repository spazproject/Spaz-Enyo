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
		this.$.header.destroyComponents();
		
		this.$.secondLevel.destroy();		

		this.createComponents([{name: "accountsList", kind: "Spaz.AccountsList", onAccountClick: "viewAccount"}, {name: "button", kind: "Button", caption: "Add an Account", onclick: "newAccount"}])
		this.render();

	},
	"goDownLevel": function(inName){
		this.$.header.createComponents([{content: ">", style: "padding: 0px 5px;"}, {content: inName}]);

		this.$.accountsList.destroy();
		this.$.button.destroy();
		this.render();
	},
	viewAccount: function(inSender, inEvent, inIndex){
		this.goDownLevel(App.Users[inIndex].username); //todo, not sure proper property
	},
	"newAccount": function(inSender, inEvent){
		//this.$.header.destroyComponents();
		this.goDownLevel("New");
		this.createComponents([
			{name: "secondLevel", components: [
				{kind: "Group", components: [
					{name: "username", kind: "Input", hint: "username"},
					{name: "password", kind: "Input", hint: "password"},
					{name: "service", kind: "ListSelector", value: "twitter", items: [
					    {caption: "Twitter", value: "twitter"},
					    {caption: "Identi.ca", value: "identi.ca"},
					    {caption: "Status.net", value: "status.net"},
					]},
				]},
				{kind: "HFlexBox", components: [
					{kind: "Button", flex: 1, caption: "Cancel", onclick: "goTopLevel"},
					{kind: "Button", flex: 1, caption: "Save", onclick: "loginAccount"}
				]}
			]}
		]);
		this.render();
		
	},
	"loginAccount": function(inSender, inEvent){
		var service = this.$.service.getValue(), username = this.$.username.getValue(), password = this.$.password.getValue();

		//login and add account to App.Users. make sure that array has been refreshed

		this.goTopLevel(); //this re-renders the accounts list.
	}
});