/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.DbRepeaterList",
	kind: enyo.VFlexBox,
	published: {
		pageSize: 50,
		stripSize: 20
	},
	events: {
		onQuery: "",
		onSetupRow: ""
	},
	chrome: [
		{kind: "Scroller", flex: 1, accelerated: false, components: [
			{name: "client", kind: enyo.VirtualRepeater, accelerated: true, onGetItem: "getItem"}
		]}
	],
	create: function() {
		this.data = [];
		this.inherited(arguments);
		this.stripSizeChanged();
		this.reset();
	},
	stripSizeChanged: function(inSender) {
		this.$.client.setStripSize(this.stripSize);
	},
	fetch: function(inRow) {
		return this.data[inRow]
	},
	getItem: function(inSender, inIndex) {
		var record = this.fetch(inIndex);
		if (record) {
			this.doSetupRow(record, inIndex);
			return true;
		}
		return record;
	},
	rendered: function() {
		this.inherited(arguments);
		if (this.bottomUp) {
			this.scrollToBottom();
		}
	},
	scrollToBottom: function() {
		this.$.scroller.scrollToBottom();
	},
	build: function() {
		// destroy previous request to make sure to cancel any watches
		if (this.request) {
			this.request.destroy();
			this.request = null;
		}
		var query = {
			limit: this.pageSize,
			desc: this.desc
		};
		return this.doQuery(query);
	},
	queryResponse: function(inResponse, inRequest) {
		// cache request object so it's possible to destroy.
		this.request = inRequest;
		this.data = inResponse.results;
		if (this.bottomUp) {
			this.data.reverse();
		}
		this.render();
	},
	updateRow: function(inIndex) {
		this.$.client.renderRow(inIndex);
	},
	refresh: function() {
		this.render();
	},
	reset: function() {
		this.build();
	},
	punt: function() {
		this.$.scroller.setScrollTop(0);
		this.build();
	}
});