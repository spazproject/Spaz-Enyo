/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	ManagedDomNodeBuilder extends DomNodeBuilder with the ability to be _managed_.

	Management is similar to ownership for Components. Whereas ownership defines the messaging and lifecycle relationships for components,
	management defines their layout and behavioral relationships.

	A ManagedDomBuilder can have a _manager_. Managers are typically Controls, which are themselves ManagedDomBuilders.
	Therefore, controls manage other controls, and can be composed into a tree.

	A Control generally contains the objects it manages. In this way, management is very similar to the parent-child relationship in DOM. 
	However, the management relationship is a logical one. There is also an explicit parent/child relationship, but it tends to be
	more complicated. The manager concept allows us to simplify our view of constructions that would otherwise be quite complex.

	See <a href="#enyo.Control">enyo.Control</a> for more information.
*/
enyo.kind({
	name: "enyo.ManagedDomBuilder",
	kind: enyo.DomNodeBuilder,
	published: {
		content: "",
		// - Note: className is a virtual property, set/getClassName implemented in DomNode.
		//   Probably those should be set/getDomClassName in DomNode which are called by
		//   set/getClassName here, but is the extra layer justified?
		className: "",
		manager: null,
		parent: null
	},
	// - FIXME: style is a less-than-virtual property, it can be set in the prototype
	//   or in importProps only
	style: "",
	//* @protected
	// life cycle
	create: function(inProps) {
		this.inherited(arguments);
		// Notes:
		// - className is a virtual property, this.className value is only useful here 
		// - addClass instead of setClassName, because this.domAttributes.className may already have a value
		// - inheritors should 'addClass' to add classes, or 'setClassName' to start over 
		// - should we implement initClassName to allow subclasses more control over inherited behavior?
		this.addClass(this.className);
		this.addCssText(this.style);
		this.domAttributes.id = this.id;
		if (this.width) {
			this.domStyles.width = this.width;
		}
		if (this.height) {
			this.domStyles.height = this.height;
		}
		this.managerChanged();
		this.parentChanged();
	},
	destroy: function() {
		this.setParent(null);
		this.setManager(null);
		this.inherited(arguments);
	},
	importProps: function(inProps) {
		if (inProps) {
			// FIXME: there are some props that we handle specially and do not want to mix in directly.
			if (inProps.style) {
				this.addCssText(inProps.style);
				delete inProps.style;
			}
			if (inProps.domStyles) {
				enyo.mixin(this.domStyles, inProps.domStyles);
				delete inProps.domStyles;
			}
			if (inProps.domAttributes) {
				enyo.mixin(this.domAttributes, inProps.domAttributes);
				delete inProps.domAttributes;
			}
			// Note: 'className' property can be set in the prototype as well as inProps, so we combine them here 
			// in both cases it's only used for initialization, and is otherwise virtual
			if (inProps.className && this.className) {
				this.className += " " + inProps.className;
				delete inProps.className;
			}
		}
		this.inherited(arguments);
	},
	// management
	managerChanged: function(inOldManager) {
		if (inOldManager) {
			inOldManager.removeControl(this);
		}
		if (this.manager) {
			this.manager.addControl(this);
		}
	},
	// parentage
	parentChanged: function(inOldParent) {
		// note: never true when called from create with no props (if this.parent has a value)
		if (inOldParent != this.parent) {
			if (inOldParent) {
				inOldParent.removeChild(this);
			}
			if (this.parent) {
				this.parent.addChild(this);
			}
		}
	},
	//* @public
	// Note: weirdly, a Control is considered a descendant of itself
	isDescendantOf: function(inAncestor) {
		var p = this;
		while (p && p!=inAncestor) {
			p = p.parent;
		}
		return inAncestor && (p == inAncestor);
	},
	// rendering
	getOffset: function() {
		if (this.parent) {
			return this.parent.calcControlOffset(this);
		} else {
			return enyo.dom.calcNodeOffset(this.hasNode());
		}
	},
	//* @protected
	calcControlOffset: function(inControl) {
		var p = inControl.parent;
		if (p && p != this) {
			return p.calcControlOffset(inControl);
		} else {
			var o = this.getOffset();
			if (this.hasNode() && inControl.hasNode()) {
				var c = enyo.dom.calcNodeOffset(inControl.node, this.node);
				o.top += c.top;
				o.left += c.left;
			}
			return o;
		}
	},
	getParentNode: function() {
		return this.parent ? this.parent.hasNode() : this.inherited(arguments);
	},
	rendered: function() {
		// It's more convenient to locate our node reference right away, but it's 
		// expensive (especially on IE [1000 nodes, 1000ms vs 300ms]). 
		// Instead, we require code to call hasNode() to establish node reference on demand.
		// Unfortunately if we did renderNode, in that case our node reference is valid
		// and clearing it is make-work.
		// We could do this in generateHtml, it might be more proper, but is less intuitive.
		// Content rendering will also call this function because we do not distinguish between
		// rendered and contentRendered; in this case clearing the node reference is again
		// make-work.
		this.node = null;
	},
	contentChanged: function() {
		this.renderContent();
	},
	//* @public
	addContent: function(inContent, inDelim) {
		this.setContent((this.content ? this.content + (inDelim || "") : "") + inContent);
	}
});
