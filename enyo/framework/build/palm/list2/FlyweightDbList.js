/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	Implement a concrete item mechanism for AbstractPageScroller.
*/
enyo.kind({
	name: "enyo.FlyweightDbList",
	kind: enyo.FlyweightList,
	events: {
		onQuery: ""
	},
	needs: null,
	pageSize: 50,
	desc: false,
	initComponents: function() {
		this.inherited(arguments);
		this.createComponent({kind: "DbPages", desc: this.desc, onQuery: "query", onReceive: "receiveDbPage", size: this.pageSize});
	},
	setupRow: function(inSender, inIndex) {
		this.requireRow(inIndex);
		var record = this.fetch(inIndex);
		if (record) {
			this.doSetupRow(record, inIndex);
			return true;
		}
	},
	fetch: function(inRow) {
		return this.$.dbPages.fetch(inRow);
	},
	requireRow: function(inRow) {
		var page = this.rowToPage(inRow);
		this.acquirePage(page);
	},
	rowToPage: function(inRowIndex) {
		return Math.floor(inRowIndex / this.pageSize);
	},
	acquirePage: function(inPage) {
		this.$.dbPages.require(inPage);
		this.$.dbPages.require(inPage+1);
		this.$.dbPages.require(inPage-1);
	},
	query: function(inSender, inQuery) {
		//this.log(inQuery);
		return this.doQuery(inQuery);
	},
	queryResponse: function(inResponse, inRequest) {
		this.$.dbPages.queryResponse(inResponse, inRequest);
		//this.refresh();
		//
		var page = inRequest.index;
		//
		var pageTop = this.rowToPage(this.top);
		var pageBottom = this.rowToPage(this.bottom);
		if ((this.needs === null) && (page < pageTop - 1 || page > pageBottom + 1)) {
			// page out of display range
			//this.log(page, "out of display range (" + pageTop + " - " + pageBottom + ")");
			return;
		}
		//this.log(page, "inside of display range (" + pageTop + " - " + pageBottom + ")");
		//
		// FIMXE: 'needs' interface is hacky
		if (this.needs === null || page >= this.needs || enyo.DbPages.isEOF(inResponse)) {
			// FIXME: needs block is an async continuation of 'reset', which is ad hoc sitting here
			this.needs = null;
			// DOM pages can straddle data pages, so simply
			// pushing new pages with update is not good enough.
			// We have to refresh the entire display buffer to ensure
			// complete DomBuffer pages.
			this.refresh();
		}
	},
	reload: function() {
		var pageTop = this.rowToPage(this.top);
		// acquire new data, continue when acquired
		this.needs = pageTop + 1;
		this.acquirePage(pageTop);
	},
	//* @public
	reset: function() {
		// keep reference to 'top' handle (if possible)
		var pageTop = this.rowToPage(this.top);
		this.$.dbPages.reset(pageTop);
		// dump db buffer,
		this.flushPages();
		// acquire new data
		this.reload();
	},
	rewind: function() {
		// dump rendering buffers
		enyo.FlyweightList.prototype.punt.call(this);
		// rebuild
		this.refresh();
	},
	punt: function() {
		// dump dbPages
		this.$.dbPages.reset(0);
		this.$.dbPages.handles = [];
		this.flushPages();
		// dump rendering buffers
		this.inherited(arguments);
		// acquire new data
		this.reload();
	},
	//* protected
	flushPages: function() {
		var dp = this.$.dbPages;
		for (var i in dp.pages) {
			var p = dp.pages[i];
			if (p.request) {
				p.request.destroy();
			}
		}
		dp.pages = [];
		dp.min = 9999;
		dp.max = -1;
	}
});