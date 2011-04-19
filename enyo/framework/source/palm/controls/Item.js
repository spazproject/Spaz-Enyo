/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control designed to display a group of stacked items, typically used in lists. Items
have small guide lines between them and, by default, are highlighted when tapped. Set
tapHighlight to false to prevent the highlighting.

	{flex: 1, name: "list", kind: "VirtualList", onSetupRow: "listSetupRow", components: [
		{kind: "Item", onclick: "listItemClick"}
	]}
*/
enyo.kind({
	name: "enyo.Item",
	kind: enyo.Stateful,
	className: "enyo-item",
	published: {
		tapHighlight: false,
		//* @protected
		held: false,
		//* @public
		disabled: false
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.disabledChanged();
	},
	heldChanged: function() {
		if (!this.tapHighlight) {
			return;
		}
		this.stateChanged("held");
	},
	disabledChanged: function() {
		this.stateChanged("disabled");
	},
	mouseholdHandler: function(inSender, inEvent) {
		if (this.disabled) {
			return;
		}
		this.setHeld(true);
		this.fire("onmousehold", inEvent);
	},
	mousereleaseHandler: function(inSender, inEvent) {
		this.setHeld(false);
		this.fire("onmouserelease", inEvent);
	},
	// make sure we show "held" before clicking
	clickHandler: function(inSender, inEvent) {
		if (this.disabled) {
			return;
		}
		// apply held
		this.setHeld(true);
		//
		// on a delay click and removing held.
		var n = this.hasNode();
		enyo.callWithoutNode(this, n, enyo.bind(this, "setHeld", false));
		var cn = this.domAttributes.className;
		setTimeout(enyo.hitch(this, function() {
			n.className = cn;
			this.doClick(inEvent, inEvent.rowIndex);
		}), 100);
	}
});

// FIXME: needs a place to live and better name
// locate a flyweight that is a parent for the given node
enyo.findFlyweight = function(inNode) {
	var n = inNode, c;
	while (n) {
		c = enyo.$[n.id];
		if (c && c.kindName.indexOf("Flyweight") >= 0) {
			return c;
		}
		n = n.parentNode;
	}
}

// call a function with a control's node access disabled.
enyo.callWithoutNode = function(inControl, inNode, inFunc) {
	inControl.node = null;
	var fn = inControl.hasNode;
	inControl.hasNode = enyo.nop;
	inFunc();
	inControl.hasNode = fn;
	inControl.node = inNode;
}

// call a function in a control's context with the control set to a particular node
// and handle if the control is a descendant of a flyweight.
enyo.callWithNode = function(inControl, inNode, inFunc) {
	var f = enyo.findFlyweight(inControl.node);
	var c = f || inControl;
	var n0 = c.node;
	var n1 = f ? f.findNode(inNode) : inNode;
	c.setNode(n1);
	//
	var args = enyo._toArray(arguments, 3);
	inFunc = enyo.isString(inFunc) ? inControl[inFunc] : inFunc;
	inFunc.apply(inControl, args);
	// why set this back?
	//c.setNode(n0);
}
