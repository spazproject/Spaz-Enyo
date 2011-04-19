/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	The layoutKind for a Pane.
*/
// Pane layout
enyo.kind({
	name: "enyo.PaneLayout",
	//* @protected
	flow: function(inContainer) {
		for (var i=0, c$=inContainer.getViewList(), c; c=c$[i]; i++) {
			c.addClass("enyo-view");
		}
	}
});

// deprecated due to difficulty making work with transitions
/*
enyo.kind({
	name: "enyo.PaneLayout",
	kind: enyo.VFlexLayout,
	calcControlFlex: function(inControl, inExtent, inExtentNick) {
		return 1;
	}
});
*/