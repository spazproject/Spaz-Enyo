enyo.kind({
	name: "Spaz",
	kind: enyo.HFlexBox,
	height: "100%",
	components: [
		//{kind: "Pane", dragAnywhere: false, flex: 1, components: [
			{name: "sidebar", kind: "Spaz.Sidebar"},
			{name: "container", kind: "Spaz.Container", onShowEntryView: "showEntryView"},
			//{name: "entryview", kind: "Spaz.EntryView"}
		//]}		
	],
	create: function(){
		this.inherited(arguments);	
		//this.$.pane.selectViewByName("timeline");
	},
	showEntryView: function(inSender, inEntry){
		//if pref


		// else 
		//this.$.entryview.create();
		if(!this.$.entryview){
			//this.$.pane.createComponent({name: "entryview", kind: "Spaz.EntryView", onDestroy: "destroyEntryView"}, {owner: this});
			this.createComponent({name: "entryview", kind: "Spaz.EntryView", onDestroy: "destroyEntryView"}, {owner: this});

			this.render();
			//this.$.container.refreshList();

		} 
		this.$.entryview.setEntry(inEntry);
		
	},
	"destroyEntryView": function(inSender, inEvent){
		this.$.entryview.destroy();

		//this.$.timeline.render();
		//this.$.timeline.refreshList();
	},
	resizeHandler: function() {
		this.$.container.resizeHandler();
	}
});