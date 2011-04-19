/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "toolbar.ToolButtons",
	kind: HeaderView,
	noScroller: true,
	components: [
		{flex: 1},
		{kind: "Toolbar", components: [
			{caption: "Tool Buttons"},
			{kind: "Spacer"},
			{caption: "Foo"},
			{kind: "Spacer"},
			{caption: "Donut"}
		]}
	]
});