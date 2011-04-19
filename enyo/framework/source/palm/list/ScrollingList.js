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
	//* @protected
	components: [
		{name: "scroller", kind: enyo.BufferedScroller, flex: 1, onGenerateRow: "generateRow", onAdjustTop: "adjustTop", onAdjustBottom: "adjustBottom", components: [
			{name: "list", kind: enyo.RowServer, onSetupRow: "doSetupRow"}
		]}
	],
	controlParentName: "list",
	generateRow: function(inSender, inRow) {
		return this.$.list.generateRow(inRow);
	},
	//* @public
	prepareRow: function(inIndex) {
		return this.$.list.prepareRow(inIndex);
	},
	updateRow: function(inIndex) {
		this.prepareRow(inIndex);
		this.doSetupRow(inIndex);
	},
	fetchRowIndex: function() {
		return this.$.list.fetchRowIndex();
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
