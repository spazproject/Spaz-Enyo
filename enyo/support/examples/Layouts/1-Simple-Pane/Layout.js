/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.Layout",
	kind: enyo.Pane,
	className: "layout",
	components: [
		{kind: "Scroller", components: [
			{kind: "HtmlContent", srcId: "view0", className: "view0"}
		]},
		{kind: "Scroller", components: [
			{kind: "HtmlContent", srcId: "view1", className: "view1"}
		]},
		{kind: "Scroller", className: "view2-scroller", components: [
			{kind: "HtmlContent", srcId: "view2", className: "view2"}
		]},
		{kind: "Scroller", className: "view2-scroller", components: [
			{style: "background-image: url(top-shadow.png)", height: "10px"},
			{kind: "HtmlContent", srcId: "view2", className: "view2", style: "padding: 0;"},
			{style: "background-image: url(bottom-shadow.png)", height: "10px"}
		]}
	],
	clickHandler: function() {
		this.next();
	}
});