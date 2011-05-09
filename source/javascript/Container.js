enyo.kind({
	name: "Spaz.Container",
	flex: 1,
	kind: "Control",
	height: "100%",
	events: {
		onShowEntryView: ""
	},
	components: [
		{name:"columnsScroller", kind: "SnapScroller", flex: 1, vertical: false, autoVertical: false, style: "background: black; padding: 2px;" , components:[]},
		{name: "confirmPopup", kind: "enyo.Popup", scrim : true, components: [
			{content: enyo._$L("Delete Column?")},
			{style: "height: 10px;"},
			{kind: "enyo.HFlexBox", components: [
				{kind: "enyo.Button", caption: enyo._$L("Cancel"), flex: 1, onclick: "cancelColumnDeletion"},
				{kind: "enyo.Button", className: "enyo-button-negative", caption: enyo._$L("Delete"), flex: 1, onclick: "confirmColumnDeletion"}
			]}
		]}
	],
	create: function(){
		this.inherited(arguments);
		this.createColumns();
	},
	createColumns: function() {
		// we should load this from prefs
		
		var firstAccount = App.Users.getAll()[0];

		if (!firstAccount || !firstAccount.id) {
			alert('no accounts! you should add one');
			return;
		}

		var colData = [
			{type: "home", display: "Home", accounts: [firstAccount.id]},
			{type: "mentions", display: "Mentions", accounts: [firstAccount.id]},
			// {type: "dms", display: "Messages", accounts: [App.Users.getAll()[0].id]},
			{type: "search", query: 'webos', display: "Search&nbsp;'webos'", accounts: [firstAccount.id]},
			{type: "search", query: 'spaz', display: "Search&nbsp;'spaz'", accounts: [firstAccount.id]},
			{type: "search", query: 'spaz', display: "Search&nbsp;'spaz'", accounts: [firstAccount.id]},
		]

		var cols = [];

		for (var i = colData.length - 1; i >= 0; i--) {
			cols.push({
				name:'Column'+i,
				info: colData[i],
				kind: "Spaz.Column",
				onShowEntryView: "doShowEntryView",
				onDeleteClicked: "deleteColumn",
				owner: this //@TODO there is an issue here with scope. when we create kinds like this dynamically, the event handlers passed is the scope `this.$.columnsScroller` rather than `this` which is what we want in this case since `doShowEntryView` belongs to `this`. It won't be a big deal here, because if we need the column kinds, we can call this.getComponents() and filter out the scroller itself.
			});
		};

		this.$.columnsScroller.createComponents(cols.reverse());

		this.render();
	},
	resizeHandler: function() {
		this.columnsFunction("resizeHandler");
	},
	columnsFunction: function(functionName, opts){
		_.each(this.getComponents(), function(column){
			try {
				if(column.kind === "Spaz.Column"){
					this.$[column.name][functionName]()				
				}
			} 
			catch (e) {
				console.error(e);
			}
		}, this);
	},
	deleteColumn: function(inSender) {
		this.columnToDelete = inSender;
		this.$.confirmPopup.openAtCenter();
	},
	cancelColumnDeletion: function(inSender) {
		this.$.confirmPopup.close();
		this.columnToDelete = null;
	},
	confirmColumnDeletion: function(inSender) {
		this.$.confirmPopup.close();
		if (this.columnToDelete) {
			this.columnToDelete.destroy();
			this.columnToDelete = null;
            this.$.columnsScroller.resizeHandler();
		}
	}
});
