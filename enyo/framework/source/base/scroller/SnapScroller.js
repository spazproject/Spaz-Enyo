/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
_enyo.SnapScroller_ is a scroller that snaps to the positions of the controls it contains.
When dragged, the scroller moves normally; when a drag is finished, the scroller snaps to the 
scroll position of the control closest to the dragged position.

Snapping can only occur along one axis at a time. By default this is the horizontal axis. SnapScroller has an HFlexLayout,
so its controls layout from left to right. Setting the layoutKind to VFlexLayout will enable
vertical snapping. Here's an example:

	{kind: "VFlexBox", components: [
		{kind: "SnapScroller", flex: 1, components: [
			{style: "background: red; width: 1000px;"},
			{style: "background: white; width: 1000px;"},
			{style: "background: blue; width: 1000px;"}
		]}
	]}

*/
enyo.kind({
	name: "enyo.SnapScroller",
	kind: enyo.BasicScroller,
	published: {
		/**
		Sets index to scroll directly (without animation) to the position of the
		control in scroller's list of controls at the value of index.
		*/
		index: 0
	},
	events: {
		/**
		Event that fires when the user finishes dragging and snapping occurs.
		*/
		onSnap: "",
		/**
		Event that fires when snapping and scroller animation completes.
		*/
		onSnapFinish: ""
	},
	//* @protected
	layoutKind: "HFlexLayout",
	dragSnapWidth: 0,
	// experimental
	revealAmount: 0,
	//
	create: function() {
		this.inherited(arguments);
		// adjust scroll friction
		this.$.scroll.kFrictionDamping = 0.85;
	},
	layoutKindChanged: function() {
		this.inherited(arguments);
		this.scrollH = this.layoutKind == "HFlexLayout";
		var p = this.revealAmount + "px";
		this.$.client.applyStyle("padding", this.scrollH ? "0 "+p : p+" 0");
	},
	indexChanged: function() {
		var p = this.calcPos(this.index);
		if (p !== undefined) {
			this.calcBoundaries();
			this.scrollToDirect(p);
		}
	},
	scrollStart: function() {
		this.inherited(arguments);
		this.startPos = this.scrollH ? this.getScrollLeft() : this.getScrollTop();
		this._scrolling = true;
	},
	scroll: function(inSender) {
		this.inherited(arguments);
		this.pos = this.scrollH ? this.getScrollLeft() : this.getScrollTop();
		// determine swipe prev or next
		this.goPrev = this.pos0 != this.pos ? this.pos0 > this.pos : this.goPrev;
		if (this.$.scroll.dragging) {
			this.snapStarting = false;
		} else {
			if (!this.snapStarting) {
				var bs = this.getBoundaries();
				var b0 = bs[this.scrollH ? "left" : "top"];
				var b1 = bs[this.scrollH ? "right" : "bottom"];
				if (this.pos > b0 && this.pos < b1) { // within the scroll boundaries
					this.snap();
				}
			} else if (!this._scrolling) {
				this.snapStarting = false;
			}
		}
		this.pos0 = this.pos;
	},
	scrollStop: function() {
		this._scrolling = false;
		if (this.snapping) {
			this.snapping = false;
			if (this.index != this.oldIndex) {
				this.snapFinish();
			}
		}
		this.inherited(arguments);
	},
	snapFinish: function() {
		this.doSnapFinish();
	},
	snapScrollTo: function(inPos) {
		this.pos = inPos;
		this.snapStarting = true;
		this.snapping = true;
		if (this.scrollH) {
			this.scrollTo(0, inPos);
		} else {
			this.scrollTo(inPos, 0);
		}
	},
	scrollToDirect: function(inPos) {
		this.pos = inPos;
		if (this.scrollH) {
			this.setScrollPositionDirect(inPos, 0);
		} else {
			this.setScrollPositionDirect(0, inPos);
		}
	},
	// FIXME: may need a better test for which control to snap to, probably based on what 
	// direction you moved and how far from a snap edge you are.
	calcSnapScroll: function() {
		for (var i=0, c$ = this.getControls(), c, p; c=c$[i]; i++) {
			p = c.hasNode()["offset" + (this.scrollH ? "Left" : "Top")] - this.revealAmount;
			if (this.pos < p) {
				var l = this.scrollH ? c.hasNode().clientWidth : c.hasNode().clientHeight;
				var passMargin = Math.abs(this.pos + (this.goPrev ? 0 : l) - p) > this.dragSnapWidth;
				if (passMargin) {
					return this.goPrev ? i-1 : i;
				} else {
					return this.index;
				}
			}
		}
	},
	calcPos: function(inIndex) {
		var c = this.getControls()[inIndex];
		if (c && c.hasNode()) {
			return c.hasNode()["offset" + (this.scrollH ? "Left" : "Top")] - this.revealAmount;
		}
	},
	snap: function() {
		var i = this.calcSnapScroll();
		if (i !== undefined) {
			this.snapTo(i);
		}
	},
	//* @public
	/**
	Scrolls to the position of the control contained in the scroller's list of controls at inIndex.
	*/
	snapTo: function(inIndex) {
		this.oldIndex = this.index;
		var p = this.calcPos(inIndex);
		if (p !== undefined) {
			this.index = inIndex;
			this.snapScrollTo(p);
			if (this.index != this.oldIndex) {
				this.doSnap(inIndex);
			}
		}
	},
	/**
	Scrolls to the control preceding (left or top) the one currently in view.
	*/
	previous: function() {
		!this.snapping && this.snapTo(this.index-1);
	},
	/**
	Scrolls to the control following (right or bottom) the one currently in view.
	*/
	next: function() {
		!this.snapping && this.snapTo(this.index+1);
	}
});