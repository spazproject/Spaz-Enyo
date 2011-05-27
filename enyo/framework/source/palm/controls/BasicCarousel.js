/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that provides the ability to slide back and forth between different views.
If you have many views in the carousel, use <a href="#enyo.Carousel">Carousel</a>.

	{kind: "BasicCarousel", flex: 1, components: [
		{kind: "View1"},
		{kind: "View2"},
		{kind: "View3"}
	]}

The default orientation of BasicCarousel is horizontal.  You can change to vertical by setting <code>layoutKind</code> to "VFlexLayout".

	{kind: "BasicCarousel", layoutKind: "VFlexLayout", flex: 1, components: [
		{kind: "View1"},
		{kind: "View2"},
		{kind: "View3"}
	]}
*/
enyo.kind({
	name: "enyo.BasicCarousel",
	kind: enyo.SnapScroller,
	published: {
		views: [],
		dragSnapThreshold: 0.01
	},
	//
	chrome: [
		{name: "client", kind: "Control"/*, style: "position: absolute;"*/}
	],
	//* @protected
	create: function(inProps) {
		var components = [];
		if (inProps) {
			components = inProps.components;
			delete inProps.components;
		}
		components = components || this.kindComponents || [];
		this.inherited(arguments);
		this.$.scroll.kFrictionDamping = 0.75;
		this.$.scroll.kSpringDamping = 0.8;
		this.$.scroll.kFrictionEpsilon = 0.1;
		this.views = this.views.length ? this.views : components;
		this.viewsChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		this.resize();
		this.dragSnapThresholdChanged();
	},
	layoutKindChanged: function() {
		this.inherited(arguments);
		this.setVertical(!this.scrollH);
		this.setHorizontal(this.scrollH);
		//this.$.client.applyStyle(this.scrollH ? "height" : "width", "100%");
	},
	dragSnapThresholdChanged: function() {
		this.dragSnapWidth = (this.scrollH ? this._controlSize.w : this._controlSize.h) * this.dragSnapThreshold;
	},
	dragstartHandler: function() {
		if (this.snapping || this.dragging) {
			return this.preventDragPropagation;
		}
		return this.inherited(arguments);
	},
	flickHandler: function(inSender, e) {
		if (this.snapping) {
			return this.preventDragPropagation;
		}
		return this.inherited(arguments);
	},
	viewsChanged: function() {
		this.destroyControls();
		this.createViews(this.views);
		if (this.generated) {
			this.render();
		}
	},
	createViews: function(inViews) {
		for (var i=0, v; v=inViews[i]; i++) {
			this.createView(this, v);
		}
	},
	createView: function(inManger, inInfo, inMoreInfo) {
		var info = enyo.mixin(this.constructViewInfo(inInfo), inMoreInfo);
		var c = inManger.createComponent(info);
		enyo.call(c, "setOuterScroller", [this]);
		return c;
	},
	constructViewInfo: function(inInfo) {
		return enyo.isString(inInfo) ? {src: inInfo} : inInfo;
	},
	//* @public
	/**
	 Adds additional views to the carousel.
	 @param {Object} inViews
	 */
	addViews: function(inViews) {
		this.views = this.views.concat(inViews);
		this.createViews(inViews);
		this.contentChanged();
	},
	/**
	 Event handler for resize; if we're the root component, we'll automatically resize.
	 */
	resizeHandler: function() {
		this.resize();
		this.inherited(arguments);
		this.stop();
	},
	/**
	 Handles size changes.  This method can be hooked up to a resizeHandler.
	 */
	resize: function() {
		this.sizeControls("100%", "100%");
		// FIXME: need to find a better way to obtain the size.
		this._controlSize = enyo.fetchControlSize(this);
		this._controlSize[this.scrollH ? "w" : "h"] = this._controlSize[this.scrollH ? "w" : "h"] - 2*this.revealAmount;
		//this.sizeControls(this.scrollH && this._controlSize.w+"px", !this.scrollH && this._controlSize.h+"px");
		this.sizeControls(this._controlSize.w+"px", this._controlSize.h+"px", true);
		this.setIndex(this.index);
	},
	//* @protected
	sizeControls: function(inWidth, inHeight, inReset) {
		for (var i=0, c$=this.getControls(), c; c=c$[i]; i++) {
			inWidth && c.applyStyle("width", inWidth);
			inHeight && c.applyStyle("height", inHeight);
			inReset && this.resetView(i);
		}
	},
	calcPos: function(inIndex) {
		if (!this.getControls()[inIndex]) {
			return;
		}
		var pos = 0, s = this._controlSize[this.scrollH ? "w" : "h"];
		for (var i=0, c$=this.getControls(), c; (i<inIndex) && (c=c$[i]); i++) {
			if (c.showing) {
				pos += s;
			}
		}
		return pos;
	},
	snapFinish: function() {
		this.resetView(this.oldIndex);
		this.inherited(arguments);
	},
	snapTo: function(inIndex) {
		this.inherited(arguments);
		// make sure the center item is reset
		if (this.index != this.oldIndex) {
			this.resetView(this.index);
		}
	},
	findView: function(inControl) {
		return inControl;
	},
	applyToView: function(inControl, inMethod, inArgs) {
		var v = inControl[inMethod] ? inControl : this.findView(inControl);
		enyo.call(v, inMethod, inArgs);
	},
	resetView: function(inIndex) {
		var c = this.getControls()[inIndex];
		if (c) {
			this.applyToView(c, "reset", []);
		}
	}
});
