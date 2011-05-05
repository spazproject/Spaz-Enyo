enyo.kind({
	name: "Spaz.AccountsList",
	kind: "VFlexBox",
	style: "min-height: 100px",
	className: "timeline list",
	events: {
		onAccountClick: "",
	},
	components: [
		{kind: "VirtualRepeater", onGetItem: "setupRow", className: "timeline list", flex: 1, components: [
			{kind: "Item", tapHighlight: true, className: "entry", layoutKind: "HFlexLayout", onclick: "doAccountClick", components: [
				{name: "icon", kind: "Image", style: "padding-right: 5px"},
				{name: "username", content: "", style: "font-size: 16px; vertical-align: middle; padding-right: 5px"},
				{kind: "Spacer"},
				{name: "realname", content: "", style: "font-size: 16px; color: grey; vertical-align: middle;"},
			]}
		]}
	],
	accounts: [
		{type: "twitter", username: "Tibfib", realname: "Will Honey"},
		{type: "twitter", username: "Spaz", realname: "Spaz"},
	],
	setupRow: function(inSender, inIndex){
		var item;
		if(item = this.accounts[inIndex]/*App.Users[inIndex]*/){//todo
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

});