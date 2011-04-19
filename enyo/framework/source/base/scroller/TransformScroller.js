/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.kind({
	name: "enyo.TransformScroller",
	kind: enyo.Scroller,
	//* @protected
	effectScroll: function() {
		if (this.scrollee && this.scrollee.hasNode()) {
			var m = -this.scrollLeft + "px, " + -this.scrollTop + "px";
			// NOTE: translate3d prompts acceleration witout need for -webkit-transform-style: preserve-3d; style
			this.scrollee.node.style.webkitTransform = "translate3d(" + m + ",0)";
		}
	}
});