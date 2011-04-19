/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.VirtualSlidingPane",
	kind: enyo.SlidingPane,
	events: {
		onGetLeft: "",
		onGetRight: ""
	},
	multiViewMinWidth: -1,
	multiView: false,
	components: [
		{name: "left"},
		{name: "center"},
		{name: "right"}
	],
	index: 0,
	create: function() {
		this.inherited(arguments);
		this.lastIndex = this.index;
	},
	multiViewChanged: function() {
		// disallow changes
		if (!this.multiView) {
			this.inherited(arguments);
		}
	},
	_selectView: function(inView) {
		if (this.canSelectView(inView)) {
			this.inherited(arguments);
			this.updateIndex();
		}
	},
	canSelectView: function(inView) {
		return !this.generated || (inView && this.getViewContentControl(inView));
	},
	findDraggable: function(inDx) {
		var r = this.inherited(arguments);
		var n = (inDx > 0) ? this.view.getPreviousSibling() : this.view.getNextSibling();
		return (!n || this.canSelectView(n)) && r;
	},
	updateIndex: function() {
		if (this.lastView && this.view != this.$.center) {
			this.lastIndex = this.index;
			this.index += this.view == this.$.right ? 1 : -1;
		}
	},
	setCenterView: function(inConfig) {
		this.selectViewImmediate(this.$.center);
		this.newView(this.$.left, this.doGetLeft(false));
		this.newView(this.$.center, inConfig);
		this.newView(this.$.right, this.doGetRight(false));
	},
	slideComplete: function() {
		if (this.view != this.$.center && this.lastView) {
			this.adjustViews();
			this.selectViewImmediate(this.$.center);
			this.inherited(arguments);
		}
	},
	adjustViews: function() {
		if (this.index == this.lastIndex) {
			return;
		}
		var goRight = this.index > this.lastIndex;
		var config = this["doGet" + (goRight ? "Right" : "Left")](true);
		var c = this.getViewContentControl(this.$.center);
		if (c) {
			var v1 = goRight ? this.$.right : this.$.left;
			var v2 = goRight ? this.$.left : this.$.right;
			this.moveView(this.getViewContentControl(v1), this.$.center);
			this.newView(v1, config);
			v2.destroyControls();
			this.moveView(c, v2);
			return config;
		}
	},
	getViewContentControl: function(inView) {
		return inView.getControls()[0];
	},
	moveView: function(inControl, inContainer) {
		inControl.setManager(inContainer);
		// FIXME: needed to be able to actually move the node.
		inControl.hasNode();
		inControl.setParent(inContainer.$[inContainer.controlParentName]);
	},
	newView: function(inControl, inConfig) {
		inControl.destroyControls();
		if (inConfig) {
			inControl.createComponent(inConfig, {owner: this.owner});
			inControl.renderContent();
		}
	},
	back: function(e) {
		this.view.selectPrevious();
		e && e.preventDefault();
	},
	next: function() {
		this.view.selectNext();
	}
});