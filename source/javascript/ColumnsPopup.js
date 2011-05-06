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
			{content: "Add a Column"},
			{kind: "Spacer"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"},
		
		]},
		{kind: "HFlexBox", components: [
			{name: "service", onChange: "buildAccountList", kind: "ListSelector", value: "all", items: [
			    {caption: "All", value: "all"},
			    {caption: "Twitter", value: "twitter"},
			    {caption: "Identi.ca", value: "identi.ca"},
			    {caption: "Status.net", value: "status.net"},
			]},
			{name: "avatarList", kind: "Spaz.AvatarList", onShowAccountColumns: "showAccountColumns"},
		]}
	],
	create: function(){
		this.inherited(arguments);
	},
	"showAtCenter": function(){
		this.buildAccountList();
		this.openAtCenter();
	},
	buildAccountList: function(){
		this.$.avatarList.setFilterValue(this.$.service.getValue());//automatically builds the list
	},
	showAccountColumns: function(account){
		console.log("showing columns for " + account.name);

	}
});