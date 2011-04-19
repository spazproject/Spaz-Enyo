/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.Pickers",
	kind: HeaderView,
	components: [
		{kind: "HFlexBox", components: [
			{className: "enyo-picker-label", content: "integer"},
			{kind: "Picker", value: "4", items: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
		]},
		{kind: "HFlexBox", components: [
			{className: "enyo-picker-label", content: "hour"},
			{kind: "Picker", value: "12", items: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]},
			{kind: "Picker", value: "AM", items: ["AM", "PM"]}
		]},
		{kind: "HFlexBox", components: [
			{className: "enyo-picker-label", content: "city"},
			{kind: "Picker", value: "San Francisco", textAlign: "left", items: ["San Francisco", "Sunnyvale", "Oakland", "Burlingame"]},
		]},
		{kind: "HFlexBox", components: [
			{kind: "HFlexBox", components: [
				{className: "enyo-picker-label", content: "enyo-first"},
				{kind: "Picker", value: "4", items: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]},
			]},
			{kind: "HFlexBox", components: [
				{className: "enyo-picker-label", content: "second"},
				{kind: "Picker", value: "5", items: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]}
			]}
		]},
		{kind: "HFlexBox", components: [
			{className: "enyo-picker-label", content: "color"},
			{kind: "Picker", value: "white", items: ["red", "white", "blue"]}
		]}
	]
});