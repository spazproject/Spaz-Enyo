enyo.kind({
	name: "Spaz.AccountsPopup",
	kind: enyo.Popup,
	events: {
		onClose: ""
	},
	scrim: true,
	modal: true,
	style: "min-height: 250px",
	layoutKind: "VFlexLayout",
	components: [
		{layoutKind: "HFlexLayout", components: [
			{content: "Accounts", style: "padding-bottom: 0px"},
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
		{kind: "Button", caption: "Add an Account"}
	],
	accounts: [
		{type: "twitter", username: "Tibfib", realname: "Will Honey"},
		{type: "twitter", username: "Spaz", realname: "Spaz"},
	],
	setupRow: function(inSender, inIndex){
		var item;
		if(item = this.accounts[inIndex]){
			switch(item.type){
				case "twitter":
					this.$.username.setContent("@" + item.username + "");
					this.$.icon.setSrc("source/images/account-icon-twitter.png");

				break;
			}
			this.$.realname.setContent(item.realname);

			return true;
		}		
	},
	accountClick: function(inSender, inEvent, inIndex){
		
	},
	showAtCenter: function(){
		this.openAtCenter();
	}
});