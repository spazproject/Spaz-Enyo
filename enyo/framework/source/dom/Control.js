/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	enyo.Control is a Component descendent that can be represented visually and can receive UI events.

	Typically, a Control's visual representation corresponds to a node (and all its children) in DOM,
	but you are highly encouraged to consider only the higher level Control and Component hierarchies when
	designing Enyo applications, since these representations are much simpler than the actual DOM.

	Control inherits from DomBuilder the ability to maintain its state, whether it's been rendered (represented 
	in DOM) or not. This virtualization lets Enyo optimize actual DOM access and, in most cases, frees the 
	coder from having to worry about DOM state.
*/
enyo.kind({
	name: "enyo.Control",
	kind: enyo.ContainedDomBuilder,
	published: {
		layoutKind: ""
	},
	// events
	// NOTE: DOM events that are attached to Dispatcher are automatically
	// forwarded as events.
	// Any event of "type" will look for an "ontype" property and dispatch
	// to that delegate.
	// Unregistered DOM events won't have a do<Type> to call, but one can
	// use 'fire' to send to a delegate.
	events: {
		onclick: "",
		onmousedown: "",
		onmouseup: ""
	},
	//* @protected
	controlParentName: "client",
	defaultKind: "Control",
	constructor: function() {
		this.controls = [];
		this.children = [];
		this.inherited(arguments);
	},
	create: function() {
		this.inherited(arguments);
		this.registerEvents();
		this.layoutKindChanged();
	},
	destroy: function() {
		this.unregisterEvents();
		this.destroyControls();
		this.inherited(arguments);
	},
	importProps: function(inProps) {
		this.inherited(arguments);
		if (!this.owner) {
			//this.log("registering ownerless control [" + this.kindName + "] with enyo.master");
			this.owner = enyo.master;
		}
	},
	registerEvents: function() {
		if (this.wantsEvents) {
			enyo.$[this.id] = this;
		}
	},
	unregisterEvents: function() {
		delete enyo.$[this.id];
	},
	initComponents: function() {
		this.createChrome(this.chrome);
		this.inherited(arguments);
	},
	discoverControlParent: function() {
		this.controlParent = this.$[this.controlParentName] || this.controlParent;
	},
	createComponents: function() {
		this.inherited(arguments);
		this.discoverControlParent();
	},
	createChrome: function(inInfos) {
		this.createComponents(inInfos, {isChrome: true});
	},
	adjustComponentProps: function(inProps) {
		this.inherited(arguments);
		inProps.container = inProps.container || this;
	},
	addControl: function(inControl) {
		inControl.parent = inControl.parent || this;
		this.controls.push(inControl);
	},
	getInstanceOwner: function() {
		return this.owner != enyo.master ? this.owner : this;
	},
	//* @protected
	removeControl: function(inControl) {
		return enyo.remove(inControl, this.controls);
	},
	//* @public
	/**
		Returns the index of a given managed control in a component's list of controls.
		@param inControl {Component} A managed control.
		@errata Current implementation returns index in this.controls, but index in this.getControls() makes more sense.
	*/
	indexOfControl: function(inControl) {
		return enyo.indexOf(inControl, this.controls);
	},
	/**
		Returns the 'non-private managed controls', which is not actually
		the same as the 'controls' array (note: this is a problem of taxonomy).
	*/
	getControls: function() {
		var results = [];
		for (var i=0, cs=this.controls, c; c=cs[i]; i++) {
			if (!c.isChrome) {
				results.push(c);
			}
		}
		return results;
	},
	/**
		Destroys 'managed controls', the same set of controls returned by getControls.
	*/
	destroyControls: function() {
		var c$ = this.getControls();
		for (var i=0, c; c=c$[i]; i++) {
			c.destroy();
		}
	},
	/**
		Send a message to me and all my controls
	*/
	// TODO: we probably need this functionality at the component level,
	// but the Component-owner tree is different but overlapping with respect
	// to the Control-parent tree.
	broadcastMessage: function(inMessageName, inArgs) {
		var fn = inMessageName + "Handler";
		if (this[fn]) {
			//this.log(this.name + ": ", inMessageName);
			return this[fn].apply(this, inArgs);
		}
		this.broadcastToControls(inMessageName, inArgs);
	},
	/**
		Call after this control has been resized to allow it to process the size change.
		Implement a "resizeHandler" method to respond to being resized.
	*/
	// syntactic sugar for 'broadcastMessage'
	resized: function() {
		this.broadcastMessage("resize");
	},
	//* @protected
	/**
		Send a message to all my controls
	*/
	broadcastToControls: function(inMessageName, inArgs) {
		for (var i=0, cs=this.controls, c; c=cs[i]; i++) {
			c.broadcastMessage(inMessageName, inArgs);
		}
	},
	resizeHandler: function() {
		this.broadcastToControls("resize");
	},
	addChild: function(inChild) {
		// Re-parenting must be done in addChild so that recursive
		// re-parenting can occur.
		// My controlParent might have a controlParent ad nauseum.
		if (this.controlParent && !inChild.isChrome) {
			this.appendControlParentChild(inChild);
		} else {
			if (inChild.prepend) {
				this.prependChild(inChild);
			} else {
				this.appendChild(inChild);
			}
		}
	},
	appendControlParentChild: function(inChild) {
		// The parent property must be set to reflect the new parent, but calling setParent
		// will call removeChild which is a lot of busy work.
		// addChild will automagically reset inChild.parent for us, as discussed below.
		this.controlParent.addChild(inChild);
	},
	appendChild: function(inChild) {
		inChild.parent = this;
		this.children.push(inChild);
		// FIXME: hacky, allows us to reparent a rendered control; we need better API for dynamic reparenting
		if (inChild.hasNode()) {
			inChild._append();
		}
	},
	prependChild: function(inChild) {
		inChild.parent = this;
		this.children.unshift(inChild);
		// FIXME: hacky, allows us to reparent a rendered control; we need full API for dynamic reparenting
		if (inChild.hasNode()) {
			inChild._prepend();
		}
	},
	indexOfChild: function(inChild) {
		return enyo.indexOf(inChild, this.children);
	},
	removeChild: function(inChild) {
		return enyo.remove(inChild, this.children);
	},
	layoutKindChanged: function() {
		if (this.layout) {
			this.destroyObject("layout");
		}
		this.createLayoutFromKind(this.layoutKind);
	},
	createLayoutFromKind: function(inKind) {
		var ctor = inKind && enyo.constructorForKind(inKind);
		if (ctor) {
			this.layout = new ctor(this);
		}
	},
	// FIXME: non-ideal
	// Our non-private controls can end up parented by some sub-control.
	// Iow, our controlParent may have a controlParent, etc. 
	// For now, it's easier to ask a control "who is parenting you" than to calculate
	// who the parent would be in the abstract.
	/*
	getEmpiricalChildParent: function() {
		var c = this.getControls()[0];
		return (c && c.parent) || this.controlParent || this;
	},
	*/

	teardownRender: function() {
		this.teardownChildren();
		this.inherited(arguments);
	},
	teardownChildren: function() {
		if (this.generated) {
			for (var i=0, c; c=this.children[i]; i++) {
				c.teardownRender();
			}
		}
	},
	flow: function() {
		if (this.layout) {
			this.layout.flow(this);
		}
	},
	flowControls: function() {
		if (this.controlParent) {
			this.controlParent.flowControls();
		} else {
			this.flow();
		}
	},
	generatedFlow: function() {
		if (this.generated) {
			this.flow();
		}
	},
	getChildContent: function() {
		var results = '';
		for (var i=0, c; c=this.children[i]; i++) {
			results += c.generateHtml(); 
		}
		return results;
	},
	getInnerHtml: function() {
		this.flow();
		return this.getChildContent() || this.content;
	},
	render: function() {
		// if it is generated, flow parent when rendering;
		// if not, we expect parent to render.
		if (this.parent) {
			this.parent.generatedFlow();
		}
		this.inherited(arguments);
	},
	renderDom: function() {
		this.teardownChildren();
		this.inherited(arguments);
	},
	renderContent: function() {
		this.teardownChildren();
		this.inherited(arguments);
	},
	rendered: function() {
		this.inherited(arguments);
		this.childrenRendered();
	},
	childrenRendered: function() {
		for (var i=0, c; c=this.children[i]; i++) {
			c.rendered(); 
		}
	},
	getPublishedList: function() {
		return this.ctor.publishedList || this.makePublishedList();
	},
	makePublishedList: function() {
		var props = {showing: "", className: "", content: ""};
		var proto = this.ctor.prototype;
		var p = proto;
		while (p && (p != enyo.Control.prototype)) {
			enyo.mixin(props, p.published);
			p = p.base && p.base.prototype;
		}
		return this.ctor.publishedList = props;
	}
});

//* @protected
// bind global ids to Control references
// NOTE: Controls (that wantEvents) will not GC unless explicity destroyed as they will be referenced in this hash
enyo.$ = {};

// Default owner for ownerless-Controls to allow notifying such Controls of important system events
// like window resize.
// NOTE: such Controls will not GC unless explicity destroyed as they will be referenced by this owner
enyo.master = new enyo.Component();

// enyo.create will default to this constructor (NOTE: this is NOT a default for enyo.kind() [because 'null' is a valid base kind])
enyo.defaultKind = enyo.defaultCtor = enyo.Control;
