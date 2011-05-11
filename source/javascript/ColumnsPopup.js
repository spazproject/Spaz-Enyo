enyo.kind({
	name: "Spaz.ColumnsPopup",
	kind: "Popup",
	scrim: true,
	modal: true,
	width: "500px",
	events: {
		onClose: ""
	},
	components: [
		{kind: "HFlexBox", components: [
			{content: "Add a Column for", style: "padding-right: 5px"},
			{"kind":"Button","style":"padding: 0px 5px; position: relative; bottom: 7px;","components":[
			   {name: "accountSelection", "kind":"ListSelector", onChange: "buildColumnSelection", className: "accountSelection"}
			]},
			//{name: "avatarList", kind: "Spaz.AvatarList", onShowAccountColumns: "showAccountColumns"},
			{kind: "Spacer"},
			{name: "accountName", content: "", style: "padding: 0px 5px; color: grey;"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"},
		
		]},
		{name: "columnsList", kind: "HFlexBox", components: []}
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
		this.$.accountSelection.setItems(this.accounts);
		this.$.accountSelection.setValue(this.accounts[0].value);

		this.buildColumnSelection(this, this.accounts[0].value);
	},
	"showAtCenter": function(){
		//this.$.avatarList.buildList();
		this.buildAccounts();
		this.openAtCenter();
	},
	buildColumnSelection: function(inSender, inValue, inOldValue){
		var account = App.Users.get(inValue),
			columns = SPAZ_COLUMN_TYPES[account.type]; //array of available columns

		this.$.columnsList.destroyComponents();

		_.each(columns, function(column){
			this.$.columnsList.createComponent({name: column, flex: 1, kind: "Button", label: column.capitalize()});
		}, this);

		this.$.columnsList.render();
	}
});