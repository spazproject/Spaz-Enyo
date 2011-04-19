/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control designed to be rendered multiple times. Typically, controls provide dynamic 
behavior in response to events and effect changes in rendering. Because flyweight is rendered
multiple times, the question comes up: which rendering of the flyweight should update when an event occurs?
To address this issue, whenever a DOM event is processed by a Flyweight object or any of its children, the flyweight 
automatically updates itself and its children to point to the rendering of itself in which the event occurred.
*/
enyo.kind({
	name: "enyo.Flyweight",
	kind: enyo.Control,
	events: {
		onNodeChange: "",
		onDecorateEvent: ""
	},
	//* @protected
	captureDomEvent: function(e) {
		if (e.type != "mousemove") {
		//if (e.type != "mousemove" && e.type != "mouseover" && e.type != "mouseout") {
			//this.log(e.type);
			this.setNodeByEvent(e);
			this.doDecorateEvent(e);
		}
	},
	//* @public
	setNodeByEvent: function(inEvent) {
		var n = this.findNode(inEvent.target);
		//if (n && n != this.node) {
		if (n) {
			this.setNode(n);
			this.doNodeChange(n);
		}
	},
	// Given a node assumed to be inside a rendering of the flyweight, locate
	// a node for the flyweight.
	findNode: function(inNode) {
		var n = inNode;
		while (n) {
			if (n.id == this.id) {
				return n;
			}
			n = n.parentNode;
		}
	},
	disableNodeAccess: function() {
		this.disEnableNodeAccess(this, true);
	},
	enableNodeAccess: function() {
		this.disEnableNodeAccess(this);
	},
	//* @protected
	// When rendering multiple copies of a flyweight, we want it to report that
	// it does not have a node so that it's possible to call methods like setShowing 
	// that can affect rendering without them actually affecting any rendering
	// (i.e. its first rendering)
	// FIXME: It would be much simpler to add a flag to hasNode which can disable it.
	// instead here, we're actually patching the function
	disEnableNodeAccess: function(inControl, inDisable) {
		if (inDisable) {
			if (!inControl._hasNode) {
				inControl._hasNode = inControl.hasNode;
				inControl.hasNode = enyo.nop;
			}
		} else if (inControl._hasNode) {
			inControl.hasNode = inControl._hasNode;
			delete inControl._hasNode;
		}
		for (var i=0, c$=inControl.children, c; c=c$[i]; i++) {
			this.disEnableNodeAccess(c, inDisable);
		}
	},
	// NOTE: When we set a flyweight's node, we udpate all its controls' nodes as well.
	setNode: function(inNode) {
		this.inherited(arguments);
		this.assignControlNodes(this);
	},
	// iterate the immediate dom of the given control's node and locate enyo Controls
	// recursively update each Control's node reference
	assignControlNodes: function(inControl) {
		for (var i=0, c$=inControl.children, c, n; c=c$[i]; i++) {
			n = this.findControlNode(c, inControl.node, i);
			if (n) {
				c.node = n;
				this.assignControlNodes(c);
			}
		}
	},
	// NOTE: previously we used enyo.$ to match a control to a node, but that
	// requires wantsEvents true so instead matching id's.
	findControlNode: function(inControl, inParentNode, inIndex) {
		var id = inControl.id;
		// first see if the control matches node with same array index
		// this should be almost all cases
		var n = inParentNode.childNodes[inIndex];
		if (n && n.id == id) {
			return n;
		}
		// then fall back to searching in dom
		return inParentNode.querySelector("[id="+id+"]");
	}
});
