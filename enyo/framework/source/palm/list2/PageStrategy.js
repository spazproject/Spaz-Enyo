/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	Strategy for managing a page stack such that a scrolling viewport 
	is covered by pages.
	//
	* Direction and dom-independent.
	* Maintains coherent boundaries, but has no cursor.
	* Client-code must:
		* set viewSize (FIXME)
		* implement push/pop.unshift/shiftPage events
*/
enyo.kind({
	name: "enyo.list.PageStrategy",
	kind: enyo.Component,
	events: {
		onPushPage: "pushPage",
		onPopPage: "popPage",
		onUnshiftPage: "unshiftPage",
		onShiftPage: "shiftPage"
	},
	viewSize: 0,
	contentSize: 0,
	virtualOffset: 0,
	scrollPosition: 0,
	topBoundary: 9e9,
	bottomBoundary: -9e9,
	scroll: function(inPosition, inInvert) {
		// invert coordinate system if requested
		var pos = !inInvert ? inPosition : -inPosition;
		// offset virtual scroll position to find the effective scroll position
		var st = Math.round(pos - this.virtualOffset);
		if (st !== this.scrollPosition) {
			// scrollPosition drives all page rendering / discarding
			this.scrollPosition = st;
			// add or remove pages from either end to satisfy display requirements
			this.updatePages();
		}
		// return (optionally inverted) scroll position
		return this.getScrollPosition(inInvert);
	},
	getScrollPosition: function(inInvert) {
		return !inInvert ? this.scrollPosition : this.viewSize - this.contentSize - this.scrollPosition;
	},
	updatePages: function() {
		// show pages that have scrolled in from the bottom
		this.pushPages();
		// hide pages that have scrolled off the bottom
		this.popPages();
		// show pages that have scrolled in from the top
		this.unshiftPages();
		// hide pages that have scrolled off the top
		this.shiftPages();
		// resolve conflicting boundaries
		this.validateBoundaries();
	},
	// show pages that have scrolled in from the bottom
	pushPages: function() {
		while (this.contentSize + this.scrollPosition < this.viewSize) {
			var s = this.pushPage();
			// if we've reached the end of the list...
			if (!s && s!==0) {
				// then we know where the bottomBoundary is
				this.bottomBoundary = -this.contentSize + this.virtualOffset + this.viewSize;
				//this.log("locating bottomBoundary at " + this.bottomBoundary);
				break;
			}
			//this.log(s);
			this.contentSize += s;
		}
	},
	// hide pages that have scrolled off of the bottom
	popPages: function() {
		while (true) {
			var space = this.contentSize + this.scrollPosition - this.viewSize;
			var s = this.popPage(space);
			if (!s && s!==0) {
				break;
			}
			//this.log(s);
			this.contentSize -= s;
		}
	},
	// show pages that have scrolled in from the top
	unshiftPages: function() {
		while (this.scrollPosition > 0) {
			var s = this.unshiftPage();
			// if we've reached the top of the list...
			if (!s && s!==0) {
				// then we know where the topBoundary is
				this.topBoundary = this.virtualOffset;
				break;
			}
			// note: if s is zero we will loop again
			//this.log(s);
			this.contentSize += s;
			this.virtualOffset += s;
			this.scrollPosition -= s;
		}
	},
	// hide pages that have scrolled off the top
	shiftPages: function() {
		while (true) {
			var s = this.shiftPage(-this.scrollPosition);
			if (!s && s!==0) {
				break;
			}
			//this.log(s);
			this.contentSize -= s;
			this.virtualOffset -= s;
			this.scrollPosition += s;
		}
	},
	validateBoundaries: function() {
		// if the boundaries are crossed, we have to pick one
		// this should only occur if the content is smaller than the viewport
		if (this.bottomBoundary > this.topBoundary) {
			// boundaries are relative to the top of the viewport
			// the scroll strategy manages an infinitely small cursor (it doesn't care about viewport size)
			// so coincident boundaries is proper (disallows scrolling [except overscrolling])
			this.bottomBoundary = this.topBoundary;
		}
	},
	pushPage: function() {
		/*
		var h = this.doPushPage();
		this.log(h);
		return h;
		*/
		return this.doPushPage();
	},
	popPage: function(inSpace) {
		return this.doPopPage(inSpace);
	},
	unshiftPage: function() {
		return this.doUnshiftPage();
	},
	shiftPage: function(inSpace) {
		return this.doShiftPage(inSpace);
	},
	// Discard state except for scroll position
	refresh: function() {
		this.contentSize = 0;
		// We are required to reset boundaries here, because there may be 
		// sufficient new content that additional pages can be rendered
		// before hitting EOL markers. In that scenario, the boundaries
		// will not be adjusted and the new content will not be accessible.
		// For example, if topBoundary = 0, and page -1 is newly created,
		// the topBoundary will not be reduced until at attempt is made to
		// unshift page -2, so page -1 will be above the boundary.
		this.topBoundary = 9e9;
		this.bottomBoundary = -9e9;
	},
	// Restore initial state
	punt: function() {
		this.refresh();
		this.virtualOffset = 0;
	}
});
