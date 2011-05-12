/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	enyo.DomNode is an HTML DomNode abstraction.

	enyo.DomNode is designed to represent much of the state of a DomNode,
	including nodeTag, attributes, and styles without needing to be mapped
	to an actual node in DOM.

	Virtualizing the DOM in this way allows us to optimize DOM rendering by 
	managing changes in enyo.DomNode objects and propagating those
	changes into the actual document only when necessary or convenient. 
	Additionally, it serves as a local cache for certain information that can
	be costly to gather directly from the DOM itself.

	Controls in Enyo are an extension of Components into the UI realm.
	enyo.DomNode is the first step in crafting Component into Control.
*/
enyo.kind({
	name: "enyo.DomNode", 
	kind: enyo.Component,
	published: {
		//* Controls the display of this object.
		showing: true,
		prepend: false
	},
	//* @protected
	node: null,
	create: function() {
		this.inherited(arguments);
		this.showingChanged();
	},
	destroy: function() {
		this._remove();
		this.inherited(arguments);
	},
	_append: function() {
		if (this.node) {
			var pn = this.getParentNode();
			if (pn) {
				pn.appendChild(this.node);
			}
		}
	},
	_prepend: function() {
		if (this.node) {
			var pn = this.getParentNode();
			if (pn) {
				pn.insertBefore(this.node, pn.firstChild);
			}
		}
	},
	_insert: function(inBeforeNode) {
		if (this.node) {
			var pn = this.getParentNode();
			if (pn) {
				pn.insertBefore(this.node, inBeforeNode);
			}
		}
	},
	_remove: function() {
		if (this.hasNode() && this.node.parentNode) {
			this.node.parentNode.removeChild(this.node);
		}
	},
	addToParentNode: function() {
		if (this.prepend) {
			this._prepend();
		} else {
			this._append();
		}
	},
	setNode: function(inNode) {
		this.node = inNode;
		//return (this.node = enyo.byId(inNode));
		//this.nodeStyle = this.node.style;
	},
	createNode: function() {
		this.node = document.createElement(this.nodeTag);
		this.addToParentNode();
	},
	findNodeById: function() {
		return this.id && (this.node = enyo.byId(this.id));
	},
	//* @public
	/**
		This returns the DOM node that has been created and rendered for the object.  If this node
		doesn't exist, it returns null.  After this call, the _node_ property will be valid and 
		can be checked directly.
		
		If hasNode() isn't null, the _node_ property refers to a valid
		DOM node; otherwise, the _node_ property should not be accessed.

		A DomNode object will only have a valid _node_ after 
		it has been rendered.

			if (this.hasNode()) {
				console.log(this.node.nodeType);
			}
	*/
	hasNode: function() {
		return this.node || (this.id && this.findNodeById());
	},
	//* @protected
	// FIXME: parentNode stuff vestigial?
	getParentNode: function() {
		return enyo.byId(this.parentNode);
	},
	/**
		Sets our node's parentNode. Input can be a string id, a DOM node reference, or null.
		Removes a node from the DOM by sending null. Does nothing if this.node is null.
	*/
	setParentNode: function(inParentNode) {
		//if (this.node && inParentNode) {
		//	enyo.byId(inParentNode).appendChild(this.node);
		//} else if (this.node && this.node.parentNode) {
		if (!inParentNode) {
			this._remove();
		}
		this.parentNode = inParentNode;
		this._append();
	},
	//* Appends inNode to our node's children.
	appendChildNode: function(inNode) {
		if (inNode && this.hasNode()) {
			this.node.appendChild(inNode);
		}
	},
	//* Inserts inNode at integer index inAt in our node's list of children.
	insertNodeAt: function(inNode, inAt) {
		var sib = this.node.childNodes[inAt];
		this.node.insertBefore(inNode, sib);
	},
	getBounds: function() {
		var n = this.node || this.hasNode() || 0;
		return {left: n.offsetLeft, top: n.offsetTop, width: n.offsetWidth, height: n.offsetHeight};
	},
	addCssText: function(inCssText) {
		// remove spaces between rules, then split rules on delimiter (;)
		var sa = inCssText.replace(/; /g, ";").split(";");
		// parse string styles into name/value pairs
		for (var i=0, s, n, v; s=sa[i]; i++) {
			// "background-image: url(http://foo.com/foo.png)" => ["background-image", "url(http", "//foo.com/foo.png)"]
			s = s.split(":");
			// n = "background-image", s = ["url(http", "//foo.com/foo.png)"]
			n = s.shift();
			// v = ["url(http", "//foo.com/foo.png)"].join(':') = "url(http://foo.com/foo.png)"
			v = s.length > 1 ? s.join(':') : s[0];
			// store name/value pair
			this.domStyles[n] = v;
		}
	},
	//* @public
	// FIXME: need to update style handling vis DomNodeBuilder and AbstractDomBuilder
	// which have vestigial (?) features (aka getDomStyles, getDomAttributes)
	// domStyles should not even a concept for this class
	setDomStyles: function(inDomStyles) {
		this.domStyles = inDomStyles;
		this.domStylesChanged();
	},
	domStylesChanged: function() {
		if (this.hasNode()) {
			this.stylesToNode(this.domStyles);
		}
	},
	/**
		Adds CSS styles to the set of styles assigned to this object.

		_inStyles_ is a string containing CSS styles in text format.

			this.$.box.addStyles("background-color: red; padding: 4px;");
	*/
	addStyles: function(inStyles) {
		this.addCssText(inStyles);
		this.domStylesChanged();
		/*
		if (this.hasNode()) {
			//this.renderDomStyles();
			this.stylesToNode(this.domStyles);
		}
		*/
	},
	/**
		Applies a single style value to this object.

			this.$.box.applyStyle("z-index", 4);

		You can remove a style (restore it to default) by setting its value to null.

			this.$.box.applyStyle("z-index", null);
	*/
	applyStyle: function(inStyle, inValue) {
		this.domStyles[inStyle] = inValue;
		this.domStylesChanged();
		/*
		if (this.hasNode()) {
			this.stylesToNode(this.domStyles);
		}
		*/
	},
	/**
		Replaces the set of CSS styles assigned to this object.

		_inStyles_ is a string containing CSS styles in text format.

			this.$.box.setStyles("color: black;");
	*/
	setStyle: function(inStyle) {
		this.domStyles = {};
		this.addStyles(inStyle);
	},
	/** Shows this node (alias for _setShowing(true)_). */
	show: function() {
		this.setShowing(true);
	},
	/** Hides this node (alias for _setShowing(false)_). */
	hide: function() {
		this.setShowing(false);
	},
	//* @protected
	showingChanged: function() {
		var ds = this.domStyles;
		if (this.showing) {
			// note: only show a node if it's actually hidden
			// this way we prevent overriding the value of domStyles.display
			if (ds.display == "none") {
				ds.display = this._displayStyle || "";
			}
		} else {
			// cache the previous showing value of display
			// note: we could use a class to hide a node, but then
			// hide would not override a setting of display: none in style, which seems bad.
			this._displayStyle = (ds.display == "none" ? "" : ds.display);
			ds.display = "none";
		}
		if (this.hasNode()) {
			this.node.style.display = ds.display;
		}
	},
	//* @public
	// FIXME: should be set/getDomClassName, but it's convenient not to have to facade these in Control; revisit later
	/**
		Replaces the _className_ attribute. The _className_ attribute represents the CSS classes assigned to this object.
		Note that a _className_ can be a string that contains multiple classes. The _className_ nomenclature comes from
		the DOM standards.

			this.$.control.setClassName("box blue-border highlighted");
	*/
	setClassName: function(inClassName) {
		this.setAttribute("className", inClassName);
	},
	/**
		Returns the _className_ attribute (string).
	*/
	getClassName: function() {
		return this.domAttributes.className || "";
	},
	/**
		Returns true if the _className_ attribute contains a class matching _inClass_.

			// returns true if _className_ is "bar foo baz", but false for "barfoobaz"
			var hasFooClass = this.$.control.hasClass("foo");
	*/
	hasClass: function(inClass) {
		return inClass && ((" " + this.getClassName() + " ").indexOf(" " + inClass + " ") >= 0);
	},
	/**
		Adds CSS class name _inClass_ to the _className_ attribute of this object.

			// add the highlight class to this object
			this.addClass("highlight");
	*/
	addClass: function(inClass) {
		if (inClass && !this.hasClass(inClass)) {
			var c = this.getClassName();
			this.setClassName(c + (c ? " " : "") + inClass);
		}
	},
	/**
		Removes CSS class name _inClass_ from the _className_ attribute of this object.

		inClass must have no leading or trailing spaces.
		
		Using a compound class name is supported, but the name is treated atomically.
		For example, given "a b c", removeClass("a b") will produce "c", but removeClass("a c") will produce "a b c".

			// remove the highlight class from this object
			this.removeClass("highlight");
	*/
	removeClass: function(inClass) {
		if (inClass && this.hasClass(inClass)) {
			var c = this.getClassName();
			c = (" " + c + " ").replace(" " + inClass + " ", " ").slice(1, -1);
			this.setClassName(c);
		}
	},
	/**
		Adds or removes CSS class name _inClass_ from the _className_ attribute of this object based
		on the value of inTrueToAdd.

			// add or remove the highlight class, depending on the "highlighted" property
			this.addRemoveClass("highlight", this.highlighted);
	*/
	addRemoveClass: function(inClass, inTrueToAdd) {
		this[inTrueToAdd ? "addClass" : "removeClass"](inClass);
	},
	/**
		Sets the value of an attribute on this object. Set _inValue_ to null to remove an attribute.

			// set the tabIndex attribute for this DomNode
			this.setAttribute("tabIndex", 3);
			// remove the index attribute
			this.setAttribute("index", null);
	*/
	setAttribute: function(inName, inValue) {
		this.domAttributes[inName] = inValue;
		if (this.hasNode()) {
			this.attributeToNode(inName, inValue);
		}
	},
	//* @protected
	attributeToNode: function(inName, inValue) {
		if (inName == "className") {
			inName = "class";
		}
		if (inValue === null) {
			this.node.removeAttribute(inName);
		} else {
			this.node.setAttribute(inName, inValue);
		}
	},
	/**
		Sets or removes attributes on this node based on input name/value pairs. 
		Null-valued attributes are removed.
	*/
	attributesToNode: function(inAttributes) {
		for (var n in inAttributes) {
			this.attributeToNode(n, inAttributes[n]);
		}
	},
	/**
		Sets the styles of this node based on input name/value pairs.
		Existing styles on the node are lost.
	*/
	stylesToNode: function(inStyles) {
		this.node.style.cssText = enyo.stylesToHtml(inStyles);
	},
	setBox: function(inBox, inUnit) {
		var s = this.domStyles, u = inUnit || "px";
		if (("w" in inBox) && inBox.w >= 0) {
			s.width = inBox.w + u;
		}
		if (("h" in inBox) && inBox.h >= 0) {
			s.height = inBox.h + u;
		}
		// IE8 errored, noting that ('l' in inBox) is true, but inBox.l == undefined
		if (inBox.l !== undefined) {
			s.left = inBox.l + u;
		}
		if (inBox.t !== undefined) {
			s.top = inBox.t + u;
		}
		if (inBox.r !== undefined) {
			s.right = inBox.r + u;
		}
		if (inBox.b !== undefined) {
			s.bottom = inBox.b + u;
		}
	},
	/**
		Helper function to set extents in pixels to an existing DOM node for any of left, top, width, or height.

		_inBox_ is an object that may contain any of the properties _l, t, w, h_. The value of each property is a number representing
		an extent in pixels.

			this.boxToNode({l: 10, w: 100});
	*/
	boxToNode: function(inBox) {
		var s = this.node.style, u = "px";
		if (("w" in inBox) && inBox.w >= 0) {
			s.width = inBox.w + u;
		}
		if (("h" in inBox) && inBox.h >= 0) {
			s.height = inBox.h + u;
		}
		// IE8 errored, noting that ('l' in inBox) is true, but inBox.l == undefined
		if (inBox.l !== undefined) {
			s.left = inBox.l + u;
		}
		// IE8 errored, noting that ('t' in inBox) is true, but inBox.t == undefined
		if (inBox.t !== undefined) {
			s.top = inBox.t + u;
		}
	}
});
