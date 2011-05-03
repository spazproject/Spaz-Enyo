enyo.kind({
	name: "Spaz.EntryClickPopup",
	kind: "Popup",
	scrim: true,
	//modal: true,
	events: {
		onClose: ""
	},
	components: [
	 	{kind: "Item", content: "Reply"},
		{kind: "Item", content: "Share"},
		{kind: "Item", content: "View"},
	],
	create: function(){
		this.inherited(arguments);
	},
	"showAtCenter": function(entry){
		 this.openAtCenter();
	}
});