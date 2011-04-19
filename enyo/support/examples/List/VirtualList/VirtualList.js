/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.CanonVirtualList",
	kind: enyo.VFlexBox,
	components: [
		{kind: "WebService", url: "data/canonDbList_dbService.json", onSuccess: "queryResponse", onFailure: "queryFail"},
		{kind: "PageHeader", content: "Virtual List Example"},
		{kind: "Button", caption: "Load Data", onclick: "loadData"},
		{flex: 1, name: "list", kind: "VirtualList", className: "list", onSetupRow: "listSetupRow", components: [
			{kind: "Divider"},
			{kind: "Item", className: "item", components: [
				{kind: "HFlexBox", components: [
					{name: "itemColor", className: "item-color"},
					{name: "itemName", flex: 1},
					{name: "itemIndex", className: "item-index"}
				]},
				{name: "itemSubject", className: "item-subject"}
			]}
		]},
		{name: "console", style: "color: white; background-color: gray; padding: 4px; border: 1px solid black"}
	],
	create: function() {
		this.data = [];
		this.inherited(arguments);
	},
	loadData: function(inSender) {
		this.$.webService.call();
	},
	queryResponse: function(inSender, inResponse) {
		this.data = inResponse.results;
		this.data.sort(function(inA, inB) {
			// names are in "First Last" format, this code converts to "LastFirst" for comparison
			var an = inA.name.split(" ");
			an = an.pop() + an.pop();
			var bn = inB.name.split(" ");
			bn = bn.pop() + bn.pop();
			if (an < bn) return -1;
			if (an > bn) return 1;
			return 0;
		});
		this.$.list.refresh();
	},
	getGroupName: function(inIndex) {
		// get previous record
		var r0 = this.data[inIndex -1];
		// get (and memoized) first letter of last name
		if (r0 && !r0.letter) {
			r0.letter = r0.name.split(" ").pop()[0];
		}
		var a = r0 && r0.letter;
		// get record
		var r1 = this.data[inIndex];
		if (!r1.letter) {
			r1.letter = r1.name.split(" ").pop()[0];
		}
		var b = r1.letter;
		// new group if first letter of last name has changed
		return a != b ? b : null;
	},
	setupDivider: function(inIndex) {
		// use group divider at group transition, otherwise use item border for divider
		var group = this.getGroupName(inIndex);
		this.$.divider.setCaption(group);
		this.$.divider.canGenerate = Boolean(group);
		this.$.item.applyStyle("border-top", Boolean(group) ? "none" : "1px solid silver;");
	},
	listSetupRow: function(inSender, inIndex) {
		var record = this.data[inIndex];
		if (record) {
			// bind data to item controls
			this.setupDivider(inIndex);
			this.$.itemIndex.setContent("(" + inIndex + ")");
			this.$.itemName.setContent(record.name);
			this.$.itemColor.applyStyle("background-color", record.color);
			this.$.itemSubject.setContent(record.subject);
			return true;
		}
	}
});