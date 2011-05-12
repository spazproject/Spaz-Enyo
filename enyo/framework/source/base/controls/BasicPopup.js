/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.kind({
	name: "enyo.BasicPopup",
	kind: enyo.Control,
	showing: false,
	published: {
		modal: false,
		// only apply if modal is false
		dismissWithClick: true,
		dismissWithEscape: true,
		scrim: false,
		scrimClassName: ""
	},
	events: {
		onOpen: "",
		onClose: ""
	},
	defaultZ: 120,
	className: "enyo-popup",
	//* @protected
	create: function() {
		this.inherited(arguments);
		// FIXME: global dispatcher may not be good enough
		this.dispatcher = enyo.dispatcher;
		// NOTE: parent all popups in root parent to avoid problem:
		// webkit-transforms defeat fixed positioning.
		this.setParent(this.findRootParent());
	},
	destroy: function() {
		this.close();
		this.inherited(arguments);
	},
	findRootParent: function() {
		var o = this;
		while (o = o.owner) {
			if (!(o.owner instanceof enyo.Control)) {
				return o;
			}
		}
	},
	//* @public
	// open / close
	toggleOpen: function() {
		if (this.isOpen) {
			this.close();
		} else {
			this.open();
		}
	},
	open: function() {
		if (this.isOpen) {
			return;
		}
		this.isOpen = true;
		this.prepareOpen();
		this.renderOpen();
		this.showHideScrim(this.isOpen);
		enyo.asyncMethod(this, "afterOpen");
	},
	close: function(e, inReason) {
		if (this.isOpen) {
			this.isOpen = false;
			this.prepareClose();
			this.renderClose();
			this.showHideScrim(this.isOpen);
			this.doClose(e, inReason);
		}
	},
	//* @protected
	dispatchDomEvent: function(e) {
		var r = this.inherited(arguments);
		// avoid bubbling dom events if we are not modal and will therefore forward events
		// this prevents events from being sent twice to ancestors of both the popup and the event dispatch target.
		return !this.modal ? true : r;
	},
	prepareOpen: function() {
		this._zIndex = ++enyo.BasicPopup.count * 2 + this.findZIndex() + 1;
		// leave room for scrim
		this.applyStyle("z-index", this._zIndex);
		if (!this.generated) {
			this.render();
		}
		this.dispatcher.capture(this, !this.modal);
	},
	prepareClose: function() {
		if (this.showing) {
			enyo.BasicPopup.count--;
		}
		this.dispatcher.release();
		this._zIndex = null;
		this.applyStyle("z-index", null);
	},
	afterOpen: function() {
		// Indicate that we have resized; allows controls that need to respond to being resized
		// e.g. VirtualLists to update their size.
		this.resized();
		this.doOpen();
	},
	renderOpen: function() {
		this.show();
	},
	renderClose: function() {
		this.hide();
	},
	showHideScrim: function(inShow) {
		if (this.scrim) {
			if (inShow) {
				// move scrim to just under the popup to obscure rest of screen
				this._scrimZ = this.findZIndex()-1;
				enyo.scrim.showAtZIndex(this._scrimZ);
			} else {
				enyo.scrim.hideAtZIndex(this._scrimZ);
			}
			enyo.call(enyo.scrim, "addRemoveClass", [this.scrimClassName, enyo.scrim.showing]);
		}
	},
	findZIndex: function() {
		// a default z value
		var z = this.defaultZ;
		if (this._zIndex) {
			z = this._zIndex;
		} else if (this.hasNode()) {
			z = Number(enyo.dom.getComputedStyleValue(this.node, "z-index")) || z;
		}
		return (this._zIndex = z);
	},
	// open / close events
	mousedownHandler: function(inSender, e) {
		// mousedowns that are not inside this popup can dismiss us, if we are not modal and dismissWithClick is true
		var foreignMousedown = !e.dispatchTarget.isDescendantOf(this);
		if (!this.modal && this.dismissWithClick && e.dispatchTarget != this && foreignMousedown) {
			this.close(e);
		} else if (this.modal && foreignMousedown) {
			// prevent focusing from shifting if we're modal.
			e.preventDefault();
		}
		this.fire("onmousedown", e);
	},
	blurHandler: function(inSender, e) {
		this.lastFocus = inSender;
	},
	focusHandler: function(inSender, e) {
		if (this.modal && !inSender.isDescendantOf(this)) {
			var n = (this.lastFocus && this.lastFocus.hasNode()) || this.hasNode();
			if (n) {
				n.focus();
			}
		}
	},
	keydownHandler: function(inSender, e, inTarget) {
		switch (e.keyCode) {
			case 27: 
				if (this.dismissWithEscape && !this.modal) {
					this.close(e);
					enyo.stopEvent(e);
				}
				return true;
		}
	},
	clickHandler: function(inSender, inEvent) {
		var handler = this.findPopupHandler(inSender);
		if (handler) {
			this.close(inEvent, handler.popupHandler);
		}
		return this.doClick();
	},
	findPopupHandler: function(inControl) {
		var c = inControl;
		while (c && c.isDescendantOf(this)) {
			if (c.popupHandler) {
				return c;
			}
			c = c.parent;
		}
	}
});

enyo.BasicPopup.count = 0;
