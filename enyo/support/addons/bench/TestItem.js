/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.kind({
	name: "enyo.TestItem",
	className: "enyo-test-item",
	kind: enyo.HFlexBox,
	published: {
		test: {}
	},
	chrome: [
		{name: "label", flex: 1},
		{name: "result", className: "enyo-test-item-result"}
	],
	runTest: function() {
		var n = this.test.name;
		//this.log(n);
		if (this.test.config) {
			var r = enyo.test.run(n, this.test.config);
			this.$.result.applyStyle("background", r.pass ? "lightgreen" : "tomato");
			var m = enyo.isString(r.message) ? r.message : (r.pass ? "Pass" : "Fail");
			if (r.pass && (r.timePer || r.time)) {
				m = (r.timePer || r.time).toFixed(2) + "ms";
				if (r.timePer) {
					m += "/per";
				}
			};
			this.$.result.setContent(m);
			n = !r.count ? n : n + " (" + r.count + ")";
		} else {
			this.addClass("enyo-test-item-divider");
		}
		this.$.label.setContent(n);
	}
});