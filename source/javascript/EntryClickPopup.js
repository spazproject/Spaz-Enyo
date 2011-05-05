enyo.kind({
	name: "Spaz.EntryClickPopup",
	kind: "Popup",
	scrim: true,
	//modal: true,
	events: {
		onClose: "",
		onShowEntryView: ""
	},
	components: [
		{name: "popup", kind: "PopupList", onSelect: "itemSelect"}
	],
	items: [
		"Details",
		"Reply",
		"Share"
	],
	create: function(){
		this.inherited(arguments);
		this.$.popup.setItems(this.items);
	},
	"itemSelect": function(inSender, inIndex){
		switch(this.items[inIndex]){
			case "Details":
				this.doShowEntryView(this.entry);
				this.$.popup.close();
				break;
			case "Reply":

				break;
			case "Share":

				break;
			default: 
				console.error(this.items[inIndex] + " has no handler");
				break;
		}		
	},
	"showAtEvent": function(inEntry, inEvent){
		this.entry = inEntry;
		this.$.popup.openAtEvent(inEvent);
	}
});