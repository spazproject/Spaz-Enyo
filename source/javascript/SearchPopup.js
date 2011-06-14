enyo.kind({
	name: "Spaz.SearchPopup",
	kind: "Popup",
	scrim: true,
	modal: true,
	width: "400px",
	events: {
		onClose: "",
		onCreateColumn: ""
	},
	showKeyboardWhenOpening:true, // opens the keyboard and positions the popup correctly
	components: [
		{layoutKind: "HFlexLayout", components: [
			{content: "Search"},
			{kind: "Spacer"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"}
		]},	
		{name: "radioGroup", kind: "enyo.RadioGroup", components: [
			{name: "topics", kind: "enyo.RadioButton", label: enyo._$L("Topics")},
			{name: "users", kind: "enyo.RadioButton", label: enyo._$L("Users")}
    	]},
    	{style: "height: 5px;"},
		{kind: "HFlexBox", components: [
			{name:"searchTextBox", kind: "RichText", alwaysLooksFocused: true, selectAllOnFocus: true, richContent: false, hint: "Enter query here...", multiline: false, flex: 1, onkeydown: "searchBoxKeydown"},
		]},
		{kind: "HFlexBox", style: "padding-top: 5px", components: [
			{kind: "Button", style: "padding: 0px 5px;", components: [
			   {name: "accountSelection", "kind":"ListSelector", className: "accountSelection"}
			]},
			{kind: "Spacer", style: "min-width: 50px"},
			{name: "searchButton", kind: "Button", style: "padding-top: 6px;", label: enyo._$L("Search"), onclick: "search"}
		]}
		
	],
	close: function(){
		this.inherited(arguments);
		enyo.keyboard.setManualMode(false); // closes the keyboard
	},
	showAtCenter: function(){
		if(this.lazy) {
			this.validateComponents();
		}
		this.$.searchTextBox.setValue("");
		this.$.searchTextBox.forceFocus();
		this.buildAccounts();
		this.openAtCenter();
	},
	buildAccounts: function() {

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
		this.$.accountSelection.setValue(this.accounts[0].value);

	},
	searchBoxKeydown: function(inSender, inEvent) {
		if (inEvent.keyCode === 13) {
			this.search();
			inEvent.preventDefault();	
		}
	},
	search: function() {
		switch(this.$.radioGroup.getValue()) {
			case 0:
			default:
				this.doCreateColumn(this.$.accountSelection.getValue(), SPAZ_COLUMN_SEARCH, this.$.searchTextBox.getValue());
				break;
			case 1:
				var account = App.Users.get(this.$.accountSelection.getValue());
				var username = this.$.searchTextBox.getValue().replace("@", "");
				AppUI.viewUser(username, account.type, account.id);
				break;
		}
		this.doClose();
	}
});
