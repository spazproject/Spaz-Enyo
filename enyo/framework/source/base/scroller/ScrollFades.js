/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	A scroller that provides a visual indication if content can be scrolled 
	to the left, right, top, or bottom.
*/
enyo.kind({
	name: "enyo.ScrollFades", 
	kind: enyo.Control,
	//* @protected
	className: "enyo-view",
	components: [
		{name: "top", showing: false, className: "enyo-scrollfades-top"},
		{name: "bottom", showing: false, className: "enyo-scrollfades-bottom"},
		{name: "left", showing: false, className: "enyo-scrollfades-left"},
		{name: "right", showing: false, className: "enyo-scrollfades-right"}
	],
	//* @public
	showHideFades: function(inScroller) {
		var t = inScroller.scrollTop;
		var l = inScroller.scrollLeft;
		var bs = inScroller.getBoundaries();
		this.$.top.setShowing(inScroller.vertical && t > bs.top);
		this.$.bottom.setShowing(inScroller.vertical && t < bs.bottom);
		this.$.left.setShowing(inScroller.horizontal && l > bs.left);
		this.$.right.setShowing(inScroller.horizontal && l < bs.right);
	}
})