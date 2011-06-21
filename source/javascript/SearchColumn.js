enyo.kind({
	name: "Spaz.SearchColumn",
	kind: "Spaz.Column",
	create: function(){
		this.inherited(arguments);	

     	this.modify();
     
	},
	modify: function(){
		/*this.$.topRightButton.setIcon("source/images/icon-settings.png");
		this.$.topRightButton.onclick = "optionsPopup";
		this.createComponent({kind: "PopupList", onSelect: "popupSelect", items: [
			"Change Query",
			"Remove Column"
		]});*/		
	},
	infoChanged: function(){
		this.inherited(arguments);
		this.$.topLeftButton.setStyle("");
		this.$.topLeftButton.setIcon("source/images/icon-search.png");
	},
	/*optionsPopup: function(inSender, inEvent){
		this.$.popupList.openAtEvent(inEvent);
	},
	popupSelect: function(inSender, inIndex){
		switch(inSender.items[inIndex]){
			case "Remove Column":
				this.doDeleteClicked();
				break;

		}
		this.close();
	},*/
	rendered: function() {
		this.inherited(arguments);
		if (this.hasNode()) {
			// The actual resizing work is done by Column.rendered(), but
			// we need to set different content for SearchColumns.
			this.$.header.setContent(this.info.query);
		}
	}
});
