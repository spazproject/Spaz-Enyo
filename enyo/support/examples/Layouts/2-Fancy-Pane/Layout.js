/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.Layout",
	kind: enyo.VFlexBox,
	className: "layout",
	components: [
		{content: "Header", className: "text"},
		{flex: 1, kind: "Pane", className: "pane", components: [
			{kind: "HFlexBox", className: "view0", components: [
				{content: "Left Panel", className: "text"},
				{flex: 1, kind: "Scroller", components: [
					{flex: 1, kind: "HtmlContent", srcId: "view0", className: "view0-content"}
				]}
			]},
			{kind: "Scroller", className: "view2-scroller", components: [
				{kind: "HtmlContent", srcId: "view1", className: "view1"}
			]},
			{kind: "Scroller", className: "view2-scroller", components: [
				{kind: "HtmlContent", srcId: "view2", className: "view2"}
			]}
		]},
		{content: "Footer", className: "text"}
	],
	clickHandler: function() {
		this.$.pane.next();
	}
});