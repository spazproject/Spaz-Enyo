enyo.kind({
	name: "Spaz.EntryClickPopup",
	kind: "Popup",
	scrim: true,
	//modal: true,
	events: {
		onClose: "",
		onShowEntryView: "",
		onReply: "",
		onDirectMessage: "",
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
	},
	"itemSelect": function(inSender, inIndex){
		switch(this.items[inIndex]){
			case "Details":
				this.doShowEntryView(this.entry);
				this.$.popup.close();
				break;
			case "Reply":
				if (this.entry.is_private_message) {
					this.doDirectMessage({
						'to':this.entry.author_username,
						'text':null,
						'entry':this.entry,
						'account_id':this.entry.account_id
					});
				} else {
					this.doReply({
						'entry':this.entry,
						'account_id':this.entry.account_id
					});			
				}
				this.$.popup.close();
				break;
			case "Share":

				break;
			default: 
				console.error(this.items[inIndex] + " has no handler");
				break;
		}		
	},
	showAtEvent: function(inEntry, inEvent){
		// I believe this is what you'd call a "hack."
		// Would be nice if Enyo would calculate offset for us so the popup is shown fully onscreen.
		var rightEdge = inEvent.screenX + this.$.popup.calcSize().width;
		var rootWindow = enyo.windows.getRootWindow();
		var offset = {
			left: 0,
			top: 0
		};
		if (rightEdge > rootWindow.innerWidth) {
			offset.left -= (rightEdge - rootWindow.innerWidth);
		}
		
		this.entry = inEntry;
		this.$.popup.openAtEvent(inEvent, offset);
	}
});
