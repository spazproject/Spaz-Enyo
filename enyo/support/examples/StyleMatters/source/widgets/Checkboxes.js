/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.Checkboxes",
	kind: HeaderView,
	components: [
		{kind: "RowGroup", caption: "Left Aligned Checkboxes", components: [
			{kind: "HFlexBox", align: "center", tapHighlight: false, components: [
				{kind: "CheckBox", checked: true},
				{content: "Get kids to school"}
			]},
			{kind: "HFlexBox", align: "center", tapHighlight: false, components: [
				{kind: "CheckBox", checked: true},
				{content: "Sleep a full 8 hours"}
			]}
		]},
		{kind: "RowGroup", caption: "Right Aligned Checkboxes", components: [
			{kind: "HFlexBox", align: "center", tapHighlight: false, components: [
				{content: "Sleep in past 8"},
				{kind: "Spacer"},
				{kind: "CheckBox"}
			]},
			{kind: "HFlexBox", align: "center", tapHighlight: false, components: [
				{content: "Make the bed"},
				{kind: "Spacer"},
				{kind: "CheckBox"}
			]}
		]},
		{kind: "RowGroup", components: [
			{kind: "HFlexBox", tapHighlight: false, components: [
				{kind: "CheckBox", checked: true, disabled: true},
				{kind: "Spacer"},
				{content: "A disabled check box"}
			]}
		]}
	]
});