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
	 	{kind: "Item", content: "Details", onclick: "showEntryView"},
	 	{kind: "Item", content: "Reply"},
		{kind: "Item", content: "Share"}
	],
	create: function(){
		this.inherited(arguments);
	},
	"showEntryView": function(){
		this.doShowEntryView(this.entry);
		this.close();
	},
	"showAtEvent": function(inEntry, inEvent){
		this.entry = inEntry;
		this.openAtEvent(inEvent);
	}
});