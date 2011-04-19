/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.kind({
	name: "enyo.DisplayBuffer",
	kind: enyo.Buffer,
	height: 0,
	acquirePage: function(inPage) {
		//this.log(inPage);
		var node = this.pages[inPage];
		if (node) {
			node.style.display = "";
			if (!this.heights[inPage]) {
				//this.log(inPage, this.height);
				this.height += this.heights[inPage] = node.offsetHeight;
			}
		}
	},
	discardPage: function(inPage) {
		var node = this.pages[inPage];
		if (node) {
			node.style.display = "none";
		}
		this.height -= this.heights[inPage] || 0;
	}
});