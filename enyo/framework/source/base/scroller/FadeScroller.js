/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.FadeScroller",
	//* @protected
	kind: enyo.Scroller,
	initComponents: function() {
		this.createChrome([{kind: "ScrollFades"}]);
		this.inherited(arguments);
	},
	scroll: function(inSender) {
		this.inherited(arguments);
		this.$.scrollFades.showHideFades(this);
	}
});