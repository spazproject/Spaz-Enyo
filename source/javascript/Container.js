enyo.kind({
	name: "Spaz.Container",
	flex: 1,
	kind: "Control",
	height: "100%",
	style: "background-color: black",
	events: {
		onRefreshAllFinished: "",
	},
	components: [
		{name:"columnsScroller", kind: "SnapScroller", flex: 1, vertical: false, autoVertical: false, style: "background-color: black; padding: 2px;" , components:[
			{kind: "ScrollFades"}
		]},
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

		this.loadingColumns = 0;
		
		// load the column set
		this.columnData = App.Prefs.get('columns') || [];
		this.createColumns();

		AppUI.addFunction("search", function(inQuery, inAccountId){
			this.createColumn(inAccountId, "search", inQuery);
		}, this);
	},

	getDefaultColumns: function() {
		
		var firstAccount = App.Users.getAll()[0];

		if (!firstAccount || !firstAccount.id) {
			AppUtils.showBanner('no accounts! you should add one');
			return [];
		}

		var default_columns = [
			{type: SPAZ_COLUMN_HOME, accounts: [firstAccount.id]},
			{type: SPAZ_COLUMN_MENTIONS, accounts: [firstAccount.id]},
			// {type: "dms", display: "Messages", accounts: [App.Users.getAll()[0].id]},
			{type: SPAZ_COLUMN_SEARCH, query: 'webos', accounts: [firstAccount.id]},
			{type: SPAZ_COLUMN_SEARCH, query: 'spaz', accounts: [firstAccount.id]}
		];

		return default_columns;
	},

	createColumns: function() {
		this.columnsFunction("destroy"); //destroy them all. don't want to always do this.

		if(this.columnData.length === 0){
			this.columnData = this.getDefaultColumns();
		}
		var cols = [];

		for (var i = 0; i < this.columnData.length; i++) {
			var col = {
				name:'Column'+i,
				info: this.columnData[i],
				kind: "Spaz.Column",
				onDeleteClicked: "deleteColumn",
				onLoadStarted: "loadStarted",
				onLoadFinished: "loadFinished",
				onMoveColumnLeft: "moveColumnLeft",
				onMoveColumnRight: "moveColumnRight",
				owner: this //@TODO there is an issue here with scope. when we create kinds like this dynamically, the event handlers passed is the scope `this.$.columnsScroller` rather than `this` which is what we want in this case since `doShowEntryView` belongs to `this`. It won't be a big deal here, because if we need the column kinds, we can call this.getComponents() and filter out the scroller itself.
			}; 
			if(col.info.type === "search"){
				col.kind = "Spaz.SearchColumn";
			}
			cols.push(col);
		};
		this.$.columnsScroller.createComponents(cols);
		this.$.columnsScroller.render();
		setTimeout(AppUI.refresh, 1);
	},
	createColumn: function(inAccountId, inColumn, inQuery){
		this.columnData.push({type: inColumn, accounts: [inAccountId], query: inQuery});

		// save the column set
		App.Prefs.set('columns', this.columnData);

		this.createColumns();

		this.$.columnsScroller.snapTo(this.columnData.length-1);

	},
	moveColumnLeft: function(inSender){
		var del_idx = parseInt(inSender.name.replace('Column', ''), 10);
		var column = this.columnData.splice(del_idx, 1)[0];
		this.columnData.splice(del_idx-1, 0, column);

		this.createColumns();

		App.Prefs.set('columns', this.columnData);

	},
	moveColumnRight: function(inSender){
		var del_idx = parseInt(inSender.name.replace('Column', ''), 10);
		var column = this.columnData.splice(del_idx, 1)[0];
		this.columnData.splice(del_idx+1, 0, column);

		this.createColumns();	

		App.Prefs.set('columns', this.columnData);

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
			
			// find the index to delete and remove it
			var del_idx = parseInt(this.columnToDelete.name.replace('Column', ''), 10);
			this.columnData.splice(del_idx, 1);

			// save the column set
			App.Prefs.set('columns', this.columnData);

			this.columnToDelete.destroy();
			this.columnToDelete = null;
            this.$.columnsScroller.resizeHandler();

            this.columnsFunction("checkArrows");

		}
	},
	columnsFunction: function(functionName, opts){
		var columnCount = 0;
		_.each(this.getComponents(), function(column){
			try {
				if(column.kind === "Spaz.Column" || column.kind === "Spaz.SearchColumn"){
					columnCount++;
					this.$[column.name][functionName]()
				}
			} 
			catch (e) {
				console.error(e);
			}
		}, this);
		return columnCount;
	},

	resizeHandler: function() {
		this.columnsFunction("resizeHandler");
	},
	
	refreshAll: function() {
		this.loadingColumns = 0;
		if(this.columnsFunction("loadNewer") === 0) {
			this.loadFinished();
		}
	},
	
	loadStarted: function() {
		this.loadingColumns++;
	},
	
	loadFinished: function() {
		this.loadingColumns--;
		if (this.loadingColumns <= 0) {
			this.doRefreshAllFinished();
		}
	},

	search: function(inSender, inQuery){
		this.createColumn(inSender.info.accounts[0], "search", inQuery);
	}
});
