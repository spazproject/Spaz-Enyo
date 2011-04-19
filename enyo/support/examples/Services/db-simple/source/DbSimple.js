/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.DbSimple",
	kind: enyo.VFlexBox,
	components: [
		{kind: "DbService", dbKind: "enyo.fruits:1", onFailure: "dbFailure", components: [
			{name: "deleteFruitDbKind", method: "delKind", onResponse: "deleteFruitDbKindResponse"},
			{name: "makeFruitDbKind", method: "putKind", onSuccess: "putDbKindSuccess"},
			{name: "insertFruits", method: "put", onResponse: "insertFruitsResponse"},
			{name: "findFruits", method: "find", onResponse: "findFruitsResponse"}
		]},
		{kind: "PageHeader", content: "A list of fruits!"},
		{kind: "HFlexBox", align: "center", components: [
			{kind: "Button", caption: "Make", onclick: "makeFruitDbKindClick"},
			{kind: "Button", caption: "Insert", onclick: "insertFruitsClick"},
			{kind: "Button", caption: "Find", onclick: "findFruitsClick"},
			{style: "padding: 10px", content: "(requires device)"}
		]},
		{name: "list", kind: "DbList", flex: 1, onQuery: "listQuery", onSetupRow: "listSetupRow", components: [
			{kind: "Item", layoutKind: "HFlexLayout", components: [
				{name: "itemLabel", flex: 1},
				{name: "rowLabel"}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		if (!window.PalmSystem) {
			// to use the automatic PalmService data-mocking, we set the dbList.pageSize such that the entire db fits in one page
			this.$.list.setPageSize(500);
		}
	},
	makeFruitDbKindClick: function() {
		// first we delete the kind if it exists
		this.$.deleteFruitDbKind.call();
	},
	deleteFruitDbKindResponse: function() {
		this.log();
		// when the delKind is done, then make the fruit dbKind.
		this.$.makeFruitDbKind.call({owner: enyo.fetchAppId()});
	},
	putDbKindSuccess: function() {
		this.log();
	},
	insertFruitsClick: function() {
		this.$.insertFruits.call({objects: this.formatFruitData()});
	},
	insertFruitsResponse: function() {
		this.log();
	},
	// NOTE: we load some fruit data into the "fruits" global via the depends.js file,
	// then marshalling it here into the format required for mojoDb's put method.
	formatFruitData: function() {
		var a = [];
		var dbKind = this.$.dbService.dbKind;
		for (var i=0, f; f=fruits[i]; i++) {
			a.push({_kind: dbKind, name: f});
		}
		return a;
	},
	findFruitsClick: function() {
		// NOTE: when not on device, this service will attempt to find data in a json formatted file
		// at the url: mock/<id of this service>.json, which in this case is
		// mock/dbSimple_findFruits.json.
		// if that mock data is not found, a console message tells you at what url mock data was expected.
		this.$.list.punt();
	},
	listQuery: function(inSender, inQuery) {
		return this.$.findFruits.call({query: inQuery});
	},
	findFruitsResponse: function(inSender, inResponse, inRequest) {
		this.$.list.queryResponse(inResponse, inRequest);
	},
	// any error we just log to the console for debugging
	dbFailure: function(inSender, inError, inRequest) {
		this.log(enyo.json.stringify(inError));
	},
	listSetupRow: function(inSender, inRecord, inIndex) {
		// put the appropriate fruit data into the list rows
		this.$.itemLabel.setContent(enyo.isString(inRecord) ? inRecord : inRecord.name);
		this.$.rowLabel.setContent("(" + inIndex + ")");
	}
});