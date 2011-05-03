/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A view that slides back and forth and is designed to be a part of a
<a href="#enyo.SlidingPane">SlidingPane</a>.

SlidingView objects have a "dragAnywhere" property, whose default value is true. This allows
the user to drag the view from any point inside the panel that is not already a
draggable region (e.g., a Scroller). If dragAnywhere is set to false, then the view
can still be dragged via any control inside it whose "slidingHandler" property is set to true.

The "peekWidth" property specifies the amount the paneview should be offset from the left
when it is selected. This allows controls on the underlying view object to the left
of the selected one to be partially revealed.

SlidingView has some other published properties that are less frequently used. The "minWidth" 
property specifies a minimum width for view content, and "edgeDragging" lets the user 
drag the view from its left edge. (The default value of edgeDragging is false.)

The last view in a SlidingPane is special, it is resized to fit the available space. 
The onResize event is fired when this occurs.
*/
enyo.kind({
	name: "enyo.SlidingView",
	kind: enyo.Control,
	className: "enyo-sliding-view",
	layoutKind: "VFlexLayout",
	events: {
		onResize: ""
	},
	published: {
		/** Can drag panel from anywhere (note: does not work if there's another drag surface (e.g. scroller)). */
		dragAnywhere: true,
		/** Can drag/toggle by dragging on left edge of sliding panel. */
		edgeDragging: false,
		/** Whether content width should or should not be adjusted based on size changes. */
		fixedWidth: false,
		/** Minimum content width. */
		minWidth: 0,
		/** Amount we should be shifted right to reveal panel underneath us when selected. */
		peekWidth: 0
	},
	//* @protected
	chrome: [
		{name: "shadow", className: "enyo-sliding-view-shadow"},
		{name: "client", className: "enyo-bg", kind: enyo.Control, flex: 1},
		// NOTE: used only as a hidden surface to move sliding from the left edge
		{name: "edgeDragger", slidingHandler: true, kind: enyo.Control, className: "enyo-sliding-view-nub"}
	],
	slidePosition: 0,
	create: function() {
		this.inherited(arguments);
		this.layout = new enyo.VFlexLayout();
		this.edgeDraggingChanged();
		this.minWidthChanged();
	},
	// Add slide position to control offset calculation
	calcControlOffset: function(inControl) {
		var o = this.inherited(arguments);
		o.left += this.slidePosition;
		return o;
	},
	layoutKindChanged: function() {
		this.$.client.setLayoutKind(this.layoutKind);
	},
	edgeDraggingChanged: function() {
		this.$.edgeDragger.setShowing(this.edgeDragging);
	},
	// siblings
	findSiblings: function() {
		return this.manager.views;
	},
	getPreviousSibling: function() {
		return this.findSiblings()[this.index-1];
	},
	getNextSibling: function() {
		return this.findSiblings()[this.index+1];
	},
	getFirstSibling: function() {
		var s = this.findSiblings();
		return s[0];
	},
	getLastSibling: function() {
		var s = this.findSiblings();
		return s[s.length-1];
	},
	// selection
	select: function() {
		this.manager.selectView(this);
	},
	selectPrevious: function() {
		enyo.call(this.getPreviousSibling(), "select");
	},
	selectNext: function() {
		enyo.call(this.getNextSibling(), "select");
	},
	toggleSelected: function() {
		if (this == this.manager.view) {
			this.selectPrevious();
		} else {
			this.select();
		}
	},
	slideFromOutOfView: function() {
		if (this.hasNode() && !this.manager.dragging && !this.manager.isAnimating()) {
			this.show();
			this.applySlideToNode(this.calcSlideMax() + this.node.offsetWidth);
			this.moveAlone = true;
			this.manager.playAnimation(this);
		}
	},
	/*
	// FIXME: experimental
	slideToOutOfView: function() {
		if (this.hasNode() && !this.manager.dragging && !this.manager.isAnimating()) {
			var p = this.getPreviousSibling();
			if (p && p.hasNode()) {
				p.flex = 1;
				p.applyStyle("-webkit-box-flex", "1");
				p.parent.removeClass("enyo-hflexbox");
				var w = p.node.offsetWidth;
				enyo.asyncMethod(this, function() {
					p.parent.addClass("enyo-hflexbox");
					if (p.hasNode()) {
						var d = p.node.offsetWidth - w;
						this.applySlideToNode(this.slidePosition - d);
						this.moveAlone = true;
						this.manager.playAnimation(this);
					}
				});
			}
		}
	},
	*/
	// sliding calculations
	calcSlide: function() {
		var i = this.index;
		var si = this.manager.view.index;
		var state = i == si ? "Selected" : (i < si ? "Before" : "After");
		return this["calcSlide" + state]();
	},
	// FIXME: re-consider offset caching, pita: required to reset on resize.
	getLeftOffset: function() {
		if (this.hasNode()) {
			this._offset = undefined;
			return this._offset !== undefined ? this._offset : (this._offset = this.node.offsetLeft);
		}
		return 0;
	},
	calcSlideMin: function() {
		var x = -this.getLeftOffset();
		return this.peekWidth + x;
	},
	calcSlideMax: function() {
		var c = this.getPreviousSibling();
		return (c && c.slidePosition) || 0;
	},
	// before selected
	calcSlideBefore: function() {
		var m = this.calcSlideMin();
		if (this.manager.isAnimating() || this.manager.dragging) {
			var c = this.getNextSibling();
			if (this.hasNode() && c) {
				return Math.max(m, c.slidePosition);
			}
		}
		return m;
	},
	calcSlideSelected: function() {
		return this.calcSlideMin();
	},
	// after selected
	calcSlideAfter: function() {
		if (this.manager.isAnimating() || this.manager.dragging) {
			return this.calcSlideMax();
		} else {
			var s = this.manager.view;
			return s ? s.calcSlideMin() : 0;
		}
	},
	// movement
	// move this sliding and validate next.
	move: function(inSlide) {
		this.applySlideToNode(inSlide);
		// validate next sibling...
		var c = this.getNextSibling();
		if (c) {
			c.validateSlide();
		}
	},
	applySlideToNode: function(inSlide) {
		if (inSlide != this.slidePosition) {
			this.slidePosition = inSlide;
			if (this.hasNode()) {
				//this.log(this.id, inSlide);
				var t = inSlide !== null ? "translate3d(" + inSlide + "px,0,0)" : "";
				this.domStyles["-webkit-transform"] = this.node.style.webkitTransform = t;
			}
		}
	},
	// move to our calculated position
	validateSlide: function() {
		this.move(this.calcSlide());
	},
	// move all slidings to their calculated position
	validateAll: function() {
		// kick off vlidation from first sliding sibling...
		// all subsequent siblings will validate
		var s = this.getFirstSibling() || this;
		s.validateSlide();
		if (!this.manager.dragging) {
			enyo.asyncMethod(this, "resizeLastSibling");
		}
	},
	// animation
	canAnimate: function() {
		return (this.slidePosition != this.calcSlide());
	},
	// move this, then slide each previous and force before mode.
	animateMove: function(inSlide) {
		this.move(inSlide);
		var p = this.getPreviousSibling();
		while (p) {
			p.applySlideToNode(p.calcSlideBefore());
			p = p.getPreviousSibling();
		}
	},
	// dragging
	dragstartHandler: function(inSender, e) {
		e.sliding = this;
	},
	isDraggableEvent: function(inEvent) {
		var c = inEvent.dispatchTarget;
		return c && c.slidingHandler || this.dragAnywhere;
	},
	canDrag: function(inDelta) {
		this.dragMin = this.calcSlideMin();
		this.dragMax = this.calcSlideMax();
		//
		var i = this.index;
		var si = this.manager.view.index;
		//
		if (this.showing && i >= si) {
			var c = this.dragMax != this.dragMin && ((inDelta > 0 && this.slidePosition <= this.dragMax) ||
				(inDelta < 0 && this.slidePosition > this.dragMin));
			return c;
		}
	},
	isAtDragMax: function() {
		return this.slidePosition == this.dragMax;
	},
	isAtDragMin: function() {
		return this.slidePosition == this.dragMin;
	},
	isAtDragBoundary: function() {
		return this.isAtDragMax() || this.isAtDragMin();
	},
	beginDrag: function(e, inDx) {
		this.dragStart = this.slidePosition - inDx;
	},
	drag: function(e) {
		var x0 = e.dx + this.dragStart;
		var x = Math.max(this.dragMin, Math.min(x0, this.dragMax));
		this.shouldDragSelect = x0 < this.slidePosition;
		this.move(x);
		// // handle edge case, if we dragged to max or min, our drag is done
		if ((this.isAtDragMin() && this.shouldDragSelect) || (this.isAtDragMax() && !this.shouldDragSelect)) {
			return this.getDragSelect();
		}
	},
	dragFinish: function() {
		return this.getDragSelect();
	},
	getDragSelect: function() {
		return this.shouldDragSelect ? this : this.getPreviousSibling();
	},
	// sizing
	// don't auto-adjust width if fixedWidth is true
	fixedWidthChanged: function() {
		if (this.fixedWidth) {
			this.$.client.applyStyle("width", null);
		}
	},
	minWidthChanged: function() {
		this.$.client.applyStyle("min-width", this.minWidth || null);
	},
	// FIXME: refactor, pretty ugly way to force last sibling to resize
	resizeLastSibling: function() {
		if (!this.manager.dragging) {
			var f = this.getLastSibling();
			if (f && !f.fixedWidth) {
				var t = f.calcSlide();
				f.adjustWidth(t);
			}
		}
	},
	adjustWidth: function(inDelta) {
		// FIXME: attempting to make this smooth based on ipad performance
		// adjusting client as opposed to this node lessens artifacts 
		// generated when resizing our node. This appears to be due to 
		// our node being transformed.
		if (this.hasNode() && this.$.client.hasNode()) {
			var ow = this.node.offsetWidth;
			var w = Math.max(ow, ow - inDelta);
			if (w) {
				this.$.client.domStyles.width = this.$.client.node.style.width = w + "px";
				this.doResize();
			}
		}
	},
	clickHandler: function(inSender, inEvent) {
		if (inEvent.dispatchTarget.slidingHandler) {
			this.toggleSelected();
		}
		this.doClick(inEvent);
	},
	setShadowShowing: function(inShow) {
		this.$.shadow.setShowing(inShow);
	}
});