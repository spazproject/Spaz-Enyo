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
		this.$.topLeftButton.setStyle("");
		this.$.topLeftButton.setIcon("source/images/icon-search.png");
		this.$.header.setContent(this.info.query);
		this.$.accountName.setContent(App.Users.getLabel(this.info.accounts[0]));
	},
	optionsPopup: function(inSender, inEvent){
		this.$.popupList.openAtEvent(inEvent);
	},
	popupSelect: function(inSender, inIndex){
		switch(inSender.items[inIndex]){
			case "Remove Column":
				this.doDeleteClicked();
				break;

		}
		this.close();
	}
});
