/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
_enyo.BasicScroller_ provides touch-based scrolling for controls placed inside it.

Note that applications will typically create an <a href="#enyo.Scroller">enyo.Scroller</a>
instead of an enyo.BasicScroller.

Scroller provides a viewport in which the user can drag or flick to scroll content.
Note that a user can drag beyond a valid scroll position. When this occurs, the
scroller moves with increased tension before returning to a valid position with an
accompanying animation.

Note that the scrolling of content exceeding the size of the viewport is not automatic;
for content to scroll, it must be placed inside a scroller control.

##Scroll Axes

By default, content scrolls along both the vertical and horizontal axes.

Scrolling in either dimension can be turned on or off.  In addition, a scroller
can be set to allow scrolling only when content actually exceeds the scroller's
dimensions.

By default, the vertical axis always scrolls, whether or not the content
exceeds the scroller's height, while the horizontal axis scrolls only if content
exceeds the scroller's width. This automatic scrolling for the horizontal axis is
set via the autoHorizontal property. It can be enabled for the vertical axis
by setting autoVertical to true.

These auto properties have precedence over the horizontal and vertical properties,
which both default to true.

Thus, to disable horizontal scrolling, for example, set both the autoHorizontal and
horizontal properties to false.

	{kind: "BasicScroller", autoHorizontal: false, horizontal: false}

##Scroll Position

Scroll position can be set such that the scroller snaps to a position directly or
such that the scroller animates to a position.

To set scroll position directly, without animation, set the scrollTop and scrollLeft properties.

	buttonClick: function() {
		// don't allow scrolling beyond a left position of 500
		if (this.$.scroller.getScrollLeft() > 500) {
			this.$.scroller.setScrollLeft(500);
		}
	}

To set scroll position with animation, use the scrollTo method.

	buttonClick: function() {
		if (this.$.scroller.getScrollTop() > 100 || this.$.scroller.getScrollLeft() > 300) {
			this.$.scroller.scrollTo(100, 300);
		}
	}

It's also possible to ensure that a given scroll position is visible in a scroller's viewport
by calling the scrollIntoView method. If the scroll position is in view, the scroll position
does not change. If not, the scroll position is set to the given position.

##Sizing

A scroller control must have explicit dimensions. If it does not, it will simply expand
to fit its content and will not provide scrolling. There are a number of ways to ensure
that a scroller's dimensions are set, but most commonly, a scroller is placed inside a
flex layout and given a flex value. For example,

	{kind: "VFlexLayout", components: [
		{kind: "PageHeader", content: "A bunch of info"},
		// NOTE: the scroller has flex set to 1
		{kind: "BasicScroller", flex: 1, components: [
			{kind: "HtmlContent", srcId: "lotsOfText"}
		]},
		{kind: "Toolbar"}
	]}
*/
enyo.kind({
	name: "enyo.BasicScroller",
	kind: enyo.DragScroller,
	published: {
		scrollTop: 0,
		scrollLeft: 0,
		/**
		Enables horizontal scrolling only if content exceeds the scroller's width.
		*/
		autoHorizontal: true,
		/**
		Enables vertical scrolling only if content exceeds the scroller's height.
		*/
		autoVertical: false,
		/**
		Display fps counter
		*/
		fpsShowing: false,
		/**
		Use accelerated scrolling.
		*/
		accelerated: true
	},
	events: {
		/**
		Event that fires when scrolling starts.
		*/
		onScrollStart: "",
		/**
		Event that fires when the scroll position changes.
		*/
		onScroll: "",
		/**
		Event that fires when scrolling stops.
		*/
		onScrollStop: ""
	},
	className: "enyo-scroller",
	//* @protected
	chrome: [
		{name: "client"}
	],
	create: function() {
		this.inherited(arguments);
		enyo.mixin(this.domAttributes, {
			onscroll: enyo.bubbler
		});
		this.fpsShowingChanged();
		this.acceleratedChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		// FIXME: use preventScrollAtRendered to bypass scroll simulation.
		// There are times that we just want to update the content by calling contentChanged() or render() but don't
		// want to get scroll events.
		// In general, we should fire scroll events only when user drags the scroll region, e.g. scroll start via drag.
		if (this.hasNode()/* && !this.preventScrollAtRendered*/) {
			enyo.asyncMethod(this.$.scroll, "start");
		}
	},
	scrollHandler: function(inSender, e) {
		// defeat dom scrolling
		if (this.hasNode()) {
			this.node.scrollTop = 0;
			this.node.scrollLeft = 0;
		}
	},
	resizeHandler: function() {
		this.start();
		this.inherited(arguments);
	},
	// Add scroll position to control offset calculation
	calcControlOffset: function(inControl) {
		var o = this.inherited(arguments);
		o.left -= this.scrollLeft;
		o.top -= this.scrollTop;
		return o;
	},
	locateScrollee: function() {
		return this.$.client;
	},
	setScrollee: function(inScrollee) {
		if (this.scrollee)  {
			this.scrollee.removeClass("enyo-scroller-scrollee");
		}
		// FIXME: temporary warning for this especially bad case.
		if (!inScrollee) {
			this.log("Setting null scrollee");
		}
		this.scrollee = inScrollee;
		this.scrollee.addClass("enyo-scroller-scrollee");
	},
	flow: function() {
		// NOTE: this is ad hoc, but seems like a reasonable place to setScrollee
		this.setScrollee(this.locateScrollee());
		this.layoutKindChanged();
		this.inherited(arguments);
	},
	layoutKindChanged: function() {
		if (this.$.client) {
			this.$.client.setLayoutKind(this.layoutKind);
		}
	},
	showingChanged: function() {
		this.inherited(arguments);
		if (this.showing) {
			enyo.asyncMethod(this, this.start);
		}
	},
	fpsShowingChanged: function() {
		if (!this.$.fps && this.fpsShowing) {
			this.createChrome([{name: "fps", content: "stopped", className: "enyo-scroller-fps", parent: this}]);
			if (this.generated) {
				this.$.fps.render();
			}
		}
		if (this.$.fps) {
			this.$.fps.setShowing(this.fpsShowing);
		}
	},
	acceleratedChanged: function() {
		var p = {top: this.scrollTop, left: this.scrollLeft};
		this.scrollTop = 0;
		this.scrollLeft = 0;
		if (this.effectScroll) {
			this.effectScroll();
		}
		this.scrollTop = p.top;
		this.scrollLeft = p.left;
		this.effectScroll = this.accelerated ? this.effectScrollAccelerated : this.effectScrollNonAccelerated;
		this.effectScroll();
	},
	start: function() {
		this.$.scroll.start();
	},
	stop: function() {
		if (this.isScrolling()) {
			this.$.scroll.stop();
		}
	},
	dragstartHandler: function(inSender, inEvent) {
		this.calcBoundaries();
		this.calcAutoScrolling();
		return this.inherited(arguments);
	},
	// this event comes from the 'scroll' object, it is fired
	// by start() call above, and also when user starts a drag interaction
	scrollStart: function(inSender) {
		this.calcBoundaries();
		this.calcAutoScrolling();
		this.scrollLeftStart = this.scrollLeft;
		this.scrollTopStart = this.scrollTop;
		this.doScrollStart();
	},
	scroll: function(inSender) {
		this.scrollLeft = -inSender.x;
		this.scrollTop = -inSender.y;
		this.effectScroll();
		this.doScroll();
	},
	scrollStop: function(inSender) {
		if (this.fpsShowing) {
			this.$.fps.setContent(inSender.fps);
		}
		// NOTE: after a scroller stops some controls may need to reposition themselves, e.g. popup
		// send an offsetChanged message if our scroll position is changed.
		if (this.scrollLeft != this.scrollLeftStart || this.scrollTop != this.scrollTopStart) {
			this.broadcastToControls("offsetChanged");
		}
		this.doScrollStop();
	},
	effectScrollAccelerated: function() {
		if (this.scrollee && this.scrollee.hasNode()) {
			// NOTE: optimization, avoid using applyStyle which sets node cssText and instead set individual property.
			var s = this.scrollee.node.style;
			var ds = this.scrollee.domStyles;
			// Scroll via transform: fastest when accelerated, slowest when not
			var m = -this.scrollLeft + "px, " + -this.scrollTop + "px";
			// NOTE: translate3d prompts acceleration witout need for -webkit-transform-style: preserve-3d; style
			ds["-webkit-transform"] = s.webkitTransform = "translate3d(" + m + ",0)";
		}
	},
	effectScrollNonAccelerated: function() {
		if (this.scrollee && this.scrollee.hasNode()) {
			// NOTE: optimization, avoid using applyStyle which sets node cssText and instead set individual property.
			var s = this.scrollee.node.style;
			var ds = this.scrollee.domStyles;
			// Scroll via top: faster than transform when unaccelerated.
			ds.top = s.top = -this.scrollTop + "px";
			ds.left = s.left = -this.scrollLeft + "px";
		}
	},
	calcBoundaries: function() {
		var sn = this.scrollee && this.scrollee.hasNode();
		if (sn && this.hasNode()) {
			// NOTE: it makes most sense to calculate our scroll h/w by asking for the scroll h/w of the parent (client) node 
			// of our scrolling content (scrollee) node [note: only Scroller has this relationship]
			// However, (non-accelerated) scrolling scrollee via top/left alters the parent's scroll h/w
			// Also when scrolling scrollee via webkitTransform (accelerated) and the client is position: absolute,
			// scrolling inexplicably alters the parent's scroll h/w (this seems to violate known transform rules).
			// So instead, we use scrollee's scroll h/w.
			// This is off by scrollee's border and margin.
			// Add border via offsetHeight - clientHeight.
			// Add margin via offsetTop. This includes margin + top, so compensate for top when we scroll using top. 
			//
			// calculate margin adjustment.
			var mh = sn.offsetTop;
			var mw = sn.offsetLeft;
			if (!this.accelerated) {
				mh += this.scrollTop;
				mw += this.scrollLeft;
			}
			// scroll h/w + (margin) + (border)
			var h = sn.scrollHeight + mh + (sn.offsetHeight - sn.clientHeight);
			var w = sn.scrollWidth + mw + (sn.offsetWidth - sn.clientWidth)
			var bounds = {
				b: Math.min(0, this.node.clientHeight - h),
				r: Math.min(0, this.node.clientWidth - w)
			}
			this.adjustBoundaries(bounds);
			this.$.scroll.bottomBoundary = bounds.b;
			this.$.scroll.rightBoundary = bounds.r;
		}
	},
	// FIXME: make this work...
	adjustBoundaries: function(inBounds) {
		// allow content to be visible when underneath a region floating over it
		// by adjusting bottom boundary by amount of scroller region that's not visible.
		//
		// FIXME: need a better name (calcModalControlBounds)
		var vb = enyo.calcModalControlBounds(this);
		var b = this.getBounds();
		inBounds.b -= Math.max(0, b.height - vb.height);
	},
	calcAutoScrolling: function() {
		// auto-detect if we should scroll
		if (this.autoHorizontal) {
			this.setHorizontal(this.$.scroll.rightBoundary !== 0);
		}
		if (this.autoVertical) {
			this.setVertical(this.$.scroll.bottomBoundary !== 0);
		}
	},
	scrollLeftChanged: function() {
		var s = this.$.scroll;
		s.x = s.x0 = -this.scrollLeft;
		if (this.scrollee) {
			s.start();
		}
	},
	scrollTopChanged: function() {
		var s = this.$.scroll;
		s.y = s.y0 = -this.scrollTop;
		if (this.scrollee) {
			s.start();
		}
	},
	setScrollPositionDirect: function(inX, inY) {
		this.scrollTop = inY;
		this.scrollLeft = inX;
		// update ScrollStrategy positions
		var s = this.$.scroll;
		s.y = s.y0 = -this.scrollTop;
		s.x = s.x0 = -this.scrollLeft;
		this.effectScroll();
	},
	//* @public
	//* Returns true if the scroller is scrolling when called.
	isScrolling: function() {
		return this.$.scroll.isScrolling();
	},
	/**
	Returns an object describing the scroll boundaries, which are the dimensions
	of scrolling content. For example, if getBoundaries returns

		{top: 0, left: 0, bottom: 1000, left: 1000}

	then the scrolling content is 1000 by 1000.
	*/
	getBoundaries: function() {
		this.calcBoundaries();
		var s = this.$.scroll;
		return {top: s.topBoundary, right: -s.rightBoundary, bottom: -s.bottomBoundary, left: s.leftBoundary};
	},
	// NOTE: Yip/Orvell method for determining scroller instantaneous velocity
	// FIXME: should probably be in ScrollStrategy.
	// FIXME: incorrect if called when scroller is in overscroll region
	// because does not account for additional overscroll damping.
	/**
	Animates a scroll to the specified position.
	*/
	scrollTo: function(inY, inX) {
		var s = this.$.scroll;
		if (inY !== null) {
			s.y = s.y0 - (inY + s.y0) * (1 - s.kFrictionDamping);
		}
		if (inX !== null) {
			s.x = s.x0 - (inX + s.x0) * (1 - s.kFrictionDamping);
		}
		s.start();
	},
	/**
	Ensures that the specified position is displayed in the viewport.
	If the position is not currently in view, the specified position
	is scrolled to directly, without animation.
	*/
	scrollIntoView: function(inY, inX) {
		if (this.hasNode()) {
			this.stop();
			var b = this.getBoundaries();
			var h = this.node.clientHeight;
			var w = this.node.clientWidth;
			if ((inY < this.scrollTop) || (inY > this.scrollTop + h)) {
				this.setScrollTop(Math.max(b.top, Math.min(b.bottom, inY)));
			}
			if ((inX < this.scrollLeft) || (inX > this.scrollLeft + w)) {
				this.setScrollLeft(Math.max(b.left, Math.min(b.right, inY)));
			}
		}
		// FIXME: should only be necessary to ensure a no-op move keeps the scroller in bounds
		// which should not be necessary. can we remove this?
		this.start();
	},
	//* @protected
	scrollOffsetIntoView: function(inY, inX, inHeight) {
		if (this.hasNode()) {
			this.stop();
			var b = enyo.calcModalControlBounds(this);
			b.bottom = b.top + b.height;
			b.right = b.left + b.width;
			if (inY != undefined) {
				// add some sluff!!
				var sluff = 10;
				b.top += sluff;
				b.bottom -= (inHeight || 0) + sluff;
				if (inY < b.top) {
					this.setScrollTop(this.scrollTop + inY - b.top);
				} else if (inY > b.bottom) {
					this.setScrollTop(this.scrollTop + inY - b.bottom);
				}
			}
			if (inX != undefined) {
				if (inX < b.left) {
					this.setScrollLeft(this.scrollLeft + inX - b.left);
				} else if (inX > b.right) {
					this.setScrollLeft(this.scrollLeft + inX - b.right);
				}
			}
			this.start();
		}
	},
	//* @public
	/**
	Sets the scroll position to the bottom of the content, without animation.
	*/
	scrollToBottom: function() {
		this.scrollIntoView(9e6, 0);
	}
});
