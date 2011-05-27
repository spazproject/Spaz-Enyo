/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	ContainedDomBuilder extends DomNodeBuilder with the ability 
	to be contained by Controls.

	Containment is similar to ownership for Components. Whereas 
	ownership defines the messaging and lifecycle relationships 
	for components, containment defines layout and behavioral 
	relationships.

	A ContainedDomBuilder can have a _container_. Containers are 
	Control kinds, which are themselves ContainedDomBuilders. 
	Therefore, Controls contain other Controls, and can be composed
	into a tree.

	Containment is similar to the parent/child relationship in DOM,
	but the DOM parent/child relationship tends to be more complicated.
	
	The container concept simplifies managing complex UI.

	See <a href="#enyo.Control">enyo.Control</a> for more information.
*/
enyo.kind({
	name: "enyo.ContainedDomBuilder",
	kind: enyo.DomNodeBuilder,
	published: {
		// - Note: className is a virtual property, set/getClassName implemented in DomNode.
		//   Probably those should be set/getDomClassName in DomNode which are called by
		//   set/getClassName here, but is the extra layer justified?
		className: "",
		container: null,
		parent: null
	},
	// - FIXME: style is a less-than-virtual property, it can be set in the prototype
	//   or in importProps only
	style: "",
	//* @protected
	// life cycle
	create: function(inProps) {
		this.inherited(arguments);
		this.initStyles();
		this.containerChanged();
		this.parentChanged();
	},
	destroy: function() {
		this.setParent(null);
		this.setContainer(null);
		this.inherited(arguments);
	},
	initStyles: function() {
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
	// containment
	containerChanged: function(inOldContainer) {
		if (inOldContainer) {
			inOldContainer.removeControl(this);
		}
		if (this.container) {
			this.container.addControl(this);
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
	//* @public
	addContent: function(inContent, inDelim) {
		this.setContent((this.content ? this.content + (inDelim || "") : "") + inContent);
	}
});
