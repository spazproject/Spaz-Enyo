enyo.kind({
	name: "Spaz.AccountsList",
	kind: "VFlexBox",
	style: "min-height: 175px; max-height:300px; overflow:auto",
	className: "timeline list",
	events: {
		onAccountClick: "",
	},
	components: [
		{kind: "VirtualRepeater", onGetItem: "setupRow", className: "timeline list", flex: 1, components: [
			{kind: "Item", tapHighlight: true, className: "entry", layoutKind: "HFlexLayout", onclick: "doAccountClick", components: [
				{name: "icon", kind: "Image", style: "padding-right: 5px"},
				{name: "label", content: "", style: "font-size: 16px; vertical-align: middle; padding-right: 5px"},
				// {name: "username", content: "", style: "font-size: 16px; vertical-align: middle; padding-right: 5px"},
				// {kind: "Spacer"},
				// {name: "realname", content: "", style: "font-size: 16px; color: grey; vertical-align: middle;"},
			]}
		]}
	],
	accounts: [],
	create: function(){
		this.buildAccounts();
		this.inherited(arguments);
	},
	buildAccounts: function() {
		var allusers = App.Users.getAll();
		this.accounts = [];
		for (var key in allusers) {
			this.accounts.push({
				id:allusers[key].id,
				label:App.Users.getLabel(allusers[key].id),
				type:allusers[key].type
			});
		}	
	},
	setupRow: function(inSender, inIndex){
		var item;
		if(item = this.accounts[inIndex]){

			this.$.label.setContent(item.label);

			switch(item.type){
				case SPAZCORE_SERVICE_TWITTER:
					this.$.icon.setSrc("source/images/account-icon-twitter.png");
					break;

				case SPAZCORE_SERVICE_IDENTICA:
					this.$.icon.setSrc("source/images/account-icon-identica.png");
					break;

				default:
					this.$.icon.setSrc("source/images/account-icon-custom.png");
					break;
			}
			// this.$.label.setContent(item.label);
			return true;
		}		
	},
	deleteRow: function() {
		//@TODO how do we delete a row?
	}

});