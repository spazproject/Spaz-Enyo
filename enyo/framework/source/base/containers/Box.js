/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Box",
	kind: enyo.Control,
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.addClass("enyo-box");
	},
	_flow: function(measure, mAttr, nAttr, pAttr, qAttr, boxClass) {
		var ex, m = 0, b = {}, p = ("pad" in this) ? Number(this.pad) : 0, c;
		b[pAttr] = p;
		b[qAttr] = p;
		var c$ = this.children;
		for (var i=0; (c=c$[i]); i++) {
			m += p;
			c.addClass(boxClass + "-div");
			if (c[measure] == "fill" || c[measure] == "100%") {
				break;
			}
			b[measure] = ex = Number(c[measure]) || 96;
			b[mAttr] = m;
			c.setBox(b, this.unit);
			m += ex;
		}
		delete b[mAttr];
		if (c) {
			var client = c, n = 0;
			for (i=c$.length-1; c=c$[i]; i--) {
				c.addClass(boxClass + "-div");
				//c.className += boxClass + "-div";
				//c.domAttributes.className += boxClass + "-div";
				n += p;
				if (c == client) {
					break;
				}
				b[measure] = ex = Number(c[measure]) || 96;
				b[nAttr] = n;
				c.setBox(b, this.unit);
				n += ex;
			}
			delete b[measure];
			b[mAttr] = m;
			b[nAttr] = n;
			client.setBox(b, this.unit);
		}
	},
	flow: function() {
		if (this.orient == "h") {
			this._flow("w", "l", "r", "t", "b", "enyo-hbox");
		} else {
			this._flow("h", "t", "b", "l", "r", "enyo-vbox");
		}
	},
	getInnerHtml: function() {
		this.flow();
		return this.inherited(arguments);
	}
});

enyo.kind({
	name: "enyo.HBox",
	kind: enyo.Box,
	orient: "h"
});

enyo.kind({
	name: "enyo.VBox",
	kind: enyo.Box,
	orient: "v"
});
