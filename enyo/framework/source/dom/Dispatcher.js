/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.$ = {};

//* @public
enyo.dispatcher = {
	//* @protected
	handlerName: "dispatchDomEvent",
	captureHandlerName: "captureDomEvent",
	mouseOverOutEvents: {mouseover: 1, mouseout: 1},
	// these events are handled on document
	events: ["mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "click", "dblclick", "change", "keydown", "keyup", "keypress", "input"],
	// thes events are handled on window
	windowEvents: ["resize", "load", "unload"],
	connect: function() {
		var d = enyo.dispatcher;
		for (var i=0, e; e=d.events[i]; i++) {
			document.addEventListener(e, enyo.dispatch, false);
		}
		for (i=0, e; e=d.windowEvents[i]; i++) {
			window.addEventListener(e, enyo.dispatch, false);
		}
	},
	//* @public
	findDispatchTarget: function(inNode) {
		var t, n = inNode;
		// FIXME: Mozilla: try/catch is here to squelch "Permission denied to access property xxx from a non-chrome context" 
		// which appears to happen for scrollbar nodes in particular. It's unclear why those nodes are valid targets if 
		// it is illegal to interrogate them. Would like to trap the bad nodes explicitly rather than using an exception block.
		try {
			while (n) {
				if (t = enyo.$[n.id]) {
					// there could be multiple nodes with this id, the relevant node for this event is n
					// we don't push this directly to t.node because sometimes we are just asking what
					// the target 'would be' (aka, calling findDispatchTarget from handleMouseOverOut)
					t.eventNode = n;
					break;
				}
				n = n.parentNode;
			}
		} catch(x) {
			console.log(x, n);
		}
		return t;
	},
	findDefaultTarget: function(e) {
		return enyo.master.getComponents()[0];
	},
	dispatch: function(e) {
		// Find the control who maps to e.target, or the first control that maps to an ancestor of e.target.
		var c = this.findDispatchTarget(e.target) || this.findDefaultTarget(e);
		// Cache the original target
		e.dispatchTarget = c;
		// support pluggable features
		var fn;
		for (var i=0, fs; fn=this.features[i]; i++) {
			if (fn.call(this, e)) {
				return true;
			}
		}
		// feature (aka filter) may have established a new target
		c = e.filterTarget || c;
		if (c) {
			// capture phase
			// filterTarget redirects event handling so we decide not to process capture phase.
			if (!e.filterTarget) {
				this.dispatchCapture(e, c);
			}
			// bubble phase
			var handled = this.dispatchBubble(e, c);
			// if the event was captured, forward it if desired
			if (e.forward) {
				handled = this.forward(e);
			}
			//return !handled;
		}
	},
	//* @protected
	forward: function(e) {
		var c = e.dispatchTarget;
		return c && this.dispatchBubble(e, c);
	},
	dispatchCapture: function(e, c) {
		var ancestors = this.buildAncestorList(e.target);
		// FIXME: it's unclear what kind of cancelling we want here.
		// Currently we allow aborting the capture phase.
		// We may want to abort the entire event processing or nothing at all.
		//
		// iterate through ancestors starting from eldest
		for (var i= ancestors.length-1, a; a=ancestors[i]; i--) {
			if (this.dispatchToCaptureTarget(e, a) === true) {
				return true;
			}
		}
	},
	// we ascend the dom making a list of enyo controls
	buildAncestorList: function(inNode) {
		// NOTE: the control is considered its own ancestor
		var ancestors = [];
		var n = inNode;
		var c;
		while (n) {
			c = enyo.$[n.id];
			if (c) {
				ancestors.push(c);
			}
			n = n.parentNode;
		}
		return ancestors;
	},
	dispatchToCaptureTarget: function(e, c) {
		// generic event handler name
		var fn = this.captureHandlerName;
		// If this control implements event handlers...
		if (c[fn]) {
			// ...pass event to target's event handler, abort capture if handler returns true.
			if (c[fn](e) !== true) {
				return false;
			}
			return true;
		}
	},
	dispatchBubble: function(e, c) {
		e.stopPropagation = function() {
			this._handled = true;
		};
		// Bubble up through the control tree
		while (c) {
			// Stop processing if dispatch returns true
			if (this.dispatchToTarget(e, c) === true) {
				return true;
			}
			// Bubble up through parents
			//c = c.manager || c.owner;
			c = c.parent || c.manager || c.owner;
		}
		return false;
	},
	dispatchToTarget: function(e, c) {
		// mouseover/out handling
		if (this.handleMouseOverOut(e, c)) {
			return true;
		}
		// generic event handler name
		var fn = this.handlerName;
		// If this control implements event handlers...
		if (c[fn]) {
			// ...pass event to target's event handler, abort bubbling if handler returns true.
			if (c[fn](e) !== true && !e._handled) {
				return false;
			}
			// cache the handler to help implement symmetric events (in/out)
			e.handler = c;
			return true;
		}
	},
	handleMouseOverOut: function(e, c) {
		if (this.mouseOverOutEvents[e.type]) {
			if (this.isInternalMouseOverOut(e, c)) {
				return true;
			}
			// FIXME: no code in framework is using this facility
			// and it's not performant, consider removal
			/*
			console.log("handleMouseOverOut: ", e.target.id, c.name);
			// Bubble synthetic childmouseover/out
			var synth = {type: "child" + e.type, dispatchTarget: e.dispatchTarget};
			this.dispatchBubble(synth, c.parent);
			*/
		}
	},
	isInternalMouseOverOut: function(e, c) {
		// cache original event node
		var eventNode = c.eventNode;
		// get control for related target, may set a new eventNode
		var rdt = this.findDispatchTarget(e.relatedTarget);
		// if the targets are the same, but the nodes are different, then cross-flyweight, and not internal
		if (c == rdt && eventNode != c.eventNode) {
			// this is the node responsible for the 'out'
			c.eventNode = eventNode;
			//console.log("cross-flyweight mouseover/out", e.type, c.id);
			return false;
		}
		// if the relatedTarget is a decendant of the target, it's internal
		return rdt && rdt.isDescendantOf(c);
	}
};

enyo.dispatch = function(inEvent) {
	return enyo.dispatcher.dispatch(enyo.fixEvent(inEvent));
};

enyo.bubble = function(e) {
	if (e) {
		enyo.dispatch(e);
	}
};

//* @protected

enyo.bubbler = 'enyo.bubble(arguments[0])';

// FIXME: we need to create and initialize dispatcher someplace else to allow overrides
enyo.requiresWindow(enyo.dispatcher.connect);

//
// feature plugins (aka filters)
//

enyo.dispatcher.features = [];

// squelching feature

/*
enyo.mixin(enyo.dispatcher, {
	_squelch: [],
	// FIXME: this timeout is a point of brittleness; it was previously 50ms, but we
	// found that even on desktop Chrome, this was sometimes too short for a click when
	// squelching on mouseup.
	squelchPeriod: 150,
	squelchNextType: function(inType) {
		this._squelch[inType] = new Date().getTime() + this.squelchPeriod;
	},
	squelchNextClick: function() {
		this.squelchNextType("click");
	}
});

enyo.dispatcher.features.push(function(e) {
	// NOTE: primarily to allow DND in a single node 
	// (see Scroller) without firing a click
	// event when mousing up at the end of the drag.
	var t = this._squelch[e.type];
	if (t && e.synthetic) {
		this._squelch[e.type] = 0;
		if (new Date().getTime() < t) {
			return true;
		}
	}
});
*/

// capturing feature

//* @protected

/*
	NOTE: This object is a plug-in; these methods should 
	be called on _enyo.dispatcher_, and not on the plug-in itself.
*/
enyo.dispatcher.captureFeature = {
	//* @protected
	noCaptureEvents: {load: 1, error: 1},
	autoForwardEvents: {mouseout: 1},
	captures: [],
	//* @public
	capture: function(inTarget, inShouldForward) {
		if (this.captureTarget) {
			this.captures.push(this.captureTarget);
		}
		this.captureTarget = inTarget;
		this.forwardEvents = inShouldForward;
		//console.log("capture on");
	},
	release: function() {
		//console.log("capture off");
		this.captureTarget = this.captures.pop();
	}
};

enyo.mixin(enyo.dispatcher, enyo.dispatcher.captureFeature);

enyo.dispatcher.features.push(function(e) {
	var c = e.dispatchTarget;
	if (this.captureTarget && !this.noCaptureEvents[e.type]) {
		if (!c || !c.isDescendantOf(this.captureTarget)) {
			e.filterTarget = this.captureTarget;
			e.forward = this.autoForwardEvents[e.type] || this.forwardEvents;
		}
	}
});

// key preview feature

enyo.dispatcher.keyEvents = {keydown: 1, keyup: 1, keypress: 1};

enyo.dispatcher.features.push(function(e) {
	if (this.keyWatcher && this.keyEvents[e.type]) {
		this.dispatchToTarget(e, this.keyWatcher);
	}
});
