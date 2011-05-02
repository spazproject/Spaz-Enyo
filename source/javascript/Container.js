enyo.kind({
	name: "Spaz.Container",
	flex: 1,
	kind: "Control",
	height: "100%",
	peekWidth: 50,
	events: {
		onEntryClick: ""
	},
	components: [
		{kind: "SnapScroller", flex: 1, vertical: false, autoVertical: false, style: "background: black", components: [
			{name: "Home", info: {type: "home", display: "Home", accounts: ["@Tibfib", "@Spaz"]}, kind: "Spaz.Column", onEntryClick: "entryClick"},
			{name: "Replies", info: {type: "replies", display: "Replies", accounts: ["@Tibfib", "@Spaz"]}, kind: "Spaz.Column", onEntryClick: "entryClick"},
			{name: "Direct Messages", info: {type: "direct", display: "Direct Messages", accounts: ["@Tibfib", "@Spaz"]}, kind: "Spaz.Column", onEntryClick: "entryClick"},
			{name: "Search", info: {type: "search", search: "#webOS"}, kind: "Spaz.Column", onEntryClick: "entryClick"},
			{name: "Search 2", kind: "Spaz.Column", onEntryClick: "entryClick"}
		]}
	],
	create: function(){
		this.inherited(arguments);
		//this.$.list.refresh();
	},
	entryClick: function(inSender, inEntry) {
		this.doEntryClick(inEntry);
	},
	resizeHandler: function() {
		_.each(this.$.snapScroller.components, function(kind){
			this.$[kind.name].resizeHandler();
		}, this);
	}
});