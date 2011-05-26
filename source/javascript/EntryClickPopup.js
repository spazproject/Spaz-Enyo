enyo.kind({
	name: "Spaz.EntryClickPopup",
	kind: "Popup",
	scrim: true,
	lazy: false,
	events: {
		onClose: "",
		onShare: ""
	},
	components: [
		{name: "popup", kind: "PopupList", onSelect: "itemSelect"}
	],
	items: [
		"Details",
		"Reply",
		"Repost",
		"Edit & Repost",
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
				AppUI.viewEntry(this.entry);
				this.$.popup.close();
				this.clearEntry();
				break;
			case "Reply":
				AppUI.reply(this.entry);
				this.$.popup.close();
				this.clearEntry();
				break;
			case "Repost":
				AppUI.repost(this.entry);
				this.$.popup.close();
				this.clearEntry();
				break;
			case "Edit & Repost":
				AppUI.repostManual(this.entry);
				this.$.popup.close();
				this.clearEntry();
				break;
			case "Share":
				AppUtils.showBanner($L('Not yet implemented'));
				this.clearEntry();
				break;
			default: 
				console.error(this.items[inIndex] + " has no handler");
				break;
		}		
	},
	"showAtEvent": function(inEntry, inEvent){
		this.entry = inEntry;
		this.$.popup.openAtEvent(inEvent);
	},
	getEntry: function() {
		return this.entry;
	},
	clearEntry: function() {
		this.entry = null;
	}
});
