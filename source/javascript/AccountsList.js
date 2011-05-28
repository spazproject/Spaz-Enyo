enyo.kind({
	name: "Spaz.AccountsList",
	kind: "VFlexBox",
	style: "min-height: 175px; max-height:300px; overflow:auto",
	className: "timeline list",
	events: {
		onAccountClick: "",
	},
	components: [
		{kind: "Group", components: [
			{kind: "VirtualRepeater", onGetItem: "setupRow", className: "timeline list", flex: 1, components: [
				{kind: "Item", tapHighlight: true, className: "entry", layoutKind: "HFlexLayout", onclick: "doAccountClick", components: [
					{name: "icon", kind: "Image", style: "padding-right: 5px"},
					{name: "label", content: "", style: "font-size: 16px; padding-top: 3px; padding-right: 5px"},
					// {name: "username", content: "", style: "font-size: 16px; vertical-align: middle; padding-right: 5px"},
					// {kind: "Spacer"},
					// {name: "realname", content: "", style: "font-size: 16px; color: grey; vertical-align: middle;"},
				]}
			]}
		]}
	],
	accounts: [],
	create: function(){
		this.inherited(arguments);
		this.buildAccounts();
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
		if(this.accounts.length === 0){
			this.$.group.setShowing(false);
		} else {
			this.$.group.setShowing(true);
		}
	},
	setupRow: function(inSender, inIndex){
		var item;
		if(item = this.accounts[inIndex]){

			this.$.label.setContent(item.label);
			this.$.icon.setSrc(SPAZ_ACCOUNT_ICONS[item.type]);
			
			// this.$.label.setContent(item.label);
			return true;
		}		
	},
	deleteRow: function() {
		//@TODO how do we delete a row?
	}

});