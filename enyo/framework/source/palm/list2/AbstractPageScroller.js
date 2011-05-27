/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	Implement a concrete paging mechanism for CustomAbstractPageScroller.
*/
enyo.kind({
	name: "enyo.list.AbstractPageScroller",
	kind: enyo.list.CustomAbstractPageScroller,
	top: 0,
	bottom: -1,
	//createPage: function(inIndex, inPrepend) // abstract
	create: function() {
		this.sizes = [];
		this.pages = [];
		this.inherited(arguments);
	},
	punt: function() {
		this.top = 0;
		this.$.pageStrategy.punt();
		this.$.scroll.setScrollPosition(0);
		//this.refresh();
	},
	refresh: function() {
		this.$.pageStrategy.refresh();
		this.flushConcretePages();
		this.update();
		// FIXME: oob test will break async data systems
		// detect out-of-bounds condition:
		//	(this.top): this.top must be non-zero for punt to have a chance (and prevents infinite recursion)
		//	(this.bottom < this.top): if no pages have rendered, we might be oob
		// if no user data exists at cursor 0, punt will fail too
		/*
		if (this.top && this.bottom < this.top) {
			//this.log("punting");
			this.punt();
		}
		*/
	},
	flushConcretePages: function() {
		for (var i in this.pages) {
			this.pages[i].destroy();
		}
		this.pages = [];
		this.bottom = this.top - 1;
	},
	shiftPage: function(inSender, inSpace) {
		var s = this.sizes[this.top];
		if (s || s===0) {
			if (s < inSpace) {
				this.hidePage(this.top);
				this.top++;
				return s;
			}
		}
	},
	unshiftPage: function() {
		if (this.pages[this.top - 1]) {
			this.top--;
			this.showPage(this.top);
			return this.sizes[this.top];
		} else {
			var size = this.createPage(this.top-1, true);
			if (size || size === 0) {
				this.sizes[--this.top] = size;
				return size;
			}
		}
	},
	popPage: function(inSender, inSpace) {
		var s = this.sizes[this.bottom];
		if (s || s===0) {
			if (s < inSpace) {
				this.hidePage(this.bottom);
				this.bottom--;
				return s;
			}
		}
	},
	pushPage: function() {
		//this.log(this.bottom);
		if (this.pages[this.bottom + 1]) {
			this.bottom++;
			this.showPage(this.bottom);
			return this.sizes[this.bottom];
		} else {
			var size = this.createPage(this.bottom+1, false);
			if (size || size === 0) {
				this.sizes[++this.bottom] = size;
				return size;
			}
		}
		//this.log("push page failed at bottom " + this.bottom);
	},
	showPage: function(inIndex) {
		webosEvent.start('', 'enyo.AbstractPageScroller.showPage', '');
		this.pages[inIndex].show();
		webosEvent.stop('', 'enyo.AbstractPageScroller.showPage', '');
	},
	hidePage: function(inIndex) {
		webosEvent.start('', 'enyo.AbstractPageScroller.showPage', '');
		this.pages[inIndex].hide();
		webosEvent.stop('', 'enyo.AbstractPageScroller.showPage', '');
	}
});

