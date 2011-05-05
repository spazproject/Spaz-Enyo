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
		{name: "popup", kind: "PopupList", onSelect: "itemSelect", items: [
			"Details",
			"Reply",
			"Share"
		]}
	],
	create: function(){
		this.inherited(arguments);
	},
	"itemSelect": function(){
		//currently, this just shows the entry view. need to make a switch() function
		this.doShowEntryView(this.entry);
		this.$.popup.close();
	},
	"showAtEvent": function(inEntry, inEvent){
		this.entry = inEntry;
		this.$.popup.openAtEvent(inEvent);
	}
});