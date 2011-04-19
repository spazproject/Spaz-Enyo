/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.ToggleButtons",
	kind: enyo.VFlexBox,
	components: [
		{kind: "PageHeader", components: [
			{content: "Toggle In Header", flex: 1},
			{kind: "ToggleButton", state: true, onLabel: "YES", offLabel: "NO"}
		]},
		{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
			{flex: 1, content: "Sometimes you want to present a lot of text."},
			{kind: "ToggleButton"}
		]},
		{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
			{flex: 1, content: "Disabled ToggleButton"},
			{kind: "ToggleButton", disabled: true}
		]},
		{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
			{flex: 1, content: "This is truncating text which stays on one line.", style: "text-overflow: ellipsis; overflow: hidden; white-space: nowrap"},
			{kind: "ToggleButton"}
		]},
		{kind: "Item", align: "center", tapHighlight: false, layoutKind: "HFlexLayout", components: [
			{kind: "ToggleButton"},
			{content: "Toggle 3", flex: 1, style: "text-align: right"}
		]}
	]
});