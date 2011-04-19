/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "containers.UnlabeledGroup",
	kind: HeaderView,
	components: [
		{kind: "RowGroup", components: [
			{kind: "ListSelector", align: "center", items: [
				{caption: "Assiduous"},
				{caption: "Diligent"},
				{caption: "Earnest"},
				{caption: "Easy"},
				{caption: "Hard"},
				{caption: "Hardy"}
			]}
		]},
		{kind: "RowGroup", defaultKind: "HFlexBox", components: [
			{align: "center", tapHighlight: false, components: [
				{content: "Sifted flour", flex: 1},
				{content: "2 CUPS", style: "color: rgb(31, 117, 191); font-size: 16px"}
			]},
			{align: "center", tapHighlight: false, components: [
				{content: "Lukewarm milk", flex: 1},
				{content: "3 CUPS", style: "color: rgb(31, 117, 191); font-size: 16px"}
			]},
			{align: "center", tapHighlight: false, components: [
				{content: "Melted butter", flex: 1},
				{content: "1 STICK", style: "color: rgb(31, 117, 191); font-size: 16px"}
			]}
		]}
	]
});
