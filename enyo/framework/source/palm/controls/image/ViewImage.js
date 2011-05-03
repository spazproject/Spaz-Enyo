/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
/**
 Scroller used by enyo.ViewImage. This scroller provides:
 1) option to disable overscroll.
*/
enyo.kind({
	name: "enyo.ViewImageScroller",
	kind: enyo.BasicScroller,
	published: {
		overscrollH: true,
		overscrollV: true
	},
	preventDragPropagation: false,
	chrome: [
		{name: "client", align: "center"}
	],
	/*calcAutoScrolling: function() {
		// FIXME: bypass autoHorizontal/Vertical check
		this.setHorizontal(this.$.scroll.rightBoundary !== 0);
		this.setVertical(this.$.scroll.bottomBoundary !== 0);
	},
	start: function() {
		if (this.$.scroll) {
			this.inherited(arguments);
		}
	},
	destroy: function() {
		this.$.scroll && this.$.scroll.stop();
		this.inherited(arguments);
	},*/
	scroll: function(inSender) {
		var bs = this.getBoundaries(), lb = bs.left-1, rb = bs.right+1, tb = bs.top-1, bb = bs.bottom+1;
		var x = -inSender.x, y = -inSender.y;
		// disable overscroll if overscrollH/V is false
		if (this.overscrollH || x >= lb && x <= rb) {
			this.scrollLeft = x;
		} else {
			this.scrollLeft = x < 0 ? lb : rb;
		}
		if (this.overscrollV || y >= tb && y <= bb) {
			this.scrollTop = y;
		} else {
			this.scrollTop = y < 0 ? tb : bb;
		}
		this.effectScroll();
		this.doScroll();
	}
});

//* @public
/**
A <a href="#enyo.ScrollingImage">ScrollingImage</a> that is specially designed to work in a <a href="#enyo.Carousel">Carousel</a>.

	{kind: "Carousel", flex: 1, components: [
		{kind: "ViewImage", src: "images/01.png"},
		{kind: "ViewImage", src: "images/02.png"},
		{kind: "ViewImage", src: "images/03.png"}
	]}
*/
enyo.kind({
	name: "enyo.ViewImage",
	kind: enyo.ScrollingImage,
	autoSize: true,
	published: {
		accelerated: true
	},
	events: {
		onImageLoaded: "imageLoaded"
	},
	className: "enyo-viewimage",
	chrome: [
		{name: "animator", kind: "Animator", onAnimate: "stepAnimation", onEnd: "endAnimation"},
		{name: "scroller", kind: "ViewImageScroller", layoutKind: "HFlexLayout", className: "enyo-fit", autoVertical: true, components: [
			{name: "image", kind: "Image", className: "enyo-viewimage-image"}
		]}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.acceleratedChanged();
	},
	acceleratedChanged: function() {
		this.$.scroller.setAccelerated(this.accelerated);
	},
	dragHandler: function(inSender) {
		var s = this.$.scroller, os = this.outerScroller;
		var pos = os.scrollH ? s.getScrollLeft() : s.getScrollTop();
		var bs = s.getBoundaries();
		var m = os.scrollH ? s.horizontal : s.vertical;
		var lowerPos = os.scrollH ? bs.left : bs.top;
		var upperPos = os.scrollH ? bs.right : bs.bottom;
		if (m && pos >= lowerPos && pos <= upperPos) {
			return true;
		}
	},
	flickHandler: function() {
		// only bubble flick if it is not zoom-in
		return this.isZoomIn();
	},
	zoomChanged: function() {
		this.inherited(arguments);
		if (this.outerScroller) {
			// more resistent to snap to the next image when it is zoom-in
			this.outerScroller.setDragSnapThreshold(this.isZoomIn() ? 0.1 : 0.01);
		}
	},
	setOuterScroller: function(inScroller) {
		this.outerScroller = inScroller;
		this.$.scroller.setOverscrollH(!inScroller.scrollH);
		this.$.scroller.setOverscrollV(inScroller.scrollH);
	},
	reset: function() {
		this.adjustSize();
		var s = this.$.scroller;
		// FIXME: why dragging was not reset to false?
		s.$.scroll.dragging = false;
		s.setScrollPositionDirect(0, 0);
	}
});