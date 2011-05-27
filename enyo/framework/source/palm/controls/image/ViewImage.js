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
	overscrollWidth: 0,
	chrome: [
		{name: "client", align: "center"}
	],
	adjustKFrictionDamping: function(inDamping) {
		this.$.scroll.kFrictionDamping = inDamping;
	},
	scroll: function(inSender) {
		var ow = this.overscrollWidth;
		var bs = this.getBoundaries(), lb = bs.left-1-ow, rb = bs.right+1+ow, tb = bs.top-1-ow, bb = bs.bottom+1+ow;
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
	},
	shouldDrag: function(e) {
		return true;
	},
	dragHandler: function(inSender, inEvent) {
		if (!this._preventDrag) {
			this.inherited(arguments);
		}
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
	overscrollWidth: 100,
	zoomInDragSnapThreshold: 0.2,
	kFrictionDamping: 0.9,
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.acceleratedChanged();
		this.$.scroller.overscrollWidth = this.overscrollWidth;
		this.$.scroller.adjustKFrictionDamping(this.kFrictionDamping);
	},
	acceleratedChanged: function() {
		this.$.scroller.setAccelerated(this.accelerated);
	},
	dragHandler: function(inSender, inEvent) {
		var s = this.$.scroller, os = this.outerScroller;
		var pos = os.scrollH ? s.getScrollLeft() : s.getScrollTop();
		var bs = s.getBoundaries();
		var m = os.scrollH ? s.horizontal : s.vertical;
		var lowerPos = os.scrollH ? bs.left : bs.top;
		var upperPos = os.scrollH ? bs.right : bs.bottom;
		if (this.panning || (m && pos + this.overscrollWidth >= lowerPos && pos - this.overscrollWidth <= upperPos)) {
			// dragging inside the image, stop outer scroller
			inEvent.preventClick = function() {
				this._preventClick = true;
			};
			os.dragfinishHandler(inSender, inEvent);
			return true;
		} else {
			// pass dragging to outer scroller
			if (!os.dragging) {
				os.dragstartHandler(inSender, inEvent);
			}
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
			this.outerScroller.setDragSnapThreshold(this.isZoomIn() ? this.zoomInDragSnapThreshold : 0.01);
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
		s.setScrollPositionDirect(0, 0);
	}
});