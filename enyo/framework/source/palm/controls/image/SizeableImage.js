/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
// FIXME: needs a home; utility function to grab the size of a control
// if the control is hidden, the size is determined by finding the first
// parent that has a size; fallback to window dimensions
enyo.fetchControlSize = function(inControl) {
	var n = inControl.hasNode();
	var p = n && n.parentNode;
	var b;
	while (p) {
		if (p.clientWidth && p.clientHeight) {
			b = {w: p.clientWidth, h: p.clientHeight};
			break;
		} else {
			p = p.parentNode;
		}
	}
	b = b || {w: window.innerWidth, h: window.innerHeight};
	return b;
};

//* @public
/**
A control designed to view an image, with support for zooming. It is meant to be placed inside a <a href="#enyo.Scroller">Scroller</a>.

	{kind: "Scroller", components: [
		{kind: "SizeableImage", src: "images/tree.jpg"}
	]}
	
The zoom level can be changed with setZoom.
*/
enyo.kind({
	name: "enyo.SizeableImage",
	kind: enyo.VFlexBox,
	align: "center",
	pack: "center",
	//* @protected
	mixins: [
		enyo.sizeableMixin
	],
	//* @public
	published: {
		src: "",
		zoom: 1,
		autoSize: true,
		maxZoomRatio: 2
	},
	maxZoom: 2,
	disableZoom: false,
	events: {
		onImageLoaded: ""
	},
	chrome: [
		{name: "animator", kind: "Animator", onAnimate: "stepAnimation", onEnd: "endAnimation"},
		{name: "image", kind: "Image"}
	],
	//* @protected
	create: function() {
		// offscreen image, primarily so the AR information is unadulterated
		this.bufferImage = new Image();
		this.bufferImage.onload = enyo.hitch(this, "imageLoaded");
		this.bufferImage.onerror = enyo.hitch(this, "imageError");
		this.inherited(arguments);
		// setup
		this.srcChanged();
	},
	rendered: function() {
		this.inherited(arguments);
		if (this.loadPendingRender) {
			this.imageLoaded();
			this.loadPendingRender = null;
		}
	},
	srcChanged: function() {
		if (this.src && this.bufferImage.src == this.src) {
			this.imageLoaded();
		} else if (this.src) {
			// show blank during loading
			this.$.image.setSrc("$base-themes-default-theme/images/blank.gif");
			this.bufferImage.src = this.src;
		}
	},
	imageLoaded: function(e) {
		if (!this.hasNode()) {
			this.loadPendingRender = true;
		} else if (!this.destroyed) {
			this.$.image.setSrc(this.bufferImage.src);
			this.adjustSize();
			this.doImageLoaded();
		}
	},
	imageError: function(e) {
		this.log(e);
	},
	maxZoomRatioChanged: function() {
		this.maxZoom = this.minZoom * this.maxZoomRatio;
	},
	getMaxZoom: function() {
		return this.maxZoom;
	},
	getMinZoom: function() {
		return this.minZoom;
	},
	adjustSize: function() {
		var w = this._imageWidth = this.bufferImage.width;
		var h = this._imageHeight = this.bufferImage.height;
		var b = this._boxSize = enyo.fetchControlSize(this);
		//
		if (this.autoSize) {
			var ar = w / h;
			var n = this.node;
			w = b.w;
			h = b.h;
			if (h * ar > w) {
				h = w / ar;
			} else {
				w = h * ar;
			}
		}
		//
		this.minZoom = w / this._imageWidth;
		this.maxZoomRatioChanged();
		this.setZoom(this.minZoom);
	},
	zoomChanged: function() {
		this.zoom = Math.max(this.minZoom, Math.min(this.zoom, this.maxZoom));
		if (!this._imageWidth || !this._imageHeight) {
			return;
		}
		var w = this.zoom * this._imageWidth;
		var h = this.zoom * this._imageHeight;
		if (w && h) {
			this.sizeImage(w, h);
		}
	},
	sizeImage: function(inWidth, inHeight) {
		//this.log(inWidth, inHeight);
		this.$.image.applyStyle("width", inWidth + "px");
		this.$.image.applyStyle("height", inHeight + "px");
	},
	isZoomIn: function() {
		return Math.round((this.zoom-this.minZoom)*100)/100 != 0;
	},
	updateZoomPosition: function(inZPos) {
		this.setZoom(inZPos.zoom);
		var s = this.findScroller(), bs = {};
		if (s) {
			bs = s.getBoundaries();
		}
		var x = inZPos.x > bs.left ? (inZPos.x < bs.right ? inZPos.x : bs.right) : bs.left;
		var y = inZPos.y > bs.top ? (inZPos.y < bs.bottom ? inZPos.y : bs.bottom) : bs.bottom;
		this.setScrollPositionDirect(x, y);
		return {x: x, y: y};
	},
	gesturestartHandler: function(inSender, e) {
		if (!this.disableZoom) {
			this.centeredZoomStart(e);
			//this.log(enyo.json.stringify(this._zoomStart));
		}
	},
	gesturechangeHandler: function(inSender, e) {
		if (!this.disableZoom) {
			// stop event to prevent scrolling
			enyo.stopEvent(e);
			var gi = this.centeredZoomChange(e);
			this.updateZoomPosition(gi);
			//this.log(gi.zoom, gi.x, gi.y);
		}
	},
	gestureendHandler: function(inSender, e) {
		if (!this.disableZoom) {
			enyo.stopEvent(e);
			var p = this.fetchScrollPosition();
			this.setScrollPosition(p.l, p.t);
		}
	},
	clickHandler: function(inSender, e) {
		if (!this._clickMode) {
			this._clickMode = -1;
			this._clickJob = setTimeout(enyo.hitch(this, function() {
				this._clickMode = 1;
				enyo.dispatch(e);
			}), 300);
			return true;
		} else {
			var r = this._clickMode != 1;
			this._clickMode = 0;
			return r;
		}
	},
	dblclickHandler: function(inSender, e) {
		if (this._clickJob && this._clickMode != -1) {
			this._clickMode = 0;
			clearTimeout(this._clickJob);
			this._clickJob = null;
			this.smartZoom(e);
			return;
		}
		return true;
	},
	smartZoom: function(e) {
		if (this.disableZoom) {
			return;
		}
		var cx = e.clientX, cy = e.clientY;
		// FIXME: generate a fake gesture event for use in zoom calculations
		this.centeredZoomStart({
			scale: 1,
			centerX: cx,
			centerY: cy
		});
		this.fromZoom = this.zoom;
		this.toZoom = Math.abs(this.zoom-this.maxZoom) > 0.1 ? this.maxZoom : this.minZoom;
		this.$.animator.play(1, this.toZoom / this.fromZoom);
	},
	stepAnimation: function(inSender, inValue, inProgress) {
		// FIXME: this is an experiment to use the gesture code to smartzoom
		var gi = this.centeredZoomChange({
			scale: inValue
		});
		var pos = this.updateZoomPosition(gi);
		this.setScrollPosition(pos.x, pos.y);
	}
});

enyo.kind({
	name: "enyo.SizeableCanvas",
	kind: enyo.SizeableImage,
	chrome: [
		{name: "animator", kind: "Animator", onAnimate: "stepAnimation", onEnd: "endAnimation"},
		{name: "image", nodeTag: "canvas"}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		// FIXME: factor so we don't need this
		this.$.image.setSrc = enyo.nop;
	},
	fetchContext: function() {
		var n = this.$.image.hasNode();
		return n && n.getContext('2d');
	},
	clearImage: function() {
		var c = this.fetchContext();
		if (c && this._zoomedWidth && this._zoomedHeight) {
			c.clearRect(0, 0, this._zoomedWidth, this._zoomedHeight);
		}
	},
	sizeImage: function(inWidth, inHeight) {
		this.clearImage();
		this._zoomedWidth = inWidth; 
		this._zoomedHeight = inHeight;
		var c = this.fetchContext();
		if (c) {
			this.$.image.setAttribute("width", inWidth);
			this.$.image.setAttribute("height", inHeight);
			c.drawImage(this.bufferImage, 0, 0, inWidth, inHeight);
		}
	}
});
