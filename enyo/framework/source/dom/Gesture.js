/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// gesture feature

/**
 enyo.gesture provides an event filter hooked into the enyo dispatcher.  This intercepts some DOM events and turns them into 
 special synthesized events.  
 
 * "back" - sent for the back gesture on webOS devices with a gesture area or on the ESC key in browsers
 * "click" - normally, you get the one sent by the system, but you can get a synthetic "click" when a drag has been initiated
 * "dragstart", "dragfinish" - sent for mouse moves that exceed a certain threshhold
 * "drag", "drop" - sent to the original target of the mousemove to inform it about the item being moved over or released over another element
 * "dragover", "dragout" - sent in place of mouseover and mouseout when there is an active drag
 * "mousehold", "mouseholdpulse", and "mouserelease" - sent for mouse moves that stay within the drag threshhold.  Used to implement hold actions.
 
 There are no public methods defined here.
 */

//* @protected
enyo.dispatcher.features.push(
	function(e) {
		// NOTE: beware of properties in enyo.gesture inadvertantly mapped to event types
		if (enyo.gesture[e.type]) {
			return enyo.gesture[e.type](e);
		}
	}
);

//* @public
enyo.gesture = {
//* @protected
	hysteresis: 4,
	holdDelay: 200,
	pulseInterval: 100,
	// synthesize 'back' event from ESC key on all platforms
	keyup: function(e) {
		if (e.keyCode == 27) {
			enyo.dispatch({
				type: "back",
				target: null,
				preventDefault: function() {
					e.preventDefault();
				}
			});
		}
	},
	focusNode: function(inNode) {
		if (document.activeElement != inNode) {
			document.activeElement.blur();
			inNode && inNode.focus();
		}
	},
	// FIXME: do we need to ascend the parent tree or is it enough to require an explicit flag on the control?
	requiresDomMousedown: function(e) {
		return e.dispatchTarget.requiresDomMousedown;
	},
	mousedown: function(e) {
		// only process events that haven't been synthesized
		// (aka have not already been through this function)
		if (!e.synthetic) {
			// cache the mousedown targets
			this.target = e.target;
			this.dispatchTarget = e.dispatchTarget;
			//
			// Custom mousedown handling so we can
			// call preventDefault on mousedown by default.
			//
			// preventDefault on mousedown implements a performance
			// tweak to short-circuit cycle-stealing mousedown
			// handling in webkit when the -webkit-user-select:none
			// style is set.
			//
			// Certain objects require default mousedown behavior,
			// for example, inputs need default mousedown to position
			// the caret.
			//
			var custom = !this.requiresDomMousedown(e);
			if (custom) {
				this.sendCustomMousedown(e);
			}
			// tracking whether this is a click or a drag
			this.startTracking(e);
			// if the mouse is held down long enough, we will send 'mousehold' events
			this.startMousehold(e);
			// stop processing if we used custom mousedown
			return custom;
		}
	},
	sendCustomMousedown: function(e) {
		e.preventDefault();
		// We still need to allow control over focus effects
		// by honoring client code calls preventDefault.
		e.preventDefault = function() {
			e.prevented = true;
		};
		// Redispatch this event as a 'synthetic' event
		// so we can watch for 'prevented' flag
		e.synthetic = true;
		enyo.dispatch(e);
		if (!e.prevented) {
			this.focusNode(e.target);
		}
	},
	mousemove: function(e) {
		if (this.tracking) {
			this.dx = e.pageX - this.px0;
			this.dy = e.pageY - this.py0;
			if (this.dragEvent) {
				this.sendDrag(e);
			} else if (Math.sqrt(this.dy*this.dy + this.dx*this.dx) >= this.hysteresis) {
				this.sendDragStart(e);
				// mouserelease handler may need to know about the drag status
				// so we stopMousehold *after* dragStart, which may be counter-intuitive.
				this.stopMousehold();
			}
		}
	},
	mouseout: function(e) {
		if (this.dragEvent) {
			this.sendDragOut(e);
		}
	},
	mouseup: function(e) {
		// We squelch all standard click events; instead,
		// we synthesize click events on mouseup so we can
		// include the case when mouseup/down pairs cross node
		// boundaries.
		//
		// only process events that haven't been synthesized
		// (aka have not already been through this function)
		if (!e.synthetic) {
			// it's possible for the drop event from stopDragging to
			// cause events to occur asynchronously to this method
			// (e.g. by throwing an alert), so we need to disable
			// tracking first.
			this.stopTracking();
			this.didDrag = this.stopDragging(e);
			this.stopMousehold();
			// reprocess this mouseup, because it has to happen before we send click
			// note that we cannot send click asynchronously, because click must happen
			// before dblclick
			e.synthetic = true;
			enyo.dispatch(e);
			if (!this.didDrag) {
				this.sendCustomClick(e);
			}
			return true;
		}
	},
	click: function(e) {
		// squelch organic clicks
		return this.didDrag;
	},
	sendCustomClick: function(e) {
		// if the target is the same, DOM should send a click for us (is this ever not true?)
		if (this.target !== e.target) {
			// If there is a common ancestor for the mousedown/mouseup pair,
			// it is the origin for bubbling a click event
			var p = this._findCommonAncestor(this.dispatchTarget, e.dispatchTarget);
			if (p) {
				this.send("click", e, {synthetic: true, target: p.hasNode()});
			}
		}
	},
	_findCommonAncestor: function(inA, inB) {
		var p = inB;
		while (p) {
			if (inA.isDescendantOf(p)) {
				return p;
			}
			p = p.parent;
		}
	},
	stopDragging: function(e) {
		if (this.dragEvent) {
			this.sendDrop(e);
			var handled = this.sendDragFinish(e);
			this.dragEvent = null;
			return handled;
		}
	},
	makeDragEvent: function(inType, inTarget, inEvent, inInfo) {
		var h = Math.abs(this.dx) > Math.abs(this.dy);
		return {
			type: inType,
			dx: this.dx,
			dy: this.dy,
			pageX: inEvent.pageX,
			pageY: inEvent.pageY,
			horizontal: h,
			vertical: !h,
			target: inTarget,
			dragInfo: inInfo
		};
	},
	sendDragStart: function(e) {
		this.dragEvent = this.makeDragEvent("dragstart", this.target, e);
		enyo.dispatch(this.dragEvent);
	},
	sendDrag: function(e) {
		// send dragOver event to the standard event target
		var synth = this.makeDragEvent("dragover", e.target, e, this.dragEvent.dragInfo);
		enyo.dispatch(synth);
		// send drag event to the drag source
		synth.type = "drag";
		synth.target = this.dragEvent.target;
		enyo.dispatch(synth);
	},
	sendDragFinish: function(e) {
		var synth = this.makeDragEvent("dragfinish", this.dragEvent.target, e, this.dragEvent.dragInfo);
		synth.preventClick = function() {
			this._preventClick = true;
		};
		enyo.dispatch(synth);
		return synth._preventClick;
	},
	sendDragOut: function(e) {
		var synth = this.makeDragEvent("dragout", e.target, e, this.dragEvent.dragInfo);
		enyo.dispatch(synth);
	},
	sendDrop: function(e) {
		var synth = this.makeDragEvent("drop", e.target, e, this.dragEvent.dragInfo);
		enyo.dispatch(synth);
	},
	startTracking: function(e) {
		// Note: 'tracking' flag indicates interest in mousemove, it's turned off
		// on mouseup
		// We reset tracking data whenever hysteresis is satisfied: we only want
		// to send 'draggable' gestures as dragStart.
		this.tracking = true;
		this.px0 = e.pageX;
		this.py0 = e.pageY;
	},
	stopTracking: function() {
		this.tracking = false;
	},
	startMousehold: function(inEvent) {
		if (this.holdpulseJob) {
			throw("re-entrant startMousehold");
		}
		var synth = {
			type: "mousehold",
			target: inEvent.target,
			holdStart: new Date().getTime(),
			clientX: inEvent.clientX,
			clientY: inEvent.clientY,
			pageX: inEvent.pageX,
			pageY: inEvent.pageY
		};
		enyo.job("enyo.gesture.mousehold", enyo.bind(this, "sendMousehold", synth), this.holdDelay);
	},
	sendMousehold: function(inEvent) {
		enyo.dispatch(inEvent);
		this.startMouseholdPulse(inEvent);
	},
	startMouseholdPulse: function(inEvent) {
		// send a pulse every 'pulseInterval' ms
		inEvent.type = "mouseholdpulse";
		this.holdpulseJob = setInterval(enyo.bind(this, "sendMouseholdPulse", inEvent), this.pulseInterval);
	},
	sendMouseholdPulse: function(inEvent) {
		inEvent.holdTime = new Date().getTime() - inEvent.holdStart;
		enyo.dispatch(inEvent);
	},
	stopMousehold: function(e) {
		enyo.job.stop("enyo.gesture.mousehold");
		if (this.holdpulseJob) {
			clearInterval(this.holdpulseJob);
			this.holdpulseJob = 0;
			this.sendMouseRelease(e);
		}
	},
	sendMouseRelease: function(e) {
		this.send("mouserelease", e);
	},
	send: function(inName, e, inProps) {
		var synth = {
			type: inName,
			pageX: e && e.pageX,
			pageY: e && e.pageY,
			target: this.target,
			// FIXME: prompted by an example that assumed click event would have prevent default (what does that even do?)
			// synthesized events are not dom events, but it's reasonable to expect they have a similar api
			// what else do we need to add?
			preventDefault: enyo.nop
		};
		enyo.mixin(synth, inProps);
		enyo.dispatch(synth);
		return synth;
	}
};

/*
//
// NOTE: special performance tweak to short-circuit cycle-stealing event handling triggered by mousedown
// when the -webkit-user-select:none style is set.
//
enyo.requiresWindow(function() {
	// FIXME: we need to pass mousedown for non-enyo applications. The current necessity is to
	// search through parents for attribute to allow event. Prompted by google maps.
	var shouldPassEvent = function(inNode) {
		var n = inNode;
		while (n) {
			if (n.getAttribute && n.getAttribute("enyo-pass-events")) {
				return true;
			}
			n = n.parentNode;
		}
	};
	var preventMousedown = function(e) {
		var t = e.target;
		if (t.getAttribute && (t.getAttribute("contenteditable") || shouldPassEvent(t)) || (t.tagName == "INPUT")) {
			// mousedown is ok.
		} else {
			// prevent mousedown to speedup processing when webkit-user-select: none.
			e.preventDefault();
			// FIXME: preventDefault stops normal blur/focus from occuring so make that happen
			if (document.activeElement != e.target) {
				document.activeElement.blur();
				e.target.focus();
			}
		}
	};
	// NOTE: special performance tweak to short-circuit cycle-stealing event handling triggered by mousedown
	document.addEventListener("mousedown", preventMousedown, true);
});
*/