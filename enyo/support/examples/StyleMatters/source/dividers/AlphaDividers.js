/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "dividers.AlphaDividers",
	kind: HeaderView,
	components: [
		{kind: "AlphaDivider", caption: "A"},
		{kind: "Item", className: "enyo-first", components: [
			{content: "Example 1"},
			{content: "An example", style: "font-size: 14px"}
		]},
		{kind: "Item", className: "enyo-last", components: [
			{content: "Example 2"},
			{content: "An example", style: "font-size: 14px"}
		]},
		{kind: "AlphaDivider", caption: "B"},
		{kind: "Item", className: "enyo-first enyo-last", components: [
			{content: "Example 3"},
			{content: "An example", style: "font-size: 14px"}
		]},
		{kind: "AlphaDivider", caption: "C"},
		{kind: "Item", className: "enyo-first enyo-last", components: [
			{content: "Example 4"},
			{content: "An example", style: "font-size: 14px"}
		]},
		{kind: "AlphaDivider", caption: "D"},
		{kind: "Item", className: "enyo-first", components: [
			{content: "Example 5"},
			{content: "An example", style: "font-size: 14px"}
		]},
		{kind: "Item", components: [
			{content: "Example 6"},
			{content: "An example", style: "font-size: 14px"}
		]},
		{kind: "Item", className: "enyo-last", components: [
			{content: "Example 7"},
			{content: "An example", style: "font-size: 14px"}
		]},
		{kind: "AlphaDivider", caption: "E"},
		{kind: "Item", className: "enyo-first", components: [
			{content: "Example 8"},
			{content: "An example", style: "font-size: 14px"}
		]},
		{kind: "Item", className: "enyo-last", components: [
			{content: "Example 9"},
			{content: "An example", style: "font-size: 14px"}
		]},
	]
});