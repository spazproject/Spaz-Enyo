/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Drag",
	kind: enyo.Component,
	events: {
		onDrag: "drag",
		onDrop: "dragDrop",
		onFinish: "dragFinish"
	},
	//* @protected
	mode: 0,
	constructor: function() {
		this.dispatcher = enyo.dispatcher;
	},
	//* @public
	start: function(e) {
		this.dispatcher.capture(this);
		this.dragging = true;
		if (e) {
			this.starting = true;
			this.track(e);
		}
	},
	//* @protected
	track: function(e) {
		// tracking the mouse point (in page frame)
		this.px = e.pageX;
		this.py = e.pageY;
		// initialize if necessary
		if (this.starting) {
			this.px0 = this.px;
			this.py0 = this.py;
			this.starting = false;
		}
		// tracking the mouse movement (frameless)
		this.dx = this.dpx = this.px - this.px0;
		this.dy = this.dpy = this.py - this.py0;
	},
	mousemoveHandler: function(inSender, e) {
		this.track(e);
		this.drag(e);
		return true;
	},
	mouseupHandler: function(inSender, e) {
		this.drop(e);
		this.finish();
		return true;
	},
	drag: function(e) {
		this.doDrag(e);
	},
	drop: function(e) {
		this.doDrop(e);
	},
	finish: function() {
		this.dragging = false;
		this.dispatcher.release(this);
		this.dispatcher.squelchNextClick();
		this.doFinish();
	}
});
