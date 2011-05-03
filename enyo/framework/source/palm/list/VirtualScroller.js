/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.kind({
	name: "enyo.VirtualScroller",
	kind: enyo.DragScroller,
	events: {
		onScroll: ""
	},
	published: {
		/**
		Display fps counter
		*/
		fpsShowing: false,
		/**
		Use accelerated scrolling.
		*/
		accelerated: false
	},
	className: "enyo-virtual-scroller",
	//* @protected
	tools: [
		{name: "scroll", kind: "ScrollMath", kFrictionDamping: 0.97, topBoundary: 1e9, bottomBoundary: -1e9}
	],
	chrome: [
		// if effecting scroll via scrollTop, then margin is required to enable overscrolling.
		/*
		{name: "content", style: "margin: 900px 0"},
		*/
		{name: "content"}
	],
	//
	// custom sliding-buffer
	//
	top: 0,
	bottom: -1,
	pageTop: 0,
	pageOffset: 0,
	contentHeight: 0,
	//* @protected
	//
	constructor: function() {
		this.heights = [];
		this.inherited(arguments);
	},
	create: function() {
		this.inherited(arguments);
		this.fpsShowingChanged();
		this.acceleratedChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		this.measure();
		this.$.scroll.animate();
	},
	fpsShowingChanged: function() {
		if (!this.$.fps && this.fpsShowing) {
			this.createChrome([
				{name: "fps", content: "stopped", className: "enyo-scroller-fps", parent: this}
			]);
			if (this.generated) {
				this.$.fps.render();
			}
		}
		if (this.$.fps) {
			this.$.fps.setShowing(this.fpsShowing);
		}
	},
	acceleratedChanged: function() {
		var p = this.pageTop;
		this.pageTop = 0;
		if (this.effectScroll) {
			this.effectScroll();
		}
		this.pageTop = p;
		this.effectScroll = this.accelerated ? this.effectScrollAccelerated : this.effectScrollNonAccelerated;
		this.$.content.applyStyle("margin", this.accelerated ? null : "900px 0");
		this.effectScroll();
	},
	measure: function(viewNode, contentNode) {
		this.unlockClipRegion();
		this.viewNode = this.hasNode();
		if (this.viewNode) {
			this.viewHeight = this.viewNode.clientHeight;
			if (this.$.content.hasNode()) {
				this.contentHeight = this.$.content.node.offsetHeight;
			}
		}
		this.lockClipRegion();
	},
	lockClipRegion: function() {
		this._unlockedDomStyles = enyo.clone(this.domStyles);
		var b = this.getBounds();
		this.addStyles("top: " + b.top + "px; left: " + b.left + "px; width: " + b.width + "px; height: " + b.height + "px; position: absolute; overflow: hidden; -webkit-box-flex: auto;");
	},
	unlockClipRegion: function() {
		if (this._unlockedDomStyles) {
			this.setDomStyles(this._unlockedDomStyles);
		}
	},
	//* @public
	//
	// FIXME: Scroller's shiftPage/unshiftPage/pushPage/popPage are implemented via adjustTop/adjustBottom
	// Conversely, Buffer's adjustTop/adjustBottom are implemented via shift/unshift/push/pop
	// Presumably there is a less confusing way of factoring or naming the methods.
	//
	// abstract: subclass must supply
	adjustTop: function(inTop) {
	},
	// abstract: subclass must supply
	adjustBottom: function(inBottom) {
	},
	//* @protected
	// add a page to the top of the window
	unshiftPage: function() {
		var t = this.top - 1;
		if (this.adjustTop(t) === false) {
			enyo.vizLog && enyo.vizLog.log("VirtualScroller: FAIL unshift page " + t);
			return false;
		}
		this.top = t;
		enyo.vizLog && enyo.vizLog.log("VirtualScroller: unshifted page " + t);
	},
	// remove a page from the top of the window
	shiftPage: function() {
		this.adjustTop(++this.top);
	},
	// add a page to the top of the window
	pushPage: function() {
		//this.log(this.top, this.bottom);
		var b = this.bottom + 1;
		if (this.adjustBottom(b) === false) {
			enyo.vizLog && enyo.vizLog.log("VirtualScroller: FAIL push page " + b);
			return false;
		}
		this.bottom = b;
		enyo.vizLog && enyo.vizLog.log("VirtualScroller: pushed page " + b);
	},
	// remove a page from the top of the window
	popPage: function() {
		enyo.vizLog && enyo.vizLog.log("VirtualScroller: popped page " + this.bottom);
		this.adjustBottom(--this.bottom);
	},
	//* @public
	// show pages that have scrolled in from the bottom
	pushPages: function() {
		while (this.contentHeight + this.pageTop < this.viewHeight) {
			if (this.pushPage() === false) {
				//this.log('failed, setting bottom');
				this.$.scroll.bottomBoundary = Math.min(-this.contentHeight + this.pageOffset + this.viewHeight, -1);
				break;
			}
			// NOTE: this.heights[this.bottom] can be undefined if there is no data to render, and therefore no nodes at this.bottom
			this.contentHeight += this.heights[this.bottom] || 0;
		}
	},
	// hide pages that have scrolled off of the bottom
	popPages: function() {
		// NOTE: this.heights[this.bottom] can be undefined if there is no data to render, and therefore no nodes at this.bottom
		var h = this.heights[this.bottom];
		while (h !== undefined && this.bottom && this.contentHeight + this.pageTop - h > this.viewHeight) {
			this.popPage();
			this.contentHeight -= h;
			h = this.heights[this.bottom];
		}
	},
	//
	// NOTES:
	//
	// pageOffset represents the scroll-distance in the logical display (from ScrollManager's perspective)
	// that is hidden from the real display (via: display: none). It's measured as pixels above the origin, so
	// the value is <= 0.
	//
	// pageTop is the scroll position on the real display, also <= 0.
	//
	// hide pages that have scrolled off the top
	shiftPages: function() {
		// the height of the first (displayed) page
		var h = this.heights[this.top];
		while (h !== undefined && h < -this.pageTop) {
			enyo.vizLog && enyo.vizLog.log("VirtualScroller: shift page " + this.top + " (height: " + h + ")");
			//this.log(this.top, h, this.pageTop);
			// increase the distance from the logical display that is hidden from the real display
			this.pageOffset -= h;
			// decrease the distance representing the scroll position on the real display
			this.pageTop += h;
			// decrease the height of the real display
			this.contentHeight -= h;
			// process the buffer movement
			this.shiftPage();
			// the height of the new first page
			h = this.heights[this.top];
			//console.log('hiding ', top, ' with height ', h);
		}
	},
	// show pages that have scrolled in from the top
	unshiftPages: function() {
		// If we are empty (inverted)
		// unshift() doesn't know what to do.
		// Generally, push() ensures we are not empty,
		// unless there is no data.
		/*
		if (this.bottom < this.top) {
			return;
		}
		*/
		while (this.pageTop > 0) {
			if (this.unshiftPage() === false) {
				//console.log(this.top, this.pageOffset, this.pageTop);
				this.$.scroll.topBoundary = this.pageOffset;
				this.$.scroll.bottomBoundary = -9e9;
				break;
			}
			// note: if h is zero we will loop again
			var h = this.heights[this.top];
			if (h === undefined) {
				//console.log("shiftPages undefined height situation");
				//break;
				//debugger;
				this.top++;
				return;
			}
			this.contentHeight += h;
			this.pageOffset += h;
			this.pageTop -= h;
			//console.log('showing ', top, ' with height ', h);
		}
	},
	updatePages: function() {
		if (enyo.vizLog) {
			enyo.vizLog.log("VirtualScroller: updatePages start");
			enyo.vizLog.log("- top/bottom: " + this.top + "/" + this.bottom);
			enyo.vizLog.log("- content/pageTop: " + this.contentHeight + "/" + this.pageTop);
		}
		if (!this.viewNode) {
			return;
		}
		//
		// re-query viewHeight every iteration (performance issue?)
		this.viewHeight = this.viewNode.clientHeight;
		// recalculate boundaries every iteration (performance issue?)
		this.$.scroll.topBoundary = 9e9;
		this.$.scroll.bottomBoundary = -9e9;
		// show pages that have scrolled in from the bottom
		this.pushPages();
		// hide pages that have scrolled off the bottom
		this.popPages();
		// show pages that have scrolled in from the top
		this.unshiftPages();
		// hide pages that have scrolled off the top
		this.shiftPages();
		//
		/*
		if (isNaN(this.contentHeight) || isNaN(this.pageTop) || isNaN(this.pageOffset)) {
			debugger;
		}
		*/
		if (enyo.vizLog) {
			enyo.vizLog.log("VirtualScroller: updatePages finish");
			enyo.vizLog.log("- top/bottom: " + this.top + "/" + this.bottom);
			enyo.vizLog.log("- content/pageTop: " + this.contentHeight + "/" + this.pageTop);
			enyo.vizLog.log("- boundaries: " + this.$.scroll.topBoundary + "/" + this.$.scroll.bottomBoundary);
		}
		// pageTop can change as a result of updatePages, so we need to perform content translation
		// via effectScroll
		// scroll() method doesn't call effectScroll because we call it here
		this.effectScroll();
	},
	//* @protected
	scroll: function() {
		enyo.vizLog && enyo.vizLog.startFrame("VirtualScroller: scroll");
		// calculate relative pageTop
		var pt = Math.round(this.$.scroll.y) - this.pageOffset;
		if (pt == this.pageTop) {
			return;
		}
		// page top drives all page rendering / discarding
		this.pageTop = pt;
		// add or remove pages from either end to satisfy display requirements
		this.updatePages();
		// perform content translation
		this.doScroll();
	},
	scrollStop: function(inSender) {
		if (this.fpsShowing) {
			this.$.fps.setContent(inSender.fps);
		}
	},
	// NOTE: there are a several ways to effect content motion.
	// The 'transform' method in combination with hardware acceleration promises
	// the smoothest animation, but hardware acceleration in combination with the
	// trick-scrolling gambit implemented here produces visual artifacts.
	// In the absence of hardware acceleration, scrollTop appears to be the fastest method.
	effectScrollNonAccelerated: function() {
		if (this.hasNode()) {
			this.node.scrollTop = 900 - this.pageTop;
		}
	},
	effectScrollAccelerated: function() {
		var n = this.$.content.hasNode();
		if (n) {
			for (var i=0, n$=n.childNodes, cn; cn=n$[i]; i++) {
				cn.style.webkitTransform = 'translate3d(0,' + this.pageTop + 'px,0)';
			}
		}
	}
});
