/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "containers.LabeledGroup",
	kind: HeaderView,
	components: [
		{kind: "RowGroup", defaultKind: "HFlexBox", caption: "Ingredients", components: [
			{align: "center", tapHighlight: false, components: [
				{kind: "CheckBox", checked: true},
				{content: "Sifted flour", flex: 1},
				{content: "2 CUPS", style: "color: rgb(31, 117, 191); font-size: 16px"}
			]},
			{align: "center", tapHighlight: false, components: [
				{kind: "CheckBox", checked: true},
				{content: "Lukewarm milk", flex: 1},
				{content: "3 CUPS", style: "color: rgb(31, 117, 191); font-size: 16px"}
			]},
			{align: "center", tapHighlight: false, components: [
				{kind: "CheckBox", checked: true},
				{content: "Melted butter", flex: 1},
				{content: "1 STICK", style: "color: rgb(31, 117, 191); font-size: 16px"}
			]}
		]},
		{kind: "RowGroup", caption: "Username", components: [
			{kind: "Input"}
		]},
		{kind: "RowGroup", caption: "Password", components: [
			{kind: "PasswordInput"}
		]},
		{kind: "RowGroup", defaultKind: "HFlexBox", caption: "To Do List", components: [
			{align: "center", tapHighlight: false, components: [
				{content: "Mail scrapbook", flex: 1},
				{kind: "CheckBox"}
			]},
			{align: "center", tapHighlight: false, components: [
				{content: "Research cruise", flex: 1},
				{kind: "CheckBox"}
			]},
			{align: "center", tapHighlight: false, components: [
				{content: "Write novel", flex: 1},
				{kind: "CheckBox"}
			]}
		]}
	]
});
