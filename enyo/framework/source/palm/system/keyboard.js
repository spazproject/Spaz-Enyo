/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected

// return the visibile window bounds unobscured by the keyboard
enyo.getModalBounds = function() {
	return {
		width: window.innerWidth,
		height: window.innerHeight - enyo.keyboard.height
	};
};

//* @public
/**

 A collection of methods to deal with the virtual keyboard on webOS.  The virtual keyboard has two modes, the automatic mode (the default),
 where the keyboard automatically appears when the user puts focus on a text input control, and a manual mode where the keyboard is shown and 
 hidden under program control.  
 
 Since the keyboard appears on screen with your application, you can have the default mode where your app
 window resizes or an alternative mode where the keyboard is a popup over your window.  The second mode may be preferred if resizing your UI
 is an expensive operation, but in that case you'll need to ensure that the user input area isn't positioned under the keyboard.
 */
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
	getFocusedControl: function() {
		// FIXME: this dispatcher function has a more general purpose; relocate/name...
		return enyo.dispatcher.findDispatchTarget(document.activeElement);
	},
	getCaretPosition: function() {
		if (window.caretRect) {
			var r = window.caretRect();
			if (r.x !== 0 || r.y !== 0) {
				return r;
			} else {
				r = this.getControlCaretPosition();
				if (r) {
					return r;
				}
			}
			//console.log("window.caretRect failed");
		}
		return this.getSimulatedCaretPosition();
	},
	getControlCaretPosition: function() {
		var c = this.getFocusedControl();
		if (c && c.caretRect) {
			return c.caretRect;
		}
	},
	getSimulatedCaretPosition: function() {
		var c = this.getFocusedControl();
		var p = {x: 0, y: 0, height: 30, width: 0};
		if (c) {
			var o = c.getOffset();
			p.x = o.left;
			p.y = o.top;
		}
		return p;
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
	suspend: function() {
		// suspend keyboard independent of user's manual setting.
		if (enyo.keyboard.isManualMode()) {
			enyo.warn("Keyboard suspended when in manual mode");
		}
		PalmSystem.setManualKeyboardEnabled(true);
	},
	resume: function() {
		if (!enyo.keyboard.isManualMode()) {
			enyo.keyboard.setManualMode(false);
		}
	}
};

//* @public
/**
	Set the keyboard mode to either resize the application window (default) or to be displayed
	on top of application content.
*/
enyo.keyboard.setResizesWindow = function(inResizesWindow) {
	// stub for documentation purposes
};

/**
	Set the keyboard to be in manual mode. When in manual mode, the keyboard will not automatically display
	when an element that can receive keys is focused or blurred. When in manual mode, it's possible to
	show or hide the keyboard via _enyo.keyboard.show_ and _enyo.keyboard.hide_.
*/
enyo.keyboard.setManualMode = function(inManual) {
	// stub for documentation purposes
};

enyo.keyboard.suspend = function() {
}

enyo.keyboard.resume = function() {
}

/**
	Show the keyboard. Requires that the keyboard is in manual mode;
	call _enyo.keyboard.setManualMode(true)_ first.
	
	inType {Integer} Indicates the keyboard style to show, values are:

	* 0: Text (_enyo.keyboard.typeText_)
	* 1: Password (_enyo.keyboard.typePassword_)
	* 2: Search (_enyo.keyboard.typeSearch_)
	* 3: Range (_enyo.keyboard.typeRange_)
	* 4: Email (_enyo.keyboard.typeEmail_)
	* 5: Number (_enyo.keyboard.typeNumber_)
	* 6: Phone (_enyo.keyboard.typePhone_)
	* 7: URL (_enyo.keyboard.typeURL_)
	* 8: Color (_enyo.keyboard.typeColor_)
*/
enyo.keyboard.show = function(inType) {
	// stub for documentation purposes
};


enyo.keyboard.typeText = 0;
enyo.keyboard.typePassword = 1;
enyo.keyboard.typeSearch = 2;
enyo.keyboard.typeRange = 3;
enyo.keyboard.typeEmail = 4;
enyo.keyboard.typeNumber = 5;
enyo.keyboard.typePhone = 6;
enyo.keyboard.typeURL = 7;
enyo.keyboard.typeColor = 8;

/**
	Hide the keyboard. Requires that the keyboard is in manual mode;
	call enyo.keyboard.setManualMode(true) first.
*/
enyo.keyboard.hide = function() {
	// stub for documentation purposes
};

/**
	Force the keyboard to show by setting manual keyboard mode and then showing the keyboard.
	See _enyo.keyboard.show_ for inType values.
*/
enyo.keyboard.forceShow = function(inType) {
	// stub for documentation purposes
};

/**
	Force the keyboard to hide by setting manual keyboard mode and then hiding the keyboard.
*/
enyo.keyboard.forceHide = function() {
	// stub for documentation purposes
};

/**
	Returns true if the keyboard is showing.
*/
enyo.keyboard.isShowing = function() {
	// stub for documentation purposes
};

/**
	Returns true if the keyboard is in manual mode.
*/
enyo.keyboard.isManualMode = function() {
	// stub for documentation purposes
};

//* @protected
enyo.keyboard.warnManual = function() {
	enyo.warn("Cannot show or hide keyboard when not in manual mode; call enyo.keyboard.setManualMode(true)");
};

	
enyo.requiresWindow(function() {
	Mojo = window.Mojo || {};

	Mojo.positiveSpaceChanged = function(width, height) {
		//FIXME: Sysmgr sending positiveSpaceChanged(0,0) in initial orientation, bug filed DFISH-13508
		if (width !== 0 && height !== 0) {
			enyo.keyboard.heightChanged(window.innerHeight - height);
			enyo.dispatch({type: "resize"});
		}
	};

	// Dispatcher feature hooks: resize, focus, keydown
	enyo.dispatcher.features.push(
		function(e) {
			if (enyo.keyboard.events[e.type]) {
				return enyo.keyboard[e.type](e);
			}
		}
	);

	if (window.PalmSystem) {
		enyo.keyboard.setResizesWindow = function(inResizesWindow) {
			//console.log("enyo.keyboard.setResizesWindow: " + inResizesWindow);
			this.resizesWindow = inResizesWindow;
			if (this.resizesWindow) {
				this.heightChanged(0);
			}
			if (PalmSystem.allowResizeOnPositiveSpaceChange) {
				PalmSystem.allowResizeOnPositiveSpaceChange(inResizesWindow);
			} else {
				console.log("Keyboard resizing cannot be changed.");
			}
		};

		enyo.keyboard.setManualMode = function(inManual) {
			enyo.keyboard._manual = inManual;
			PalmSystem.setManualKeyboardEnabled(inManual);
		};

		enyo.keyboard.isManualMode = function() {
			return enyo.keyboard._manual;
		};

		enyo.keyboard.suspend = function() {
			// suspend keyboard independent of user's manual setting.
			if (enyo.keyboard.isManualMode()) {
				enyo.warn("Keyboard suspended when in manual mode");
			}
			PalmSystem.setManualKeyboardEnabled(true);
		}

		enyo.keyboard.resume = function() {
			if (!enyo.keyboard.isManualMode()) {
				enyo.keyboard.setManualMode(false);
			}
		}

		enyo.keyboard.show = function(inType) {
			if (enyo.keyboard.isManualMode()) {
				PalmSystem.keyboardShow(inType || 0);
			} else {
				enyo.keyboard.warnManual();
			}
		};

		enyo.keyboard.hide = function() {
			if (enyo.keyboard.isManualMode()) {
				PalmSystem.keyboardHide();
			} else {
				enyo.keyboard.warnManual();
			}
		};

		enyo.keyboard.forceShow = function(inType) {
			enyo.keyboard.setManualMode(true);
			PalmSystem.keyboardShow(inType || 0);
		};

		enyo.keyboard.forceHide = function() {
			enyo.keyboard.setManualMode(true);
			PalmSystem.keyboardHide();
		};

		enyo.keyboard.isShowing = function() {
			if (this.height) {
				return true;
			}
			var o = enyo.getWindowOrientation();
			var i = enyo.fetchDeviceInfo();
			var barH = i.screenHeight - i.maximumCardHeight;
			var w = window.innerHeight;
			// device height
			var sluff = 100;
			var h = (o == "down" || o == "up") ? i.maximumCardHeight : i.maximumCardWidth - barH;
			return window.innerHeight < h - sluff;
		};
	}
});
