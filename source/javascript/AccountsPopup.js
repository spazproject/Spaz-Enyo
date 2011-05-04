enyo.kind({
	name: "Spaz.AccountsPopup",
	kind: enyo.Popup,
	events: {
		onClose: ""
	},
	scrim: true,
	modal: true,
	style: "min-height: 250px",
	width: "400px",
	layoutKind: "VFlexLayout",
	components: [
		{kind: "HFlexBox", components: [
			{name: "header", kind: "HFlexBox", components: [
				{name: "firstheader", content: "Accounts", kind: "HtmlContent"},
			]},
			{kind: "Spacer"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"}
		]},	
		//very thin divider
		{name: "list", kind: "VirtualRepeater", flex: 1, className: "timeline list", onGetItem: "setupRow", components: [
			{kind: "Item", tapHighlight: true, className: "entry", layoutKind: "HFlexLayout", onclick: "accountClick", components: [
				{name: "icon", kind: "Image", style: "padding-right: 5px"},
				{name: "username", content: "", style: "font-size: 16px; vertical-align: middle; padding-right: 5px"},
				{kind: "Spacer"},
				{name: "realname", content: "", style: "font-size: 16px; color: grey; vertical-align: middle;"},
			]}
		]},
		{kind: "Button", caption: "Add an Account", onclick: "newAccount"}
	],
	showAtCenter: function(){
		this.openAtCenter();
	},
	accounts: [
		{type: "twitter", username: "Tibfib", realname: "Will Honey"},
		{type: "twitter", username: "Spaz", realname: "Spaz"},
	],
	setupRow: function(inSender, inIndex){
		var item;
		//if(item = App.Users[inIndex]){
			//switch(item.type){
			//	case "twitter":
			//		this.$.username.setContent("@" + item.username + "");
			//		this.$.icon.setSrc("source/images/account-icon-twitter.png");

			//	break;
			//}
			//this.$.realname.setContent(item.realname);
			//console.log(JSON.STRINGIFY(App.Users[inIndex]));
			//return true;
		//}		
	},
	accountClick: function(inSender, inEvent, inIndex){
		
	},
	"newAccount": function(inSender, inEvent){
		//this.$.header.destroyComponents();
		this.$.header.createComponents([/*{content: "Accounts", className: "link", onclick: "showAllAccounts"},*/{content: ">", style: "padding: 0px 5px;"}, {content: "New"}]);
		this.$.firstheader.setClassName("link");
		this.$.firstheader.onclick = "showAllAccounts";

		this.$.button.destroy();
		this.render();
	},
	"showAllAccounts": function(inSender, InEvent){
		this.$.header.destroyComponents();
		
		this.$.firstheader.setClassName("");
		this.$.firstheader.onclick = "";
		
				
		this.createComponents([{name: "button", kind: "Button", caption: "Add an Account", onclick: "newAccount"}])
		this.render();

	}
});