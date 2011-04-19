/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "dividers.SolidDividers",
	kind: HeaderView,
	components: [
		{className: "enyo-divider"},
		{kind: "Item", className: "enyo-first", components: [
			{content: "Example 1"},
			{content: "An example", style: "font-size: 14px"}
		]},
		{kind: "Item", className: "enyo-last", components: [
			{content: "Example 2"},
			{content: "An example", style: "font-size: 14px"}
		]},
		{className: "enyo-divider"},
		{kind: "Item", className: "enyo-first enyo-last", components: [
			{content: "Example 3"},
			{content: "An example", style: "font-size: 14px"}
		]},
		{className: "enyo-divider"},
		{kind: "Item", className: "enyo-first enyo-last", components: [
			{content: "Example 4"},
			{content: "An example", style: "font-size: 14px"}
		]},
		{className: "enyo-divider"},
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
		{className: "enyo-divider"},
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