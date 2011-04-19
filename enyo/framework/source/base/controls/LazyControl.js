/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	NOTE: This control is experimental and should not be used.
*/
enyo.kind({
	name: "enyo.LazyControl",
	kind: enyo.Control,
	//* @protected
	config: {},
	//showing: false,
	hasKind: function() {
		if (!this.config) {
			return this;
		} else {
			this.log("Energizing", this.name)
			var m = this.manager;
			var i = m.indexOfControl(this);
			// FIXME: including owner as a hack for controls like stage that chnage manager to a chrome control
			if (m.name == "client") {
				m = m.manager;
			}
			this.destroy();
			var c = this.createControl(m);
			this.moveControl(c.manager, c, i);
			this.renderControl(m, c);
			return c;
		}
	},
	createControl: function(inManager) {
		this.config.name = this.name;
		var c = inManager.createComponent(this.config);
		// NOTE: convenience function to stick on control to tell it's been initialized
		if (!c.hasKind) {
			c.hasKind = function() { return true; };
		}
		return c;
	},
	// FIXME: should be a feature of Control
	moveControl: function(inManager, inControl, inIndex) {
		enyo.Control.prototype.removeControl.apply(inManager, [inControl]);
		inManager.controls.splice(inIndex, 0, inControl);
	},
	/*renderControl: function(inManager, inControl) {
		// FIXME: WebView doesn't like to be re-rendered.
		inManager.render();
	},*/
	// FIXME: experimental re-rendering which will replace node in place rather than
	// re-rendering manager. (specifically for controls which cannot be re-rendered, like webview!)
	renderControl: function(inManager, inControl) {
		if (this.hasNode()) {
			if (inManager.layout) {
				inManager.layout.flow(inManager);
			}
			if (inManager.flow) {
				inManager.flow();
			}
			var h = inControl.generateHtml();
			var d = document.createElement('div');
			d.innerHTML = h;
			var n = inControl.node = d.firstChild;
			this.node.parentNode.replaceChild(n, this.node);
			inControl.rendered();
		}
	},
	destroy: function() {
		this.setManager(null);
		// don't call this, removes dom node.
		//this.inherited(arguments);
	}
});

//* @protected
enyo.kind({
	name: "enyo.LazyControl2",
	kind: enyo.Control,
	createComponent: function(inInfo, inMoreInfo) {
		if (!inInfo.lazy) {
			return this.inherited(arguments);
		}
	},
	findByName: function(inName, inList) {
		for (var i=0, c; c=inList[i]; i++) {
			if (c.name == inName) {
				return c;
			}
		}
	},
	hasComponent: function(inName) {
		if (!this.$[inName] && !this.findByName(inName, this.controls)) {
			var p = this.findByName(inName, this.components);
			if (p) {
				p.lazy = false;
				var c = this.createComponent(p);
				if (c.parent) {
					c.parent.flow();
					c.render();
				}
				return c;
			}
		}
	}
});
