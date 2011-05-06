enyo.kind({
	name: "Spaz.Container",
	flex: 1,
	kind: "Control",
	height: "100%",
	peekWidth: 50,
	events: {
		onShowEntryView: ""
	},
	components: [
		{name:"columnsScroller", kind: "SnapScroller", flex: 1, vertical: false, autoVertical: false, style: "background: black" , components:[]}
	],
	create: function(){
		this.inherited(arguments);
		this.createColumns();
	},
	createColumns: function() {
		// we should load this from prefs
		
		var colData = [
			{type: "home", display: "Home", accounts: [App.Users.getAll()[0].id]},
			{type: "mentions", display: "Mentions", accounts: [App.Users.getAll()[0].id]},
			// {type: "dms", display: "Messages", accounts: [App.Users.getAll()[0].id]},
			{type: "search", query: 'webos', display: "Search&nbsp;'webos'", accounts: [App.Users.getAll()[0].id]},
			{type: "search", query: 'spaz', display: "Search&nbsp;'spaz'", accounts: [App.Users.getAll()[0].id]},
		]

		var cols = [];

		for (var i = colData.length - 1; i >= 0; i--) {
			cols.push({
				name:'Column'+i,
				info: colData[i],
				kind: "Spaz.Column",
				onShowEntryView: "doShowEntryView"
			})
		};

		this.$.columnsScroller.createComponents(cols.reverse());

		this.render();
	},
	showEntryView: function(inSender, inEntry) {
		//this.doShowEntryView(inEntry);
	},
	resizeHandler: function() {
		_.each(this.$.snapScroller.components, function(kind){
			this.$[kind.name].resizeHandler();
		}, this);
	}
});