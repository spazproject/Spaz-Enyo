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
			{name: "avatarList", kind: "Spaz.AvatarList", onShowAccountColumns: "showAccountColumns"},
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
	"showAtCenter": function(){
		this.$.avatarList.buildList();
		this.openAtCenter();
	},
	showAccountColumns: function(inSender, inAccount){
		console.log("showing columns for " + inAccount.name);
		this.$.accountName.setContent(inAccount.type);

	}
});