/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	The DomNodeBuilder kinds extend the DomNode component by providing methods
	for rendering.

	_Rendering_ refers to the process of generating actual DOM content as 
	described by the component.

	These rendering methods are important for Controls, all of which descend from DomNodeBuilder.
	Note that a single control typically represents a tree of other controls. Rendering the
	root generally renders the entire tree.

	It's common to render an entire application into a document body like this:

		new MyApp().renderInto(document.body);

	On any DomNodeBuilder-derived object, you can set the canGenerate property to false to
	inhibit HTML generation.  It defaults to undefined.
*/
enyo.kind({
	name: "enyo.DomNodeBuilder",
	kind: enyo.DomNode,
	//* @protected
	published: {
		/** when false, content is treated as plain text. when true, it's treated as HTML -- only use when you trust the content 
		    because you generated it yourself or because you've already stripped off potentially malicious tags */
		allowHtml: false,
		/** the content that will be put inside the DOM node created */
		content: ""
	},
	// if we've generated HTML or DOM
	generated: false,
	teardownRender: function() {
		this.node = null;
		this.generated = false;
	},
	hasNode: function() {
		// 'generated' is used to gate access to expensive findNodeById call
		return this.generated ? (this.node || this.findNodeById()) : null;
	},
	contentChanged: function() {
		if (!this.allowHtml) {
			this.content = enyo.string.escapeHtml(this.content);
		}
		this.renderContent();
	},
	/** Returns HTML that is rendered by this Builder. By default, returns <i>this.content</i>.*/
	// FIXME: propose calling this generateInnerHtml (it's not a pure getter, helpul to assert it's HTML)
	getInnerHtml: function() {
		return this.content;
	},
	/**
		Generates HTML that renders this node.
	*/
	generateHtml: function() {
		if (this.canGenerate === false) {
			return '';
		}
		// do this first in case content generation affects styles or attributes
		var c = this.getInnerHtml();
		var h = '<' 
			+ this.nodeTag
			+ enyo.attributesToHtml(this.domAttributes);
		// FIXME: this.style vs this.domStyles?
		var s = (this.style ? this.style + ";" : "") 
			+ enyo.stylesToHtml(this.domStyles);
		if (s) {
			h += ' style="' + s + '"';
		}
		// FIXME: there are other self-closing tags
		if (this.nodeTag == "img") {
			h += '/>';
		} else {
			h += '>'
				+ c
			+ '</' + this.nodeTag + '>';
		}
		// 'generated' is used to gate access to findNodeById in hasNode, which
		// is expensive.
		// NOTE: we typically use 'generated' to mean 'created in DOM'
		// which has not actually happened at this point.
		// We set this here to avoid having a separate walk of the 
		// control tree. The contract is that insertion in DOM
		// will happen synchronously to generateHtml() and before
		// anybody should be calling hasNode().
		this.generated = true;
		return h;
	},
	//* @protected
	/** Renders our attributes to an existing node. Null-valued attributes are removed. */
	renderDomAttributes: function() {
		this.attributesToNode(this.domAttributes);
	},
	/** Renders our styles to an existing node. Ignores null-valued styles, and overwrites existing styles on the node (i.e. style.cssText is replaced). */
	renderDomStyles: function() {
		this.stylesToNode(this.domStyles);
	},
	/** Renders our content to the innerHTML of an existing node. */
	renderDomContent: function() {
		// FIXME: generates node references (old references are strictly invalid now)
		// so node invalidation methods are in the wrong place.
		this.node.innerHTML = this.getInnerHtml();
	},
	/** Renders attributes, styles, and content to an existing DOM node. */
	renderDom: function() {
		this.renderDomAttributes();
		this.renderDomStyles();
		this.renderDomContent();
	},
	/** Generates a DOM node and renders ourselves to it. If we already have a node, it's removed from DOM. The new node is returned without being inserted into DOM. */
	renderNode: function() {
		// NOTE: disallow rendering a node if there is no parent node, as we will
		// end up with an orphaned node. Although this is not obviously an error
		// state, too much of the rendering code assumes that nodes are
		// rendered in-order. Rendering a node before it's parent is therefore
		// a no-no.
		if (this.getParentNode()) {
			this.teardownRender();
			this.createNode();
			// FIXME: oddfellow, maybe roll into a createNode override
			this.generated = true;
			this.renderDom();
			this.rendered();
		}
	},
	//* @public
	//* Renders this object into DOM, generating a DOM node if needed.
	render: function() {
		if (this.hasNode()) {
			this.renderDom();
			this.rendered();
		} else {
			this.renderNode();
		}
	},
	//* @protected
	//* Renders the contents of this object into DOM, but is a no-op if this object has no DOM node.
	// FIXME: DEPRECATED: micro-optimization vs. render, not worth the confusion
	renderContent: function() {
		if (this.hasNode()) {
			this.renderDomContent();
			this.rendered();
		}
	},
	//* @public
	//* Renders this object into the existing DOM node referenced by _inParentNode_.
	renderInto: function(inParentNode) {
		// clean up render flags and memoizations
		this.teardownRender();
		// inParentNode can be a string id or a node reference
		var pn = enyo.byId(inParentNode);
		// 1: fit to nodes with non-auto height (NOTE: webkit td's have "0px" when unsized)
		var cs = window.getComputedStyle(pn, null);
		if (cs.height !== "auto" && cs.height !== "0px") {
			this.addClass(enyo.fittingClassName);
		}
		// 2: fit if rendering into body
		else if (pn == document.body) {
			this.addClass(enyo.fittingClassName);
		}
		// generate our HTML
		pn.innerHTML = this.generateHtml();
		// post-rendering tasks
		this.rendered();
		// return this to support method chaining
		return this;
	},
	/**
		Called whenever this object has been rendered. Override this method to perform
		tasks that require access to an actual DOM node.

			rendered: function() {
				this.inherited(arguments);
				if (this.hasNode()) {
					this.nodeHeight = this.node.offsetHeight;
				}
			}
	*/
	rendered: function() {
	},
	//* @public
	/** Shows this node (alias for _setShowing(true)_). */
	show: function() {
		this.setShowing(true);
	},
	/** Hides this node (alias for _setShowing(false)_). */
	hide: function() {
		this.setShowing(false);
	}
});

//* @protected
enyo.fittingClassName = "enyo-fit";

//* @protected
/**
	Converts a hash to an HTML string suitable for CSS styleText. Names are CSS property names (not camel-case).

		// returns 'position: relative; color: red'
		enyo.stylesToHtml({position: "relative", color: "red", "font-family": null})
*/
enyo.stylesToHtml = function(inStyles) {
	var n, v, h = '';
	for (n in inStyles) {
		v = inStyles[n];
		if ((v !== null) && (v !== undefined) && (v !== "")) {
			// remove underscores
			// FIXME: we used to use underscores for some
			// special style marking, removing as I believe 
			// this is vestigial
			//n = n.replace(/_/g, "");
			h +=  n + ':' + v + ';';
		}
	}
	return h;
};

/**
	Converts a hash to an HTML string suitable for an HTML tag.

		// returns 'name="include" type="checkbox"'
		enyo.attributesToHtml({name: "include", type: "checkbox", "checked": null})
*/
enyo.attributesToHtml = function(inAttributes) {
	// inAttributes is a map of attribute names to values
	// names with null values are omitted from output
	var n, v, h = '';
	for (n in inAttributes) {
		v = inAttributes[n];
		if (v !== null && v !== "") {
			if (n == "className") {
				n = "class";
			}
			h += ' ' + n + '="' + enyo.string.escapeHtmlAttribute(v) + '"';
		}
	}
	return h;
};
