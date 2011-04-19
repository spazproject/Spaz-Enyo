/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.Slider",
	kind: HeaderView,
	components: [
		{kind: "RowGroup", components: [
			{kind: "VFlexBox", tapHighlight: false, components: [
				{content: "Ringer Volume"},
				{kind: "Slider", position: 20}
			]},
			{kind: "VFlexBox", tapHighlight: false, components: [
				{content: "System Volume"},
				{kind: "Slider", position: 20}
			]}
		]}
	]
});