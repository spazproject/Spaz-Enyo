/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.CanonCrudList",
	kind: enyo.VFlexBox,
	published: {
		selectedRecord: null
	},
	components: [
		{kind: "DbService", dbKind: "com.palm.canondblist:1", onFailure: "dbFail", components: [
			{name: "dbFind", method: "find", subscribe: true, onSuccess: "queryResponse", onWatch: "queryWatch"},
			{name: "dbDel", method: "del"},
			{name: "dbPut", method: "put"},
			{name: "dbMerge", method: "merge"}
		]},
		{kind: "MockDb", dbKind: "com.palm.canondblist:1", onSuccess: "queryResponse", onWatch: "queryWatch"},
		{kind: "PageHeader", content: "Crud List Example"},
		{name: "console", content: "select an item", style: "color: white; background-color: gray; border: 1px solid black; padding: 4px;"},
		{flex: 1, name: "list", kind: "DbList", pageSize: 50, onQuery: "listQuery", onSetupRow: "listSetupRow", components: [
			{name: "item", kind: "SwipeableItem", className: "item", tapHighlight: false, confirmCaption: "Delete", onConfirm: "swipeDelete", onclick: "itemClick", components: [
				{kind: "HFlexBox", components: [
					{name: "itemColor", className: "item-color"},
					{name: "itemName", flex: 1},
					{name: "itemIndex", className: "item-index"}
				]},
				{name: "itemSubject", className: "item-subject"}
			]}
		]},
		{kind: "HFlexBox", components: [
			{flex: 1, kind: "Button", caption: "Create", onclick: "createItem"},
			{flex: 1, kind: "Button", caption: "Update", onclick: "updateItem"},
			{flex: 1, kind: "Button", caption: "Delete", onclick: "deleteItem"}
		]},
		{kind: "Button", caption: "Install Db", onclick: "installDb"},
		{kind: "DbInstaller", onSuccess: "installSuccess", onFailure: "dbFail"}
	],
	console: function(inMessage) {
		this.$.console.setContent(inMessage);
	},
	dbFail: function(inSender, inResponse) {
		this.console("dbService failure: " + enyo.json.stringify(inResponse));
	},
	listQuery: function(inSender, inQuery) {
		// IMPORTANT: must return a request object so dbList can decorate it
		if (window.PalmSystem) {
			inQuery.orderBy = "name";
			return this.$.dbFind.call({query: inQuery});
		} else {
			return this.$.mockDb.call({query: inQuery}, {method: "find"});
		}
	},
	queryResponse: function(inSender, inResponse, inRequest) {
		this.$.list.queryResponse(inResponse, inRequest);
	},
	listSetupRow: function(inSender, inRecord, inIndex) {
		//
		// For records marked for deletion: 
		//
		// canGenerate = false prevents a control from rendering any HTML
		this.$.item.canGenerate = !inRecord.deleted;
		//
		// we could use showing = false, which renders HTML with display: none, but it's slightly less efficient
		//this.$.item.setShowing(!inRecord.deleted);
		//
		// or, we could render 'marked for deletion' rows with a decoration instead of hiding them
		//this.$.item.applyStyle("background-color", inRecord.deleted ? "red" : null);
		//
		this.$.item.applyStyle("background-color", inRecord.selected ? "#F0F0FF" : null);
		//
		this.$.itemIndex.setContent("(" + inIndex + ")");
		this.$.itemName.setContent(inRecord.name);
		this.$.itemColor.applyStyle("background-color", inRecord.color);
		this.$.itemSubject.setContent(inRecord.subject);
	},
	reset: function() {
		this.$.list.reset();
	},
	queryWatch: function() {
		this.console("dbService watch fired at " + new Date().toLocaleTimeString());
		//
		// NOTE: list.reset() can cause a visible flash on desktop browsers due to asynchrony between 
		// rendering and data acquisition. We're working on a solution.
		//
		this.$.list.reset();
	},
	selectedRecordChanged: function(inOldRecord) {
		if (inOldRecord) {
			delete inOldRecord.selected;
		}
		if (this.selectedRecord) {
			this.selectedRecord.selected = true;
		}
		this.$.list.refresh();
	},
	itemClick: function(inSender, inEvent) {
		this.setSelectedRecord(this.$.list.fetch(inEvent.rowIndex));
	},
	createItem: function() {
		if (this.selectedRecord) {
			var record = enyo.clone(this.selectedRecord);
			delete record._id;
			delete record.selected;
			record.name += ' (copy)';
			record.subject = "Created at " + new Date().toLocaleTimeString();
			if (window.PalmSystem) {
				this.$.dbPut.call({objects: [record]});
			} else {
				this.$.mockDb.call({objects: [record]}, {method: "put"});
			}
		}
	},
	updateItem: function() {
		if (this.selectedRecord) {
			var record = this.selectedRecord;
			record.subject = "Updated at " + new Date().toLocaleTimeString();
			if (window.PalmSystem) {
				this.$.dbMerge.call({objects: [{
					_id: record._id,
					subject: record.subject
				}]});
			} else {
				this.$.mockDb.call({objects: [{
					_id: record._id,
					subject: record.subject
				}]}, {method: "merge"});
			}
		}
	},
	deleteRecord: function(inRecord) {
		if (inRecord) {
			inRecord.deleted = true;
			if (window.PalmSystem) {
				this.$.dbDel.call({ids: [inRecord._id]});
			} else {
				this.$.mockDb.call({ids: [inRecord._id]}, {method: "del"});
			}
		}
	},
	deleteItem: function() {
		this.deleteRecord(this.selectedRecord);
	},
	swipeDelete: function(inSender, inIndex) {
		this.deleteRecord(this.$.list.fetch(inIndex));
	},
	//
	// these methods are for installing the mock data into a database on a PalmSystem device
	//
	installDb: function() {
		if (window.PalmSystem) {
			this.$.dbInstaller.install(this.$.mockDb.dbKind, "com.palm.crudlist", this.$.mockDb.data);
		} else {
			console.log("Device required for install Db.");
		}
	},
	installSuccess: function(inSender) {
		this.$.list.punt();
		this.console("install success");
	}
});