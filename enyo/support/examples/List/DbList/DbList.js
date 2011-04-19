/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.CanonDbList",
	kind: enyo.VFlexBox,
	components: [
		{kind: "DbService", method: "find", dbKind: "com.palm.canondblist:2", subscribe: true, onSuccess: "queryResponse", onFailure: "queryFail", onWatch: "queryWatch"},
		{kind: "MockDb", dbKind: "com.palm.canondblist:2", onSuccess: "queryResponse", onWatch: "queryWatch"},
		{kind: "PageHeader", content: "Db List Example"},
		{name: "console", style: "background-color: white;"},
		{flex: 1, name: "list", kind: "DbList", onQuery: "listQuery", onSetupRow: "listSetupRow", components: [
			{kind: "Item", style: "background-color: white", components: [
				{kind: "HFlexBox", components: [
					{name: "itemColor", className: "item-color"},
					{name: "itemName", flex: 1},
					{name: "itemIndex", className: "item-index"}
				]},
				{name: "itemSubject", className: "item-subject"}
			]}
		]},
		{kind: "Button", caption: "Install Db", onclick: "installDb"},
		{kind: "DbInstaller", onSuccess: "installSuccess", onFailure: "installFail"}
	],
	create: function() {
		this.inherited(arguments);
		if (!window.PalmSystem) {
			// to use the automatic PalmService data-mocking, we set the dbList.pageSize such that the entire db fits in one page
			this.$.list.setPageSize(500);
		}
	},
	queryFail: function(inSender, inResponse) {
		this.$.console.setContent("dbService failure: " + enyo.json.stringify(inResponse));
	},
	listQuery: function(inSender, inQuery) {
		// IMPORTANT: must return a request object so dbList can decorate it
		if (window.PalmSystem) {
			return this.$.dbService.call({query: inQuery});
		} else {
			return this.$.mockDb.call({query: inQuery}, {method: "find"});
		}
	},
	queryResponse: function(inSender, inResponse, inRequest) {
		this.$.list.queryResponse(inResponse, inRequest);
	},
	queryWatch: function() {
		this.$.console.setContent("dbService watch fired");
	},
	listSetupRow: function(inSender, inRecord, inIndex) {
		this.$.itemIndex.setContent("(" + inIndex + ")");
		this.$.itemName.setContent(inRecord.name);
		this.$.itemColor.applyStyle("background-color", inRecord.color);
		this.$.itemSubject.setContent(inRecord.subject);
	},
	//
	// these methods are for installing the mock data into a database on a PalmSystem device
	//
	installDb: function() {
		if (window.PalmSystem) {
			this.$.dbInstaller.install(this.$.mockDb.dbKind, "com.palm.dblist", this.$.mockDb.data);
		} else {
			console.log("Device required for install Db.");
		}
	},
	installSuccess: function(inSender) {
		this.$.list.punt();
		this.$.console.setContent("install success");
	}
});