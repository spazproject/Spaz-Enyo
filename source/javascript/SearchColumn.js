enyo.kind({
	name: "Spaz.SearchColumn",
	kind: "Spaz.Column",
	create: function(){
		this.inherited(arguments);	

     	this.modify();
     
	},
	modify: function(){
		this.$.topRightButton.setIcon("source/images/icon-settings.png");
		this.$.topRightButton.onclick = "optionsPopup";
		this.createComponent({kind: "PopupList", onSelect: "popupSelect", items: [
			"Change Query",
			"Remove Column"
		]});		
	},
	infoChanged: function(){
		this.$.header.setContent(_.capitalize(this.info.type) + ": " + this.info.query);
		this.$.accountName.setContent(App.Users.getLabel(this.info.accounts[0]));
	},
	optionsPopup: function(inSender, inEvent){
		this.$.popupList.openAtEvent(inEvent);
	},
	popupSelect: function(inSender, inEvent){
		
	}
});
