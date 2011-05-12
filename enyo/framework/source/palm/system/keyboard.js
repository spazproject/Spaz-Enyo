/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected

	Mojo = window.Mojo || {};
	Mojo.positiveSpaceChanged = function(width, height) {
		//console.log("positiveSpaceChanged: width: " + width + ", height: " + height);
		enyo.keyboard.heightChanged(window.innerHeight - height);
		enyo.dispatch({type: "resize"});
	}

// Dispatcher feature hooks: resize, focus, keydown
enyo.dispatcher.features.push(
	function(e) {
		if (enyo.keyboard.events[e.type]) {
			return enyo.keyboard[e.type](e);
		}
	}
);

// return the visibile window bounds unobscured by the keyboard
enyo.getVisibleBounds = function() {
	return {
		width: window.innerWidth,
		height: window.innerHeight - enyo.keyboard.height
	};
}

//* @public
enyo.keyboard = {
	//* @protected
	height: 0,
	events: {
		resize: 1,
		focus: 1,
		keydown: 1
	},
	resizesWindow: true,
	heightChanged: function(inHeight) {
		//console.log("enyo.keyboard.heightChanged: " + inHeight);
		this.height = inHeight;
		this.scrollIntoView();
		// reset scroller if hiding...
		if (!inHeight && this.scroller) {
			// FIXME: force a stop so that boundaries will be recalculated.
			this.scroller.stop();
			this.scroller.start();
			this.scroller = null;
		}
	},
	//* @public
	setResizesWindow: function(inResizesWindow) {
		//console.log("enyo.keyboard.setResizesWindow: " + inResizesWindow);
		this.resizesWindow = inResizesWindow;
		if (this.resizesWindow) {
			this.heightChanged(0);
		}
		if (window.PalmSystem) {
			if (PalmSystem.allowResizeOnPositiveSpaceChange) {
				PalmSystem.allowResizeOnPositiveSpaceChange(inResizesWindow);
			} else {
				console.log("Keyboard resizing cannot be changed.");
			}
		}
	},
	//* @protected
	scrollIntoView: function() {
		enyo.job("enyo.keyboard.scrollIntoView", enyo.bind(enyo.keyboard, "_scrollIntoView"), 100);
	},
	_scrollIntoView: function() {
		var s = this.findFocusedScroller();
		if (s) {
			this.scroller = s;
			//console.log("scrollIntoView: " + s.id);
			var p = this.getCaretPosition();
			//console.log(enyo.json.stringify(p));
			s.scrollOffsetIntoView(p.y, p.x, p.height);
		} else if (this.scroller) {
			this.scroller.start();
		} else {
			//console.log("scrollIntoView: no scroller!");
		}
	},
	findFocusedScroller: function() {
		var n = document.activeElement;
		var c;
		while (n) {
			c = enyo.$[n.id];
			if (c instanceof enyo.DragScroller) {
				return c;
			}
			n = n.parentNode;
		}
	},
	getCaretPosition: function() {
		if (window.caretRect) {
			var r = window.caretRect();
			if (r.x != 0 || r.y != 0) {
				return r;
			} else {
				var c = enyo.dispatcher.findDispatchTarget(document.activeElement);
				if (!c.caretRect || c.caretRect.x == 0 || c.caretRect.y == 0) {
					console.log("window.caretRect failed");
				}
				return c.caretRect;
			}
		}
		return this.getSimulatedCaretPosition();
	},
	// events
	resize: function() {
		enyo.keyboard.scrollIntoView();
	},
	focus: function() {
		enyo.keyboard.scrollIntoView();
	},
	keydown: function(inEvent) {
		if (inEvent.keyCode != 9) {
			enyo.keyboard.scrollIntoView();
		}
	},
	getSimulatedCaretPosition: function() {
		// FIXME: this dispatcher function has a more general purpose; relocate/name...
		var c = enyo.dispatcher.findDispatchTarget(document.activeElement);
		var p = {x: 0, y: 0, height: 30, width: 0};
		if (c) {
			var o = c.getOffset();
			p.x = o.left;
			p.y = o.top;
		}
		return p;
	}
};
