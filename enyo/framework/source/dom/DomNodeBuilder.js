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
	name: "enyo.AbstractDomNodeBuilder",
	kind: enyo.DomNode,
	//* @protected
	content: "",
	generated: false,
	//* @public
	/** Type name of the Element created by this Builder. */
	nodeTag: "div",
	//* @protected
	hasNode: function() {
		return this.generated ? this.node || this.findNodeById() : null;
	},
	/** Returns HTML that is rendered by this Builder. By default, returns <i>this.content</i>.*/
	getContent: function() {
		return this.content;
	},
	/**
		Generates HTML that renders this node.
	*/
	generateHtml: function() {
		this.generated = true;
		if (this.canGenerate === false) {
			return '';
		}
		// do this first in case content generation affects styles or attributes
		var c = this.getContent();
		var h = '<' 
			+ this.nodeTag
			+ enyo.attributesToHtml(this.getDomAttributes());
		var s = (this.style ? this.style + ";" : "") + enyo.stylesToHtml(this.getDomStyles());
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
		return h;
	},
	//* @protected
	/** Renders our attributes to an existing node. Null-valued attributes are removed. */
	renderDomAttributes: function() {
		this.attributesToNode(this.getDomAttributes());
	},
	/** Renders our styles to an existing node. Ignores null-valued styles, and overwrites existing styles on the node (i.e. style.cssText is replaced). */
	renderDomStyles: function() {
		this.stylesToNode(this.getDomStyles());
	},
	/** Renders our content to the innerHTML of an existing node. */
	renderDomContent: function() {
		this.node.innerHTML = this.getContent();
	},
	/** Renders attributes, styles, and content to an existing DOM node. */
	renderDom: function() {
		this.renderDomAttributes();
		this.renderDomStyles();
		this.renderDomContent();
	},
	/** Generates a DOM node and renders ourselves to it. If we already have a node, it's removed from DOM. The new node is returned without being inserted into DOM. */
	renderNode: function() {
		this.generated = true;
		this.createNode();
		this.renderDom();
		this.rendered();
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
	renderContent: function() {
		if (this.hasNode()) {
			this.renderDomContent();
			this.rendered();
		}
	},
	//* @public
	//* Renders this object into the existing DOM node referenced by _inParentNode_.
	renderInto: function(inParentNode) {
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
	}
});

//* @protected

enyo.fittingClassName = "enyo-fit";

//* @public
enyo.kind({
	name: "enyo.DomNodeBuilder",
	kind: enyo.AbstractDomNodeBuilder,
	//* @protected
	/** Concrete version of AbstractNodeBuilder maintains internal hashes of domStyles and domAttributes. */
	constructor: function() {
		this.inherited(arguments);
		// we have to clone these hashes because the originals belong to the prototype
		this.domStyles = enyo.clone(this.domStyles || {});
		this.domAttributes = enyo.clone(this.domAttributes || {});
	},
	/** Returns CSS styles rendered by this Builder. In this class, returns <i>this.domStyles</i>. */
	getDomStyles: function() {
		return this.domStyles;
	},
	/** Returns HTML attributes rendered by this Builder. In this class, returns <i>this.domAttributes</i>. */
	getDomAttributes: function() {
		return this.domAttributes;
	}
});

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
		n = n.replace(/_/g, "");
		if ((v !== null) && (v !== undefined) && (v !== "")) {
			if (enyo.isIE && n == 'opacity') {
				if (v >= 0.99) {
					continue;
				}
				n = 'filter';
				v = "progid:DXImageTransform.Microsoft.Alpha(opacity=" + Math.floor(v*100) + ")";
			}
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
		if (n == "className") {
			n = "class";
		}
		if (v !== null && v !== "") {
			h += ' ' + n + '="' + v + '"';
		}
	}
	return h;
};
