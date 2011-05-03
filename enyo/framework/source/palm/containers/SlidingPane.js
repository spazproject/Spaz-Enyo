/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control designed to present a horizontal layout of
<a href="#enyo.SlidingView">SlidingView</a> controls,
which are panel controls that can slide one on top of another. The user can 
drag the views left and right and they'll stay connected. If a view is moved 
to the far left, it will cover any views to the left of it.

SlidingViews can have explicit width or be flexed. In either case, they are displayed
in SlidingPane's client region, which is an HFlexBox. The view on the far 
right is special--it will always behave as flexed unless its fixedWidth property is set to true.

SlidingPane exposes the same selection methods as <a href="#enyo.Pane">Pane</a>. 
The selected view is the one displayed at the far left of the group. 

SlidingGroup also has two layout modes--the normal layout, in which views
are placed left-to-right, and a narrow layout, in which views are stacked,
taking up the entire width of the SlidingPane. A SlidingPane can automatically
toggle between these layouts if its resize method is hooked up to respond to window 
resizing. The "wideWidth" property has a default value of 500 and is the pivot point
between the two layouts.

Here's an example:

	{kind: "SlidingPane", flex: 1, components: [
		{name: "left", width: "320px"},
		{name: "middle", width: "320px", peekWidth: 68},
		{name: "right", flex: 1, onResize: "slidingResize"}
	]}

*/
enyo.kind({
	name: "enyo.SlidingPane",
	kind: enyo.Pane,
	published: {
		multiView: true,
		multiViewMinWidth: 500,
		canAnimate: true
	},
	className: "enyo-sliding-pane",
	events: {
		onSlideComplete: ""
	},
	layoutKind: "",
	defaultKind: "SlidingView",
	//* @protected
	chrome: [
		{kind: "Animator", duration: 700, onAnimate: "stepAnimation", onEnd: "endAnimation"},
		{name: "client", flex: 1, kind: enyo.Control, className: "enyo-view enyo-sliding-pane-client", layoutKind: "HFlexLayout"},
	],
	constructor: function() {
		this.inherited(arguments);
		this.slidingCache = [];
	},
	create: function() {
		this.inherited(arguments);
		this.multiViewChanged();
		this.selectViewImmediate(this.view);
	},
	rendered: function() {
		this.inherited(arguments);
		this.resize();
	},
	// avoid pane flow mechanism which hides unselected views
	flow: function() {
		enyo.Control.prototype.flow.call(this);
	},
	controlIsView: function(inControl) {
		return this.inherited(arguments) && (inControl instanceof enyo.SlidingView);
	},
	// maintain an explicit list of Sliding controls to manipulate
	addView: function(inControl) {
		this.inherited(arguments);
		this.indexViews();
	},
	removeView: function(inControl) {
		this.inherited(arguments);
		this.indexViews();
	},
	// optimization, store index on views as this info is needed during animation
	indexViews: function() {
		for (var i=0, s; s=this.views[i]; i++) {
			s.index = i;
		}
	},
	getAnimator: function() {
		return this.$.animator;
	},
	selectViewImmediate: function(inSelected) {
		var ca = this.canAnimate;
		this.canAnimate = false;
		this.selectView(inSelected, true);
		this.canAnimate = ca;
	},
	_selectView: function(inView) {
		this.lastView = this.view;
		this.view = inView;
		if (!this.dragging) {
			this.moveSelected();
		}
	},
	reallySelectView: function(inView) {
		// if view is re-selected, make sure to try moving it
		if (inView == this.view) {
			if (!this.dragging) {
				this.moveSelected();
			}
		} else {
			this.inherited(arguments);
		}
	},
	// animation
	moveSelected: function() {
		var s = this.findAnimateable(this.view);
		if (s) {
			if (this.canAnimate) {
				this.playAnimation(s);
			} else {
				s.validateAll();
			}
		} else {
			this.slideComplete();
		}
	},
	slideComplete: function() {
		if (!this.wideLayout) {
			this.showHideShadows(false);
		}
		this.view.resizeLastSibling();
		this.doSlideComplete(this.view);
	},
	findAnimateable: function(inSliding) {
		if (inSliding.canAnimate()) {
			return inSliding;
		} else {
			var n = this.view.getLastSibling();
			return n && n.canAnimate() ? n : null;
		}
	},
	playAnimation: function(inSliding) {
		var s = inSliding;
		this.$.animator.sliding = s;
		//
		if (!this.wideLayout) {
			this.showHideShadows(true);
		}
		//
		this.$.animator.play(s.slidePosition, s.calcSlide());
	},
	stepAnimation: function(inSender, inValue) {
		var v = Math.round(inValue);
		// FIXME: experimental
		if (inSender.sliding.moveAlone) {
			inSender.sliding.applySlideToNode(v);
		} else {
			inSender.sliding.animateMove(v);
		}
	},
	endAnimation: function(inSender) {
		inSender.sliding.moveAlone = false;
		this.slideComplete();
	},
	isAnimating: function() {
		return this.$.animator.isAnimating();
	},
	// dragging
	dragstartHandler: function(inSender, inEvent) {
		var s = this.dragStartSliding = inEvent.sliding;
		var d = s && s.isDraggableEvent(inEvent) && this.findDraggable(inEvent.dx);
		if (d) {
			if (!this.wideLayout) {
				this.showHideShadows(true);
			}
			this.$.animator.stop();
			this.dragSliding(d, inEvent, 0);
			return true;
		}
	},
	findDraggable: function(inDx) {
		var c = this.dragStartSliding.index;
		for (var i=0, s$=this.views, s; (i <= c) && (s=s$[i]); i++) {
			if (s.canDrag(inDx)) {
				return s;
			}
		}
	},
	dragSliding: function(inSliding, inEvent, inX) {
		this.dragging = inSliding;
		this.dragging.beginDrag(inEvent, inX);
	},
	dragHandler: function(inSender, inEvent) {
		var s = this.dragging;
		if (s) {
			var next = s.drag(inEvent);
			if (next) {
				this.selectView(next, true);
				var dx = s.isAtDragMax() ? 1 : -1;
				var nd = this.findDraggable(dx);
				if (nd) {
					this.dragSliding(nd, inEvent, inEvent.dx);
				}
			}
		}
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this.dragging) {
			var next = this.dragging.dragFinish(inEvent);
			inEvent.preventClick();
			this.dragging = null;
			this.selectView(next, true);
		}
	},
	// resizing and "layout modes"
	// event handler for resize; if we're the root component, we'll automatically resize
	resizeHandler: function() {
		this.resize();
		this.inherited(arguments);
	},
	// if we're not the root component, this method can be hooked to a resizeHandler
	resize: function() {
		// if no layout change, make sure to validate to ensure proper sizing
		// otherwise apply layout change
		var multiView = this.multiViewMinWidth > 0 && window.innerWidth > this.multiViewMinWidth;
		this.setMultiView(multiView);
		this.validate();
	},
	//* @protected
	multiViewChanged: function(inLastMultiView) {
		if (this.multiView != inLastMultiView) {
			this[this.multiView ? "applyMultiViewLayout" : "applySingleViewLayout"]();
			this.validate();
		}
	},
	// FIXME: we should have layoutKinds for these layouts.
	applyMultiViewLayout: function() {
		for (var i=0, s$=this.views, s; s=s$[i]; i++) {
			this.uncacheSliding(s, i);
		}
		this.showHideShadows(true);
		this.$.client.flow();
	},
	applySingleViewLayout: function() {
		for (var i=0, s$=this.views, s; s=s$[i]; i++) {
			this.cacheSliding(s, i);
			s.setFixedWidth(true);
			s.peekWidth = 0;
			s.flex = 0;
			// defeat auto flex at "100%"
			s.applyStyle("width", "100.0%");
		}
		this.showHideShadows(false);
	},
	// FIXME: this nerfs animation performance too much so disabling
	showHideShadows: function(inShow) {
		/*
		for (var i=0, s$=this.views, s; s=s$[i]; i++) {
			s.setShadowShowing(inShow);
		}
		*/
	},
	cacheSliding: function(inSliding, inIndex) {
		this.slidingCache[inIndex] = {
			flex: inSliding.flex,
			width: inSliding.domStyles.width,
			peekWidth: inSliding.peekWidth,
			fixedWidth: inSliding.fixedWidth
		}
	},
	uncacheSliding: function(inSliding, inIndex) {
		var s = this.slidingCache[inIndex];
		if (s) {
			inSliding.flex = s.flex;
			inSliding.peekWidth = s.peekWidth;
			inSliding.setFixedWidth(s.fixedWidth);
			inSliding.applyStyle("width", s.width);
		}
	},
	validate: function() {
		this.view.validateAll();
	}
});