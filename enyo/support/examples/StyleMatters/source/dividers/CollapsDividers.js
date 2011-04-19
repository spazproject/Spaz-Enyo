/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "dividers.CollapsDividers",
	kind: HeaderView,
	components: [
		{kind: "Divider", caption: "EXAMPLES"},
		{kind: "ViewItem", className: "enyo-first", viewKind: "dividers.CollapsDivider",
			title: "collapsible divider",
			description: "labeled dividers which function as buttons to toggle an associated drawer"},
		{kind: "ViewItem", className: "enyo-last", viewKind: "dividers.CollapsIconDivider",
			title: "collapsible divider with icon",
			description: "labeled dividers with icons which function as buttons to toggle an associated drawer"}
	]
});

enyo.kind({
	name: "dividers.CollapsDivider",
	kind: HeaderView,
	components: [
		{kind: "DividerDrawer", caption: "EXAMPLE", open: false, components: [
			{kind: "Item", className: "enyo-first", components: [
				{content: "Example 1"},
				{content: "An example", style: "font-size: 14px"},
				{content: "Praesent interdum accumsan ante.", style: "font-size: 14px"}
			]},
			{kind: "Item", className: "enyo-last", components: [
				{content: "Example 2"},
				{content: "An example", style: "font-size: 14px"},
				{content: "Pallentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.", style: "font-size: 14px"}
			]},
		]},
		{kind: "DividerDrawer", caption: "DIVIDER", open: false, components: [
			{kind: "Item", className: "enyo-first", components: [
				{content: "Example 3"},
				{content: "An example", style: "font-size: 14px"}
			]},
			{kind: "Item", className: "enyo-last", components: [
				{content: "Example 4"},
				{content: "An example", style: "font-size: 14px"}
			]}
		]}
	]
});

enyo.kind({
	name: "dividers.CollapsIconDivider",
	kind: HeaderView,
	components: [
		{kind: "DividerDrawer", caption: "EXAMPLE", icon: "images/yahoo-32x32.png", open: false, components: [
			{kind: "Item", className: "enyo-first", components: [
				{content: "Example 1"},
				{content: "An example", style: "font-size: 14px"},
				{content: "Praesent interdum accumsan ante.", style: "font-size: 14px"}
			]},
			{kind: "Item", className: "enyo-last", components: [
				{content: "Example 2"},
				{content: "An example", style: "font-size: 14px"},
				{content: "Pallentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.", style: "font-size: 14px"}
			]},
		]},
		{kind: "DividerDrawer", caption: "DIVIDER", icon: "images/gmail-32x32.png", open: false, components: [
			{kind: "Item", className: "enyo-first", components: [
				{content: "Example 3"},
				{content: "An example", style: "font-size: 14px"}
			]},
			{kind: "Item", className: "enyo-last", components: [
				{content: "Example 4"},
				{content: "An example", style: "font-size: 14px"}
			]}
		]}
	]
});