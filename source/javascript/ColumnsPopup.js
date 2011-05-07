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
		{kind: "HFlexBox", components: [
			{kind: "Spacer"},
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
		this.$.accountSelection.setItems(this.accounts);
		this.$.accountSelection.setValue(this.accounts[0].value);
	},
	"showAtCenter": function(){
		//this.$.avatarList.buildList();
		this.buildAccounts();
		this.openAtCenter();
	},
	buildColumnSelection: function(inSender, inValue, inOldValue){
		console.log("showing columns for " + inAccount.name);
		this.$.accountName.setContent(inAccount.type);

	}
});