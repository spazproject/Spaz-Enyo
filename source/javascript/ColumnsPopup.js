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
		{name: "searchBox", kind: "HFlexBox", components: [
			{name:"searchTextBox", kind: "RichText", alwaysLooksFocused: true, selectAllOnFocus: true, richContent: false, hint: "Enter query here...", multiline: false, flex: 1, onkeydown: "searchBoxKeydown", components: [
				{kind: "Button", content: "Add", onclick: "newSearchColumn"}
			]},
		]}
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
		this.$.newColumnsContainer.setSelectedAccount(inValue);	//build columnSelection
	},
	showAtCenter: function(){
		if(this.lazy) {
			this.validateComponents();
		}
		this.$.searchBox.setShowing(false);
		//this.$.avatarList.buildList();
		this.buildAccounts();
		this.openAtTopCenter();
	},
	newSearchColumn: function(inSender, inEvent){
		this.doCreateColumn([this.$.accountSelection.getValue()], "search", this.$.searchTextBox.getValue());
		this.doClose();
	},
	newColumn: function(inSender, inCaption){
		if(inCaption === "search"){
			if(this.$.searchBox.getShowing() === false){
				this.$.searchBox.setShowing(true);
			} else {
				this.$.searchBox.setShowing(false);				
			}
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
			this.doCreateColumn(account_ids, inCaption);
			this.doClose();	
		}
		
	}
});
