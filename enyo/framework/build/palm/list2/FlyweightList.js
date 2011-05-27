/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	Implement a concrete item mechanism for AbstractPageScroller.
*/
enyo.kind({
	name: "enyo.FlyweightList",
	kind: enyo.list.AbstractPageScroller,
	itemsPerPage: 3,
	events: {
		onSetupRow: ""
	},
	components: [
		{name: "server", kind: enyo.RowServer, onSetupRow: "setupRow"},
		{kind: "list.PageStrategy"}
	],
	controlParentName: "server",
	initComponents: function() {
		this.createComponents(enyo.list.AbstractPageScroller.prototype.kindComponents);
		this.inherited(arguments);
	},
	generateRow: function(inRow) {
		return this.$.server.generateRow(inRow);
	},
	setupRow: function(inSender, inRow) {
		return this.doSetupRow(inRow);
	},
	createPage: function(inIndex, inPrepend) {
		webosEvent.start('', 'enyo.FlyweightList.createPage', '');
		var items = this.fetchItems(inIndex, inPrepend);
		if (items) {
			var page = this.createComponent({container: this.$.client, style: "-webkit-transform-style: preserve-3d;", allowHtml: true});
			page.prepend = this.bottomUp ? !inPrepend : inPrepend;
			page.setContent(items.join(''));
			page.render();
			this.pages[inIndex] = page;
			// forces a synchronous layout
			var h = page.hasNode().offsetHeight;
		}
		webosEvent.stop('', 'enyo.FlyweightList.createPage', '');
		return h;
	},
	fetchItems: function(inIndex, inPrepend) {
		//this.log(inIndex, inPrepend);
		// map page index to item index
		var ii = inIndex * this.itemsPerPage;
		var step = 1;
		// must traverse items in inverse direction if prepending
		if (inPrepend !== this.bottomUp) {
			ii += this.itemsPerPage - 1;
			step = -1;
		}
		// traverse rows
		var items = [];
		// we must traverse all possible items since only the first
		// or last item may exist
		// we can only conclude this page is empty after checking
		// all items
		var add = inPrepend ? "unshift" : "push";
		for (var i=0; i<this.itemsPerPage; i++, ii += step) {
			var item = this.generateRow(ii);
			if (item) {
				items[add](item);
			}
		}
		return items.length ? items : null;
	},
	refresh: function() {
		this.$.server.saveCurrentState();
		this.inherited(arguments);
	}
});