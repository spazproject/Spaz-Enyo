/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
enyo.ScrollStrategy implements scrolling dynamics simulation. It is a helper kind used
by other scroller kinds.

enyo.ScrollStrategy is not typically created in application code.
*/
enyo.kind({
	name: "enyo.ScrollStrategy",
	kind: enyo.Component,
	published: {
		vertical: true,
		horizontal: true
	},
	events: {
		onScrollStart: "scrollStart",
		onScroll: "scroll",
		onScrollStop: "scrollStop"
	},
	//* 'spring' damping returns the scroll position to a value inside the boundaries (lower provides FASTER snapback)
	kSpringDamping: 0.93,
	//* 'drag' damping resists dragging the scroll position beyond the boundaries (lower provides MORE resistance)
	kDragDamping: 0.5,
	//* 'friction' damping reduces momentum over time (lower provides MORE friction)
	kFrictionDamping: 0.97,
	//* Additional 'friction' damping applied when momentum carries the viewport into overscroll (lower provides MORE friction)
	kSnapFriction: 0.9,
	//* Scalar applied to 'flick' event velocity
	kFlickScalar: 0.01,
	//* the value used in friction() to determine if the deta (e.g. y - y0) is close enough to zero to consider as zero.
	kFrictionEpsilon: 1e-2,
	//* top snap boundary, generally 0
	topBoundary: 0,
	//* right snap boundary, generally (viewport width - content width)
	rightBoundary: 0,
	//* bottom snap boundary, generally (viewport height - content height)
	bottomBoundary: 0,
	//* left snap boundary, generally 0
	leftBoundary: 0,
	//* animation time step
	interval: 20,
	//* flag to enable frame-based animation, otherwise use time-based animation
	fixedTime: true,
	//* @protected
	// simulation state
	x0: 0,
	x: 0,
	y0: 0,
	y: 0,
	destroy: function() {
		this.stop();
		this.inherited(arguments);
	},
	/**
		Simple Verlet integrator for simulating Newtonian motion.
	*/
	verlet: function(p) {
		var x = this.x;
		this.x += x - this.x0;
		this.x0 = x;
		//
		var y = this.y;
		this.y += y - this.y0;
		this.y0 = y;
	},
	/**
		Boundary damping function.
		Return damped 'value' based on 'coeff' on one side of 'origin'.
	*/
	damping: function(value, origin, coeff, sign) {
		var kEpsilon = 0.5;
		//
		// this is basically just value *= coeff (generally, coeff < 1)
		//
		// 'sign' and the conditional is to force the damping to only occur 
		// on one side of the origin.
		//
		// Force close to zero to be zero
		if (Math.abs(value-origin) < kEpsilon) {
			return origin;
		}
		return value*sign > origin*sign ? coeff * (value-origin) + origin : value;
	},
	/**
		Dual-boundary damping function.
		Return damped 'value' based on 'coeff' when exceeding either boundary.
	*/
	boundaryDamping: function(value, aBoundary, bBoundary, coeff) {
		return this.damping(this.damping(value, aBoundary, coeff, 1), bBoundary, coeff, -1);
	},
	/**
		Simulation constraints (spring damping occurs here)
	*/
	constrain: function() {
		var y = this.boundaryDamping(this.y, this.topBoundary, this.bottomBoundary, this.kSpringDamping);
		if (y != this.y) {
			// ensure snapping introduces no velocity, add additional friction
			this.y0 = y - (this.y - this.y0) * this.kSnapFriction;
			this.y = y;
		}
		var x = this.boundaryDamping(this.x, this.leftBoundary, this.rightBoundary, this.kSpringDamping);
		if (x != this.x) {
			this.x0 = x - (this.x - this.x0) * this.kSnapFriction;
			this.x = x;
		}
	},
	/**
		The friction function
	*/
	friction: function(inEx, inEx0, inCoeff) {
		// implicit velocity
		var dp = this[inEx] - this[inEx0];
		// let close-to-zero collapse to zero (smaller than epsilon is considered zero)
		var c = Math.abs(dp) > this.kFrictionEpsilon ? inCoeff : 0;
		// reposition using damped velocity
		this[inEx] = this[inEx0] + c * dp;
	},
	// one unit of time for simulation
	frame: 10,
	// piece-wise constraint simulation
	simulate: function(t) {
		while (t >= this.frame) {
			t -= this.frame;
			if (!this.dragging) {
				this.constrain();
			}
			this.verlet();
			this.friction('y', 'y0', this.kFrictionDamping);
			this.friction('x', 'x0', this.kFrictionDamping);
		}
		return t;
	},
	animate: function() {
		this.stop();
		// time tracking
		var t0 = new Date().getTime(), t = 0;
		// delta tracking
		var x0, y0;
		// animation handler
		var fn = enyo.bind(this, function() {
			// wall-clock time
			var t1 = new Date().getTime();
			// schedule next frame
			this.job = enyo.requestAnimationFrame(fn);
			// delta from last wall clock time
			var dt = t1 - t0;
			// record the time for next delta
			t0 = t1;
			// user drags override animation 
			if (this.dragging) {
				this.y0 = this.y = this.uy;
				this.x0 = this.x = this.ux;
			}
			// frame-time accumulator
			t += dt;
			// alternate fixed-time step strategy:
			if (this.fixedTime && !this.isInOverScroll()) {
				t = this.interval;
			}
			// consume some t in simulation
			t = this.simulate(t);
			// scroll if we have moved, otherwise the animation is stalled and we can stop
			if (y0 != this.y || x0 != this.x) {
				this.scroll();
			} else if (!this.dragging) {
				this.stop(true);
				this.scroll();
			}
			y0 = this.y;
			x0 = this.x;
		});
		this.job = enyo.requestAnimationFrame(fn);
	},
	//* @public
	start: function() {
		//this.log(this.job);
		if (!this.job) {
			this.animate();
			this.doScrollStart();
		}
	},
	//* @protected
	stop: function(inFireEvent) {
		this.job = enyo.cancelRequestAnimationFrame(this.job);
		inFireEvent && this.doScrollStop();
	},
	startDrag: function(e) {
		this.dragging = true;
		//
		this.my = e.pageY;
		this.py = this.uy = this.y;
		//
		this.mx = e.pageX;
		this.px = this.ux = this.x;
	},
	drag: function(e) {
		if (this.dragging) {
			var dy = this.vertical ? e.pageY - this.my : 0;
			this.uy = dy + this.py;
			// provides resistance against dragging into overscroll
			this.uy = this.boundaryDamping(this.uy, this.topBoundary, this.bottomBoundary, this.kDragDamping);
			//
			var dx = this.horizontal ? e.pageX - this.mx : 0;
			this.ux = dx + this.px;
			// provides resistance against dragging into overscroll
			this.ux = this.boundaryDamping(this.ux, this.leftBoundary, this.rightBoundary, this.kDragDamping);
			//
			this.start();
			return true;
		}
	},
	dragDrop: function(e) {
		if (this.dragging && !window.PalmSystem) {
			var kSimulatedFlickScalar = 0.5;
			this.y = this.uy;
			this.y0 = this.y - (this.y - this.y0) * kSimulatedFlickScalar;
			this.x = this.ux;
			this.x0 = this.x - (this.x - this.x0) * kSimulatedFlickScalar;
		}
		this.dragging = false;
	},
	dragFinish: function() {
		this.dragging = false;
	},
	flick: function(e) {
		if (this.vertical) {
			this.y = this.y0 + e.yVel * this.kFlickScalar;
		}
		if (this.horizontal) {
			this.x = this.x0 + e.xVel * this.kFlickScalar;
		}
		this.start();
	},
	scroll: function() {
		this.doScroll();
	},
	setScrollPosition: function(inPosition) {
		this.y = this.y0 = inPosition;
	},
	isScrolling: function() {
		return this.job;
	},
	isInOverScroll: function() {
		return this.job && (this.x > this.leftBoundary || this.x < this.rightBoundary || this.y > this.topBoundary || this.y < this.bottomBoundary);
	}
});
