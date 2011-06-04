//not in use.

enyo.kind({
	name: "Spaz.AccountSelectionPopup",
	kind: "Popup",
	scrim: true,
	modal: true,
	width: "400px",
	layoutKind: "VFlexLayout",
	events: {
		onClose: ""
	},
	published: {
		header: "",
	},
	components: [
		{layoutKind: "HFlexLayout", components: [
			{name: "header", content: ""},
			{kind: "Spacer"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"}
		]},		
		{kind: "HFlexBox", components: [
			{content: "Pick Account:", style: "font-size: 16px; line-height: 44px; vertical-align: middle;"},
			{kind: "Spacer", style: "min-width: 50px"},
			{kind: "Button", style: "padding: 0px 5px;", components: [
				   {name: "accountSelection", "kind":"ListSelector", onChange: "onChangeAccount", className: "accountSelection"}
			]},		
		]},
		{name: "confirmButton", kind: "Button", className: "enyo-button-affirmative", onclick: "confirm", caption: "Confirm"}
	],
	create: function(){
		this.inherited(arguments);
	},
	buildAccounts: function(inAccountId) {

		var allusers = App.Users.getAll();
		this.accounts = [];
		for (var key in allusers) {
			this.accounts.push({
				id:allusers[key].id,
				value: allusers[key].id,
				caption:App.Users.getLabel(allusers[key].id),
				type:allusers[key].type
			});
		}
		this.$.accountSelection.setItems(this.accounts);
		this.$.accountSelection.setValue(inAccountId || this.accounts[0].value);
	},
	headerChanged: function(){
		this.$.header.setContent(this.header);
	},
	showAtCenter: function(inHeader, callback, inAccountId){
		if(this.lazy) {
			this.validateComponents();
		}
		this.setHeader(inHeader);
		this.callback = callback;
		this.buildAccounts(inAccountId);
		
		this.openAtCenter();
	},
	confirm: function(){
		this.callback(this.$.accountSelection.getValue());
		this.doClose();
	}
});
	