/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.Sliders",
	kind: HeaderView,
	components: [
		{kind: "Divider", caption: "EXAMPLES"},
		{kind: "ViewItem", className: "enyo-first", viewKind: "widgets.Slider",
			title: "Slider"},
		{kind: "ViewItem", className: "enyo-last", viewKind: "widgets.ProgressSlider",
			title: "Progress Slider"}
	]
});