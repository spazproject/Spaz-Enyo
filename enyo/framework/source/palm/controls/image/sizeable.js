/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
// note: we assume minZoom, maxZoom and calcZoomOffset are defined
enyo.sizeableMixin = {
	zoom: 1,
	calcClientOffset: function() {
		var n = this.hasNode();
		if (n) {
			return n.getBoundingClientRect();
		}
	},
	centeredZoomStart: function(e) {
		var o = this.calcClientOffset();
		var zo = this.calcZoomOffset();
		var s = this.fetchScrollPosition();
		this._zoomStart = {
			scale: e.scale,
			centerX: e.centerX - (o.left + zo.left),
			centerY: e.centerY - (o.top + zo.top),
			scrollX: s.l,
			scrollY: s.t,
			offsetLeft: o.left + zo.left,
			offsetTop: o.top + zo.top,
			zoffsetLeft: zo.left,
			zoffsetTop: zo.top,
			zoom: this.zoom
		};
	},
	centeredZoomChange: function(e) {
		var gs = this._zoomStart;
		e.scale = e.scale || gs.scale;
		var centerX = (e.centerX - gs.offsetLeft) || gs.centerX;
		var centerY = (e.centerY - gs.offsetTop) || gs.centerY;
		// round to two decimal places to reduce jitter
		var ds = Math.round(e.scale * 100) / 100;
		// note: zoom by the initial gesture zoom multiplied by scale;
		// this ensures we zoom enough to not be annoying.
		var z = gs.zoom * ds;
		// if scales beyond max zoom, disallow scaling so we simply pan
		// and set scale to total amount we have scaled since start
		if (z > this.getMaxZoom()) {
			ds = this.getMaxZoom() / gs.zoom;
		}
		// adjust for scales beyond min zoom
		if (z < this.getMinZoom()) {
			ds = this.getMinZoom() / gs.zoom;
		}
		// this is the offset after scaling
		var x = (ds - 1) * (gs.centerX - gs.zoffsetLeft);
		// add the scaled scroll offset
		x += ds * gs.scrollX;
		// now account for the moving center
		x += ds * (gs.centerX - centerX);
		// this is the offset after scaling
		var y = (ds - 1) * (gs.centerY - gs.zoffsetTop);
		// add the scaled scroll offset
		y += ds * gs.scrollY;
		// now account for the moving center
		y += ds * (gs.centerY - centerY)
		return {zoom: z, x: x, y: y};
	},
	resetZoom: function() {
		// reset zoom to its original value.
		this.setZoom(this.getMinZoom());
	},
	findScroller: function() {
		if (this._scroller) {
			return this._scroller;
		}
		var n = this.hasNode(), c;
		while (n) {
			c = enyo.$[n.id];
			if (c && c instanceof enyo.BasicScroller) {
				return (this._scroller = c);
			}
			n = n.parentNode;
		}
	},
	fetchScrollPosition: function() {
		var p = {t: 0, l: 0};
		var s = this.findScroller();
		if (s) {
			p.l = s.getScrollLeft();
			p.t = s.getScrollTop();
		}
		return p;
	},
	setScrollPosition: function(inX, inY) {
		var s = this.findScroller();
		if (s) {
			s.setScrollTop(inY);
			s.setScrollLeft(inX);
		}
	},
	setScrollPositionDirect: function(inX, inY) {
		var s = this.findScroller();
		if (s) {
			s.setScrollPositionDirect(inX, inY);
		}
	}
};
