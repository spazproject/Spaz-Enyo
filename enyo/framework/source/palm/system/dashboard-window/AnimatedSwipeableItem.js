/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// A swipeable item that animates the item out (or back into place).
// Separate for now, so we can limit changes to dashboards only, until they're proven robust.
// May not play nicely with delete confirmation mode.
enyo.kind({
	name: "enyo.AnimatedSwipeableItem",
	kind: enyo.SwipeableItem,
	dragstartHandler: function() {
		return !!this.exitIntervalId || this.inherited(arguments);
	},
	dragHandler: function() {
		return !!this.exitIntervalId || this.inherited(arguments);
	},
	dragfinishHandler: function(inSender, inEvent) {
		if (this.exitIntervalId) {
			return true;
		}
		if (this.handlingDrag) {
			var dx = this.getDx(inEvent);
			this.setSwipeable(false);
			this.exitPos = dx;
			this.exitDirection = dx > 0 ? 1 : -1;
			// Were we dragged far enough to trigger a delete?
			if (Math.abs(dx) > this.triggerDistance) {
				this.exitTarget = this.node.offsetWidth; // - (dx * this.exitDirection)
				this.exitIntervalId = window.setInterval(enyo.bind(this, "animateExit"), 33);
				this.exitSpeed = 40;
			} else {
				this.exitDirection *= -1; // invert direction, so we animate back into place.
				this.exitTarget = 0;
				this.exitSpeed = 10;
				this.exitIntervalId = window.setInterval(enyo.bind(this, "animateReset"), 33);
			}
			this.handlingDrag = false;
			inEvent.preventClick();
			return true;
		}
	},
	animateReset: function() {
		this.animateFrame();
		if ((this.exitDirection < 0) === (this.exitPos < 0)) {
			this.animationComplete();
		}
	},
	animateExit: function() {
		this.animateFrame();
		if (Math.abs(this.exitPos) > this.exitTarget) {
			this.animationComplete();
			this.handleSwipe();
		}
	},
	animateFrame: function() {
		this.exitPos += this.exitSpeed * this.exitDirection;
		this.node.style.webkitTransform = "translate3d(" + this.exitPos + "px, 0, 0)";
		this.doDrag(this.exitPos);
	},
	animationComplete: function() {
		this.resetPosition();
		this.setSwipeable(true);
	},
	resetPosition: function() {
		if (this.exitIntervalId) {
			window.clearInterval(this.exitIntervalId);
			this.exitIntervalId = undefined;
		}
		this.inherited(arguments);
	}	
});
