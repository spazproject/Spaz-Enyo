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
		if (!e.synthetic && e.dispatchTarget) {
			// cache the mousedown targets
			this.target = e.target;
			this.dispatchTarget = e.dispatchTarget;
			//
			// defer focus events until mouseup, so we can cancel via dragging
			this.beginPreventFocus(e);
			//
			// Custom mousedown handling so we can
			// call preventDefault on mousedown.
			//
			// However, certain objects require default mousedown behavior,
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
			//
			// stop processing if we used custom mousedown
			return custom;
		}
	},
	sendCustomMousedown: function(e) {
		// preventDefault on mousedown implements a performance
		// tweak to short-circuit cycle-stealing mousedown
		// handling in webkit when the -webkit-user-select:none
		// style is set.
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
		// Manually implement focusing on mousedown
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
		// only process events that haven't been synthesized
		// (i.e. have not already been through this function)
		if (!e.synthetic) {
			// it's possible for the drop event from stopDragging to
			// cause events to occur asynchronously to this method
			// (e.g. by throwing an alert), so we need to disable
			// tracking first.
			this.stopTracking();
			// stop focus prevention
			this.endPreventFocus(e);
			// we need to remember if this gesture was a drag, so we
			// can prevent a 'click' from being generated (see click method)
			this.didDrag = this.stopDragging(e);
			this.stopMousehold();
			//
			// sendCustomClick may create a synthetic click event if the up/down pair
			// crossed a node boundary. If sendCustomClick returns true, it has handled 
			// this mouseup specially,  and we must inform dispatcher to stop processing.
			return !this.didDrag && this.sendCustomClick(e);
		}
	},
	// drag focus prevention:
	// FIXME: would be better to prevent mousedown event to stop the real focus
	// but this requires a "focus at point" api. That api has been requested and is currently pending.
	// So for now, prevent focus event when mouse is down; we send it explicitly on
	// mouse up if a focus event was generated.
	focus: function(e) {
		this.needsCustomFocus = this.focusPrevented;
		return this.focusPrevented;
	},
	beginPreventFocus: function(e) {
		this.focusPrevented = true;
		this.needsCustomFocus = false;
		enyo.keyboard.suspend();
	},
	endPreventFocus: function(e) {
		this.focusPrevented = false;
		var keyboard = enyo.keyboard.isShowing();
		// if there was a drag when keyboard not showing abort focus by blurring
		if (this.dragEvent && !keyboard) {
			//console.log("GESTURE: blur mousedown target");
			this.target.blur();
		// otherwise, send focus event if one was generated during prevention period.
		} else if (this.needsCustomFocus) {
			//console.log("GESTURE: simulate focus: " + this.target.id);
			this.send("focus", e, {synthetic: true, target: this.target});
		}
		// signal to mouseup event if focus is acceptable: no drag or (keyboard is up and mouseup/down share ancestor).
		e.canFocus = !this.dragEvent || (keyboard && this._findCommonAncestor(this.dispatchTarget, e.dispatchTarget));
		enyo.keyboard.resume();
		//console.log("GESTURE: in mouseup event, signal that focus is: " + (e.canFocus ? "prevent" : "don't prevent"));
	},
	sendCustomClick: function(e) {
		// If mousedown/up pair has crossed a node boundary,
		// synthesize a click event on the first common ancestor.
		//
		// if the target is the same, DOM should send a click for us (is this ever not true?)
		if (this.target !== e.target) {
			// If there is a common ancestor for the mousedown/mouseup pair,
			// it is the origin for bubbling a click event
			var p = this._findCommonAncestor(this.dispatchTarget, e.dispatchTarget);
			if (p) {
				// reprocess the original mouseup synchronously, because it has to happen before we send click
				// we also must send click synchronously, because click must happen before dblclick
				e.synthetic = true;
				enyo.dispatch(e);
				// now send syntha-click
				this.send("click", e, {synthetic: true, target: p.hasNode()});
				// tell the caller we handled the mouseup in this case
				return true;
			}
		}
	},
	findCustomClickTarget: function(e) {
		// if the target is the same, DOM should send a click for us (is this ever not true?),
		// otherwise, we may need to send a custom event
		return (this.target !== e.target);
	},
	click: function(e) {
		if (this.didDrag) {
			// reset didDrag just in case somebody might send a click directly
			// and there was no mouseup to set didDrag.
			this.didDrag = false;
			// squelch post-drag clicks
			return true;
		}
		/*
		if (e.synthetic) {
			console.log("synth click");
		} else {
			console.log("dom click");
		}
		*/
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