/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control designed to display data stored in a mojodb database as a list of rows.
A DbList uses an <a href="#enyo.VirtualList">enyo.VirtualList</a> to manage list rendering.
*/
enyo.kind({
	name: "enyo.DbList",
	//kind: enyo.VFlexBox,
	kind: enyo.VirtualList,
	published: {
		pageSize: 20,
		desc: false
	},
	events: {
		/**
		Fires when a database query should be made. DbList maintains a store of database data
		but does not directly interact with the database.
		Use an <a href="#enyo.DbService">enyo.DbService</a> or compatible kind to perform the
		database query.

		Handlers have this signature:

			function(inSender, inQuery)

		inSender {Object} This object  
		inQuery {Object} Database query to perform.  
		*/
		onQuery: "",
		/**
		Fires when a row is to be rendered. Handler should populate row controls with relevant
		data as needed.

		Handlers have this signature:

			function(inSender, inRecord, inIndex)
		
		inSender {Object} This object  
		inRecord {Object} Object containing row data.  
		inIndex {Integer} Index of the row.  
		*/
		onSetupRow: ""
	},
	//* @protected
	/*
	components: [
		{kind: "DbPages", onQuery: "doQuery", onReceive: "receiveDbPage"},
		{flex: 1, name: "list", kind: "VirtualList", onSetupRow: "setupRow", onAcquirePage: "acquirePage", onDiscardPage: "discardPage"}
	],
	*/
	//controlParentName: "list",
	create: function() {
		this.inherited(arguments);
		this.pageSizeChanged();
		this.descChanged();
	},
	initComponents: function() {
		this.inherited(arguments);
		this.createComponent({kind: "DbPages", onQuery: "doQuery", onReceive: "receiveDbPage"});
	},
	descChanged: function() {
		this.$.dbPages.desc = this.desc;
	},
	pageSizeChanged: function() {
		this.$.dbPages.size = this.pageSize;
	},
	doAcquirePage: function(inSender, inPage) {
		//enyo.vizLog.log("DbList: acquirePage: " + inPage);
		this.$.dbPages.require(inPage);
	},
	doDiscardPage: function(inSender, inPage) {
		//enyo.vizLog.log("DbList: discardPage: " + inPage);
		this.$.dbPages.dispose(inPage);
		//enyo.viz && enyo.viz.dbListUpdate(this);
	},
	needs: null,
	queryResponse: function(inResponse, inRequest) {
		this.$.dbPages.queryResponse(inResponse, inRequest);
		//enyo.viz && enyo.viz.dbListUpdate(this);
		//
		var page = inRequest.index;
		//
		var b = this.$.buffer;
		if ((page < b.specTop || page > b.specBottom) && this.needs === null) {
			enyo.vizLog && enyo.vizLog.log("DbList: no-render queryResponse (page: " + page + ")");
			//this.log("received page out of display range");
			return;
		}
		//
		enyo.vizLog && enyo.vizLog.startFrame("DbList: queryResponse (page: " + page + ")");
		//
		// DomBuffer pages can straddle data pages, so simply
		// pushing new pages with updatePages is not good enough.
		// We have to refresh the entire display buffer to ensure
		// complete DomBuffer pages.
		//
		// FIMXE: 'needs' interface is hacky
		if (this.needs === null || page >= this.needs || enyo.DbPages.isEOF(inResponse)) {
			// FIXME: these needs blocks form an async continuation of 'reset', which is ad hoc sitting here
			// NOTE: must dump state buffer before rendering!
			if (this.needs !== null) {
				this.$.list.clearState();
			}
			this.refresh();
			if (this.needs !== null) {
				// FIXME: ad hoc async continuation of 'reset'
				// FIXME: we need to block the UI during the interval
				// update scroll position
				this.$.scroller.$.scroll.start();
				// done looking for fresh data
				this.needs = null;
			}
			
		}
	},
	fetch: function(inRow) {
		return this.$.dbPages.fetch(inRow);
	},
	setupRow: function(inSender, inIndex) {
		var record = this.fetch(inIndex);
		if (record) {
			this.doSetupRow(record, inIndex);
			return true;
		}
	},
	//* @public
	update: function() {
		// adjust rendering buffers to fit display
		this.$.scroller.updatePages();
		enyo.viz && enyo.viz.dbListUpdate(this);
	},
	reset: function() {
		// virtual-list buffer
		var b = this.$.buffer;
		// this 'live top'
		var top = b.specTop === undefined ? b.top : b.specTop;
		//var bottom = b.specBottom === undefined ? b.bottom : b.specBottom;
		//
		// dump db buffer, keep reference to 'top' handle (if possible)
		this.$.dbPages.reset(top);
		//
		// flush the buffer, which will call discardPages on us, and allow
		// dbPages to clean up any 'watching' request objects that are
		// linked to pages
		b.flush();
		b.top = top;
		b.bottom = top - 1;
		//
		this.needs = top + 1;
		//this.log(this.needs);
		//
		// virtual-list buffer and dbPages must be synchronized
		// for 'flush' (above) to work properly
		// we could require directly from dbPages here
		// but then the buffer and the dbPages would not
		// agree.
		b.adjustBottom(top+1);
		//this.$.dbPages.require(top);
		//this.$.dbPages.require(top+1);
	},
	punt: function() {
		// virtual-list buffer
		var b = this.$.buffer;
		// dump data buffer
		b.flush();
		b.top = b.specTop = 0;
		b.bottom = b.specBottom = -1;
		this.$.dbPages.reset(0);
		this.$.dbPages.handles = [];
		// dump and rebuild rendering buffers
		this.inherited(arguments);
		enyo.viz && enyo.viz.dbListUpdate(this);
	}
});