enyo.kind({
	name: "Spaz.EntryClickPopup",
	kind: "Popup",
	scrim: true,
	//modal: true,
	events: {
		onClose: "",
		onShowEntryView: "",
		onReply: "",
		onShare: ""
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
		this.entry = null;
	},
	"itemSelect": function(inSender, inIndex){

		switch(this.items[inIndex]){
			case "Details":
				this.doShowEntryView(this.entry);
				this.$.popup.close();
				this.clearEntry();
				break;
			case "Reply":
				this.doReply(this.entry);
				this.$.popup.close();
				this.clearEntry();
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
		this.$.popup.openNear({left: inEvent.x, top: inEvent.y});
	},
	getEntry: function() {
		return this.entry;
	},
	clearEntry: function() {
		this.entry = null;
	}
});
