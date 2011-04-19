/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.CanonSliding",
	kind: enyo.VFlexBox,
	components: [
		{name: "slidingPane", kind: "VirtualSlidingPane", flex: 1, 
			onSelect: "slidingSelected",
			onSlideComplete: "slideComplete",
			onGetLeft: "getLeft",
			onGetRight: "getRight",
		}
	],
	create: function() {
		this.inherited(arguments);
		var sg = this.$.slidingPane;
		sg.setCenterView(this.makeConfig(sg.index));
	},
	makeConfig: function(inIndex) {
		return {kind: "CanonSlidingView", caption: inIndex, index: inIndex, onNext: "next", onPrevious: "backHandler"};
	},
	slidingSelected: function(inSender) {
		this.log(inSender.id);
	},
	slideComplete: function(inSender) {
		this.log();
	},
	getLeft: function(inSender) {
		var i = inSender.index - 1;
		if (i > -3) {
			return this.makeConfig(i);
		}
	},
	getRight: function(inSender) {
		var i = inSender.index + 1;
		if (i < 3) {
			return this.makeConfig(i);
		}
	},
	next: function() {
		this.$.slidingPane.next();
	},
	backHandler: function(inSender, e) {
		this.$.slidingPane.back(e);
	},
	resizeHandler: function() {
		this.$.slidingPane.resize();
	}
});