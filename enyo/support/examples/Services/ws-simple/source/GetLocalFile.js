/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.GetLocalFile",
	kind: enyo.VFlexBox,
	components: [
		{name: "getSampleData", kind: "WebService", url: "data/sample.json",
			onSuccess: "gotSampleData",
			onFailure: "gotSampleDataFailure"},
		{kind: "Button", caption: "Get sample data", onclick: "btnClick"},
		{name: "list", kind: "VirtualList", flex: 1, onSetupRow: "listSetupRow", components: [
			{kind: "Item", layoutKind: "HFlexLayout", components: [
				{name: "itemLabel", flex: 1},
				{name: "rowLabel"}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.fruits = [];
	},
	btnClick: function() {
		this.$.getSampleData.call();
	},
	gotSampleData: function(inSender, inResponse) {
		this.fruits = inResponse.results;
		this.$.list.refresh();
	},
	gotSampleDataFailure: function(inSender, inResponse) {
		console.log("got failure from getSampleData");
	},
	listSetupRow: function(inSender, inRow) {
		var f = this.fruits[inRow];
		if (f) {
			this.$.itemLabel.setContent(f);
			this.$.rowLabel.setContent("(" + inRow + ")");
			return true;
		}
	}
});