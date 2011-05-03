/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A popup is just floating elements embedded directly within the page context.
It can popup/open at a specified position, and has support for modality and click to dismiss/close.

	{kind: "Popup", components: [
		{content: "Hello World!"},
		{kind: "ListSelector", value: "Foo", items: ["Foo", "Bar", "Bot"]}
	]}

To open the popup at the center:

	openPopup: function() {
		this.$.popup.openAtCenter();
	}

If dismissWithClick is set to true (default) and modal is false (default), then clicking anywhere not inside the popup will dismiss/close the popup.
Also, you can close the popup programmatically by doing this:

	closePopup: function() {
		this.$.popup.close();
	}
*/
enyo.kind({
	name: "enyo.Popup",
	kind: enyo.BasicPopup,
	published: {
		/**
		Controls how the popup will be shown and hidden:
		
			auto: when open and close are called, the popup will be shown and hidden
			manual: will not be shown or hidden; use this mode when controlling popup via custom animation
			transition: will be shown when opened and hidden when a css transition completes; use this 
			mode when animating via css transitions
		*/
		showHideMode: "auto",
		//* Css class that will be applied when the popup is open
		openClassName: ""
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.openInfo = null;
		this.contentControlName = this.contentControlName || this.controlParentName;
	},
	destroy: function() {
		this.removeListeners();
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		this.addListeners();
	},
	addListeners: function() {
		if (this.hasNode()) {
			this.transitionEndListener = enyo.bind(this, "webkitTransitionEndHandler");
			this.node.addEventListener("webkitTransitionEnd", this.transitionEndListener, false);
		}
	},
	removeListeners: function() {
		if (this.hasNode()) {
			this.node.removeEventListener("webkitTransitionEnd", this.transitionEndListener, false);
		}
	},
	webkitTransitionEndHandler: function() {
		this.setShowing(this.isOpen);
	},
	afterOpen: function() {
		if (this.openClassName) {
			this.addClass(this.openClassName);
		}
		this.inherited(arguments);
	},
	prepareClose: function() {
		if (this.openClassName) {
			this.removeClass(this.openClassName);
		}
		this.openInfo = null;
		this.inherited(arguments);
		this.clearSizeCache();
	},
	renderOpen: function() {
		if (this.showHideMode != "manual") {
			this.show();
		}
	},
	renderClose: function() {
		if (this.showHideMode == "auto") {
			this.hide();
		}
	},
	resize: function() {
		var oi = this.openInfo;
		if (oi) {
			this.clearSizeCache();
			this[oi.method].apply(this, oi.args);
		}
	},
	resizeHandler: function() {
		this.resize();
		this.inherited(arguments);
	},
	//* @public
	/**
	Open at the location specified by a location relative to the viewport

	inRect {Object} rectangle specifying where to open the popup. May contain left, top or 
	right, bottom properties. If both are specified left,top is used.
	*/
	openAt: function(inRect) {
		this.setOpenInfo(arguments);
		this.applyPosition(inRect);
		this.applyClampedSize(inRect);
		this.open();
	},
	// track the method name and arguments used to open the popup.
	setOpenInfo: function(inArguments) {
		if (!this.openInfo) {
			var m = inArguments.callee.nom;
			m = m.split(".").pop().replace("()", "");
			var args = enyo.cloneArray(inArguments);
			this.openInfo = {method: m, args: args};
		}
	},
	/**
	Open at the location of a mouse event (inEvent). The popup's position is automatically constrained
	so that it does not display outside the viewport.
	
	inEvent {Object} Dom mouse event object at the position of which, popup will open

	inOffset {Object} Object which may contain left and top properties to specify an offset relative
	to the location the popup would otherwise be positioned.
	*/
	openAtEvent: function(inEvent, inOffset) {
		this.setOpenInfo(arguments);
		var p = {
			left: inEvent.centerX || inEvent.clientX || inEvent.pageX,
			top: inEvent.centerY || inEvent.clientY || inEvent.pageY
		};
		if (inOffset) {
			p.left += inOffset.left || 0;
			p.top += inOffset.top || 0;
		}
		p = this.clampPosition(enyo.mixin(p, this.calcSize()));
		this.openAt(p);
	},
	/**
	Open at the location of the specified control. If there is space, the popup's top, left corner 
	will be displayed at the top, left position of the control.
	Otherwise, the popup's bottom, right will be displayed at the bottom, right of the control.

	inControl {Control} Control at whose location popup will open.

	inOffset {Object} Object which may contain left and top properties to specify an offset relative
	to the location the popup would otherwise be positioned.
	*/
	openAtControl: function(inControl, inOffset) {
		this.setOpenInfo(arguments);
		var o = enyo.mixin({width: 0, height: 0, top: 0, left: 0}, inOffset);
		var co = inControl.getOffset();
		o.top += co.top;
		o.left += co.left;
		var n = inControl.hasNode();
		if (n) {
			o.width += n.offsetWidth;
			o.height += n.offsetHeight;
		}
		this.openNear(o);
	},
	/**
	Open at the bottom, right of the specified control.
	*/
	// FIXME: incomplete, what spots should be acceptable?
	openAroundControl: function(inControl) {
		this.setOpenInfo(arguments);
		// we position to the bottom right of the node.
		var co = inControl.getOffset();
		var o = {};
		var n = inControl.hasNode();
		var w, h;
		if (n) {
			h = n.offsetHeight;
			w = n.offsetWidth;
		}
		var vp = this.calcViewport();
		o.top = co.top + h;
		// need to specify right, not left so that width can be naturally determined.
		o.right = vp.width - (co.left + w);
		o.width = w;
		o.height = h;
		this.openNear(o, true);
	},
	// inDimensions can have {top, left, right, bottom, width, height}
	//
	openNear: function(inDimensions, inAround) {
		this.setOpenInfo(arguments);
		var d = inDimensions;
		var o = enyo.clone(d);
		o.width = null;
		o.height = null;
		var s = this.calcSize();
		var vp = this.calcViewport();
		// if placing at top would push off screen and top is more than halfway
		// then position using bottom
		if ((d.top + s.height > vp.height) && (d.top > vp.height/2)) {
			var oh = d.height || 0;
			oh = inAround ? -oh : oh;
			o.bottom = vp.height - (d.top + oh);
			delete o.top;
		}
		// if placing at left would push off screen and left is more than halfway
		// then position using right
		if ((d.left + s.width > vp.width) && (d.left > vp.width/2)) {
			o.right = vp.width - (d.left - (d.width || 0));
			delete o.left;
		}
		this.openAt(o);
	},
	/**
	Open in the center of the viewport
	*/
	openAtCenter: function() {
		this.setOpenInfo(arguments);
		this.openAt(this.calcCenterPosition());
	},
	//* @protected
	calcCenterPosition: function() {
		var s = this.calcSize();
		var vp = this.calcViewport();
		var o = {
			left: Math.max(0, (vp.width - s.width) / 2),
			top: Math.max(0, (vp.height - s.height) / 2)
		};
		return o;
	},
	// size and position
	getContentControl: function() {
		return this.$[this.contentControlName] || this;
	},
	applyMaxSize: function(inRect) {
		var s = this.getContentControl();
		s.applyStyle("max-width", inRect.width + "px");
		s.applyStyle("max-height", inRect.height + "px");
	},
	// return max user set size. ignore sizes that have been clamped.
	getMaxSize: function() {
		var ds = this.getContentControl().domStyles;
		var mh = !this._clampedHeight && parseInt(ds["max-height"]);
		var mw = !this._clampedWidth && parseInt(ds["max-width"]);
		var max = 1e9;
		return {height: mh || max, width: mw || max};
	},
	showingChanged: function() {
		this.inherited(arguments);
		if (!this.showing) {
			this.clearClampedSize();
		}
	},
	// we want to user specified max dimensions to win over clamped ones, if possible
	// track if we have clamped height or width
	applyClampedSize: function(inRect) {
		var max = this.clampSize(inRect);
		var specMax = this.getMaxSize();
		if (max.width < specMax.width) {
			this._clampedWidth = true;
			specMax.width = max.width;
		}
		if (max.height < specMax.height) {
			this._clampedHeight = true;
			specMax.height = max.height;
		}
		this.applyMaxSize(specMax);
	},
	// clear a size that was clamped.
	clearClampedSize: function() {
		var s = this.getContentControl();
		var ms = this.getMaxSize();
		if (this._clampedWidth) {
			s.applyStyle("max-width", null);
		}
		if (this._clampedHeight) {
			s.applyStyle("max-height", null);
		}
		this._clampedHeight = this._clampedWidth = false;
	},
	/**
	Position, relative to the viewport, at the location specified by inRect.
	inRect may contain top, left or right, bottom coordinates. 
	If both are specified, top, left is preferred.
	*/
	applyPosition: function(inRect) {
		var r = inRect;
		if (r.left !== undefined) {
			this.applyStyle("left", r.left + "px");
			this.applyStyle("right", "auto");
		} else if (r.right !== undefined) {
			this.applyStyle("right", r.right + "px");
			this.applyStyle("left", "auto");
		}
		if (r.top !== undefined) {
			this.applyStyle("top", r.top + "px");
			this.applyStyle("bottom", "auto");
		} else if (r.bottom !== undefined) {
			this.applyStyle("bottom", r.bottom + "px");
			this.applyStyle("top", "auto");
		}
	},
	// returns a position which ensures popup with inRect.width, inRect.height will not overflow viewport
	clampPosition: function(inRect) {
		var p = {}, r=inRect;
		var vp = this.calcViewport();
		if (r.right) {
			p.right = Math.max(0, Math.min(vp.width - r.width, r.right));
		} else {
			p.left =  Math.max(0, Math.min(vp.width - r.width, r.left));
		}
		if (r.bottom) {
			p.bottom = Math.max(0, Math.min(vp.height - r.height, r.bottom));
		} else {
			p.top = Math.max(0, Math.min(vp.height - r.height, r.top));
		}
		return p;
	},
	// returns a size which ensures popup at inPosition will not overflow viewport
	clampSize: function(inDimensions) {
		var d = inDimensions || {};
		var vp = this.calcViewport();
		var s = {
			width: vp.width - (d.left || d.right || 0),
			height: vp.height - (d.top || d.bottom || 0)
		};
		if (d.width) {
			s.width = Math.min(d.width, s.width);
		}
		if (d.height) {
			s.height = Math.min(d.height, s.height);
		}
		//
		// FIXME: use enyo.dom helper
		// adjust by the popup's pad/border
		var ns = this.calcSize();
		// FIXME: only reduce height if sizeNode is not this
		if (this.getContentControl() != this) {
			s.height -= ns.offsetHeight - ns.clientHeight;
			s.width -= ns.offsetWidth - ns.clientWidth;
		}
		return s;
	},
	// measure the size of the viewport.
	calcViewport: function() {
		// memoize
		if (this._viewport) {
			return this._viewport;
		} else {
			var vp;
			if (this.parent && this.parent.hasNode()) {
				vp = enyo.getVisibleControlBounds(this.parent);
			} else {
				vp = enyo.getVisibleBounds();
			}
			return this._viewport = vp;
		}
	},
	// measure the size of the popup.
	calcSize: function() {
		if (!this.generated) {
			this.render();
		}
		// memoize
		if (this._size) {
			return this._size;
		} else if (this.hasNode()) {
			var s = {h: 0, w: 0};
			// briefly show node so we can measure it.
			var hidden = this.node.style.display == "none";
			if (hidden) {
				this.node.style.display = "block";
			}
			// FIXME: measure border (equivalent to enyo.dom.fetchBorderExtents?)
			s.height = s.offsetHeight = this.node.offsetHeight;
			s.width = s.offsetWidth = this.node.offsetWidth;
			s.clientHeight = this.node.clientHeight;
			s.clientWidth = this.node.clientWidth;
			if (hidden) {
				this.node.style.display = "none";
			}
			return (this._size = s);
		}
	},
	clearSizeCache: function() {
		this._viewport = null;
		this._size = null;
	}
});