/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.kind({
	name: "enyo.Animation",
	duration: 350,
	tick: 10,
	start: 0,
	end: 100,
	repeat: 0,
	easingFunc: enyo.easing.linear,
	constructed: function(inProps) {
		enyo.mixin(this, inProps);
		this._stepFunction = enyo.bind(this, "stepFunction");
		this._animate = enyo.bind(this, "animate");
	},
	play: function() {
		this.easingFunc = this.easingFunc || enyo.easing.linear;
		this.repeated = 0;
		this.value = this.start;
		if (this.animating) {
			this.stop();
		}
		enyo.call(this, "onBegin", [this.start, this.end]);
		this.t0 = this.t1 = Date.now();
		// FIXME: we have places assuming animation starts synchronously
		//this.requestFrame();
		this.animating = true;
		this.animate();
		return this;
	},
	requestFrame: function() {
		this.animating = enyo.requestAnimationFrame(this._animate, this.node);
	},
	cancelFrame: function() {
		this.animating = enyo.cancelRequestAnimationFrame(this.animating);
	},
	stepFunction: function(inValue) {
		return this.easingFunc(inValue, this);
	},
	stop: function() {
		if (this.animating) {
			this.cancelFrame();
			enyo.call(this, "onStop", [this.value, this.start, this.end]);
			return this;
		}
	},
	animate: function() {
		if (!this.animating) {
			// We're already stopped, so return immediately.  This is necessary 
			// because enyo.cancelRequestAnimationFrame() appears to be broken
			// (not enyo's fault, I tried directly using both clearInterval() 
			// and webkitCancelRequestAnimationFrame(), and neither work.
			return;
		}
		var n = Date.now();
		this.dt = n - this.t1;
		this.t1 = n;
		var needsEnd = this.shouldEnd();
		if (needsEnd && this.shouldLoop()) {
			this.loop();
			needsEnd = false;
		}
		// time independent
		var p = enyo.easedLerp(this.t0, this.duration, this._stepFunction);
		this.value = this.start + p * (this.end - this.start);
		if (needsEnd) {
			enyo.call(this, "onAnimate", [this.end, 1]);
			this.stop();
			enyo.call(this, "onEnd", [this.end]);
		} else {
			enyo.call(this, "onAnimate", [this.value, p]);
			this.requestFrame();
		}
	},
	shouldEnd: function() {
		return (this.t1 - this.t0 >= this.duration);
	},
	shouldLoop: function() {
		return (this.repeat < 0) || (this.repeated < this.repeat);
	},
	loop: function() {
		this.t0 = this.t1 = Date.now();
		this.repeated++;
	}
});

//* @public
// This component just runs one animation at a time and exists
// mainly for the ease of setting events.
enyo.kind({
	name: "enyo.Animator",
	kind: enyo.Component,
	published: {
		duration: 350,
		tick: 10,
		repeat: 0,
		easingFunc: enyo.easing.cubicOut
	},
	events: {
		onBegin: "",
		onAnimate: "",
		onStop: "",
		onEnd: ""
	},
	destroy: function() {
		this.stop();
		this.inherited(arguments);
	},
	//* @public
	play: function(inStart, inEnd) {
		this.stop();
		this._animation = new enyo.Animation({
			duration: this.duration,
			tick: this.tick,
			repeat: this.repeat,
			easingFunc: this.easingFunc,
			start: inStart,
			end: inEnd,
			node: this.node,
			onBegin: enyo.bind(this, "doBegin"),
			onAnimate: enyo.bind(this, "doAnimate"),
			onStop: enyo.bind(this, "doStop"),
			onEnd: enyo.bind(this, "doEnd")
		});
		this._animation.play();
	},
	stop: function() {
		if (this._animation) {
			this._animation.stop();
			this._animation = null;
		}
	},
	// a node which must be visible for the animation to run
	setNode: function(inNode) {
		this.node = inNode;
		if (this._animation) {
			this._animation.node = inNode;
		}
	},
	isAnimating: function() {
		return this._animation && this._animation.animating;
	}
});