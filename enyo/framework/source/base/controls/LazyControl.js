/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	A control that optionally defers creation of its components based on the setting of the lazy property.
	Call validateComponents to create and render components.
*/
enyo.kind({
	name: "enyo.LazyControl",
	kind: enyo.Control,
	lazy: true,
	initComponents: function() {
		if (!this.lazy) {
			this.inherited(arguments);
			this.componentsReady();
		}
	},
	/**
		Called after components are initialized. Use for initialization instead of create.
	*/
	componentsReady: function() {
	},
	/**
		Ensure components are created.
	*/
	validateComponents: function() {
		if (this.lazy) {
			this.lazy = false;
			//enyo.time("create");
			this.initComponents();
			// um, we may have created a control parent for our owner (if it is a control)!
			if (this.owner && this.owner.discoverControlParent) {
				this.owner.discoverControlParent();
			}
			//var c = enyo.timeEnd("create"), r=0;
			if (this.hasNode()) {
				//enyo.time("render");
				this.render();
				//r = enyo.timeEnd("render");
			}
			//this.log("create", c, "render", r, "total", (c + r));
		}
	}
});
