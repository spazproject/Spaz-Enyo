/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Repeater",
	kind: enyo.Control,
	events: {
		onGetItem: ""
	},
	//* @public
	build: function() {
		this.destroyControls();
		for (var i=0, config; config = this.doGetItem(i); i++) {
			var r = this.createComponent({index: i});
			r.createComponents(config, {owner: this.owner});
		}
	},
	getItemByIndex: function(inIndex) {
		return this.getControls()[inIndex];
	}
});
