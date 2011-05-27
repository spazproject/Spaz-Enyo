/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
/**
	Manages a long list by rendering only small portions of the list at a time.
	Uses flyweight strategy via onSetupRow.
	We suggest users stick to the derived kind VirtualList instead.
	VirtualList introduces a paging strategy for backing data, but it can be 
	ignored if it's not needed.
*/
enyo.kind({
	name: "enyo.ScrollingList",
	kind: enyo.VFlexBox,
	events: {
		onSetupRow: ""
	},
	rowsPerScrollerPage: 1,
	//* @protected
	controlParentName: "list",
	initComponents: function() {
		this.createComponents([
			{flex: 1, name: "scroller", kind: enyo.BufferedScroller, rowsPerPage: this.rowsPerScrollerPage, onGenerateRow: "generateRow", onAdjustTop: "adjustTop", onAdjustBottom: "adjustBottom", components: [
				{name: "list", kind: enyo.RowServer, onSetupRow: "setupRow"}
			]}
		]);
		this.inherited(arguments);
	},
	generateRow: function(inSender, inRow) {
		return this.$.list.generateRow(inRow);
	},
	setupRow: function(inSender, inRow) {
		return this.doSetupRow(inRow);
	},
	//* @public
	prepareRow: function(inIndex) {
		return this.$.list.prepareRow(inIndex);
	},
	updateRow: function(inIndex) {
		this.prepareRow(inIndex);
		this.setupRow(this, inIndex);
	},
	fetchRowIndex: function() {
		return this.$.list.fetchRowIndex();
	},
	update: function() {
		// adjust rendering buffers to fit display
		this.$.scroller.updatePages();
	},
	refresh: function() {
		this.$.list.saveCurrentState();
		this.$.scroller.refreshPages();
	},
	reset: function() {
		// dump state buffer
		this.$.list.clearState();
		// stop scroller animation
		this.$.scroller.$.scroll.stop();
		// dump and rebuild rendering buffers
		this.refresh();
	},
	punt: function() {
		// dump state buffer
		this.$.list.clearState();
		// dump rendering buffers and locus data, rebuild from start state
		this.$.scroller.punt();
	}
});
