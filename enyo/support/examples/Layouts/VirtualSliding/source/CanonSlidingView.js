/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "CanonSlidingView",
	kind: "VFlexBox",
	flex: 1, 
	published: {
		caption: ""
	},
	events: {
		onNext: "",
		onPrevious: ""
	},
	components: [
		{kind: "Header"},
		{flex: 1},
		{kind: "Toolbar", components: [
			{caption: "Prev", onclick: "doPrevious"},
			{caption: "Next", onclick: "doNext"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.captionChanged();
	},
	captionChanged: function() {
		this.$.header.setContent(this.caption);
	}
});
