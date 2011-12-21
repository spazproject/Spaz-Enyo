enyo.kind({
	name: "Spaz.ColumnsPopup",
	kind: Spaz.Popup,
	scrim: true,
	modal: true,
	width: "600px",
	events: {
		onClose: "",
		onCreateColumn: ""
	},
	components: [
		{kind: "HFlexBox", components: [
			{content: "Add a Column for", style: "padding-right: 5px"},
			{"kind":"Button","style":"padding: 0px 5px; position: relative; bottom: 7px;","components":[
			   {name: "accountSelection", "kind":"ListSelector", onChange: "onAccountSelected", className: "accountSelection"}
			]},
			{kind: "Spacer"},
			{name: "accountName", content: "", style: "padding: 0px 5px; color: grey;"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"},

		]},
		{name: "newColumnsContainer", onNewColumn: "newColumn", selectedAccount: "", kind: "Spaz.NewColumnsContainer"},
		{name: "searchBox", kind: "HFlexBox", showing: false, components: [
			{name:"searchTextBox", kind: "RichText", alwaysLooksFocused: true, selectAllOnFocus: true, richContent: false, hint: "Enter query here...", multiline: false, flex: 1, onkeydown: "searchBoxKeydown", components: [
				{kind: "Button", className:"enyo-button-affirmative", content: "Add", onclick: "newSearchColumn"}
			]},
		]},
		{name: "listSelection", kind: "HFlexBox", style: "padding-top: 10px", showing: false, components: [
			{name: "noListsMessage", content: "No user lists found for this account.", style: "font-size: 14px;"},
			{kind: "Button", flex: 1, name: "ListListButton", showing: false, "style":"padding: 0px 5px; position: relative; bottom: 7px;", components: [
				{kind: "ListSelector", name: "ListList"}
			]},
			{kind: enyo.Button, name: "submitListSelection", showing: false, style: "position: relative; bottom: 7px;", caption: "Add List", onclick: "newColumn", className: "enyo-button-affirmative"}
		]},
	],
	create: function(){
		this.inherited(arguments);
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
		};
		var i = 0;
		this.accounts = _.sortBy(this.accounts, function(account){
			return account.type;
		});

		while(i < this.accounts.length){
			if((i > 0 && this.accounts[i].type !== this.accounts[i-1].type) || i === 0){
				this.accounts.splice(i, 0, {caption: this.accounts[i].type, value: this.accounts[i].type});
				//@TODO: style this differently
				i++;
			}
			i++;
		}
		this.$.accountSelection.setItems(this.accounts);
		this.$.accountSelection.setValue(this.accounts[0].value);

		this.onAccountSelected(this, this.accounts[0].value);
	},
	onAccountSelected: function(inSender, inValue){
		this.$.searchBox.setShowing(false);
		this.$.listSelection.setShowing(false);

		this.$.newColumnsContainer.setSelectedAccount(inValue);	//build columnSelection
	},
	showAtCenter: function(){
		if(this.lazy) {
			this.validateComponents();
		}
		this.$.searchBox.setShowing(false);
		this.$.listSelection.setShowing(false);
		//this.$.avatarList.buildList();
		this.buildAccounts();
		this.openAtTopCenter();
	},
	newSearchColumn: function(inSender, inEvent){
		AppUI.search(this.$.searchTextBox.getValue(), this.$.accountSelection.getValue());
		this.doClose();
	},
	newColumn: function(inSender, inCaption){
		if(inCaption === "search"){
			this.$.listSelection.setShowing(false);

			if(this.$.searchBox.getShowing() === false){
				this.$.searchBox.setShowing(true);
			} else {
				this.$.searchBox.setShowing(false);
			}

		} else if(inCaption === "list") {
			this.$.searchBox.setShowing(false);

			if(this.$.listSelection.getShowing() === false){
				this.$.listSelection.setShowing(true);
				this.$.ListListButton.hide();
				this.$.submitListSelection.hide();
				this.$.noListsMessage.hide();
			} else {
				this.$.listSelection.setShowing(false);
			}

			var currentUser = App.Users.get(this.$.accountSelection.value);
			window.AppCache.getUser(currentUser.username, currentUser.type, currentUser.id,
						_.bind(function(user) {
							var auth = new SpazAuth(currentUser.type);
							auth.load(currentUser.auth);
							this.owner.owner.twit.setCredentials(auth);
							this.owner.owner.twit.getLists(user.service_id,
								_.bind(function(data) {
									if(data.lists.length > 0){
										this.$.ListListButton.show();
										this.$.submitListSelection.show();
										this.$.noListsMessage.hide();
									} else {
										this.$.noListsMessage.show();
									}
									var items = [];
									for(var i = 0; i < data.lists.length; i++) {
										items.push({caption: data.lists[i].name, value: data.lists[i].name});
									}
									this.$.ListList.setItems(items);
									this.$.ListList.render();
								}, this)
							)
						}, this)
			);
		} else if(inSender.caption === "Add List") {
			var obj = {
				type: SPAZ_COLUMN_LIST,
				list: inSender.owner.$.ListList.value,
				accounts: [this.$.accountSelection.getValue()]
			}
			this.doCreateColumn(obj);
			this.doClose();

		} else {
			enyo.log("new column");
			if(AppUtils.isService(this.$.accountSelection.getValue())){
				var users = App.Users.getByType(this.$.accountSelection.getValue()),
					account_ids = [];
				for(var i = 0; i < users.length; i++){
					account_ids.push(users[i].id);
				}
			} else {
				var account_ids = [this.$.accountSelection.getValue()];
			}
			var obj = {
				type: inCaption,
				accounts: account_ids,
				service: (AppUtils.isService(this.$.accountSelection.getValue()) ? this.$.accountSelection.getValue() : null)
			}
			this.doCreateColumn(obj);
			this.doClose();
		}

	}
});
