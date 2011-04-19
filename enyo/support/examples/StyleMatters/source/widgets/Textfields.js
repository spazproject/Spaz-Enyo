/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.Textfields",
	kind: HeaderView,
	components: [
		{kind: "Divider", caption: "EXAMPLES"},
		{kind: "ViewItem", className: "enyo-first", viewKind: "widgets.SingleLineTextfield",
			title: "Single-line"},
		{kind: "ViewItem", viewKind: "widgets.MultiLineTextfield",
			title: "Multi-line"},
		{kind: "ViewItem", viewKind: "widgets.HintTextfield",
			title: "Hint Text"},
		{kind: "ViewItem", viewKind: "widgets.TextfieldAssist",
			title: "Text Assist Options"},
		{kind: "ViewItem", className: "enyo-last", viewKind: "widgets.MoreTextfield",
			title: "More Examples"}
	]
});

enyo.kind({
	name: "widgets.SingleLineTextfield",
	kind: HeaderView,
	components: [
		{kind: "RowGroup", caption: "Single Row in Group", components: [
			{kind: "Input", value: "This is an example of text...."}
		]},
		{kind: "RowGroup", caption: "Rows in Group", components: [
			{kind: "Input", value: "Hello World"},
			{kind: "Input", hint: "Special hint! Enter text..."},
			{kind: "Input", value: "Bottom row"}
		]}
	]
});

enyo.kind({
	name: "widgets.MultiLineTextfield",
	kind: HeaderView,
	components: [
		{kind: "RowGroup", caption: "Single Row in Group", components: [
			{kind: "RichText", value: "This is an example of text which is too long to fit in one line. It will wrap as necessary. This is a <b>rich</b> <em>text</em> control, so it's possible to style."}
		]},
		{kind: "RowGroup", caption: "Rows in Group", components: [
			{kind: "RichText", richContent: false, value: "This is a multi-line text input \nwithout rich styling..."},
			{kind: "RichText", value: "This is a multi-line<br> rich input"},
			{kind: "RichText", value: "Bottom row"}
		]}
	]
});

enyo.kind({
	name: "widgets.HintTextfield",
	kind: HeaderView,
	components: [
		{className: "enyo-row", components: [
			{kind: "Input", hint: "Enter text...", components: [
				{content: "label", style: "text-transform: uppercase; color: rgb(31, 117, 191)"}
			]}
		]},
		{className: "enyo-row", components: [
			{kind: "Input", hint: "Enter username...", components: [
				{kind: "Image", src: "images/facebook-32x32.png"}
			]}
		]}
	]
});

enyo.kind({
	name: "widgets.TextfieldAssist",
	kind: HeaderView,
	components: [
		{className: "enyo-row", components: [
			{name: "field", kind: "Input", hint: "Type here..."}
		]},
		{kind: "RowGroup", caption: "Standard Options", components: [
			{
				kind: "ListSelector",
				label: "Spellcheck",
				value: true,
				items: [
					{caption: "Enabled", value: true},
					{caption: "Disabled", value: false}
				],
				onChange: "spellcheckChanged"
			},
			{
				kind: "ListSelector",
				label: "AutoCorrect",
				value: true,
				items: [
					{caption: "Enabled", value: true},
					{caption: "Disabled", value: false}
				],
				onChange: "autocorrectChanged"
			}
		]},
		{kind: "RowGroup", caption: "Palm-Specific Options", components: [
			{
				kind: "ListSelector",
				label: "Auto Caps",
				value: "sentence",
				items: [
					{caption: "Sentence case, like this.", value: "sentence"},
					{caption: "Title Case (For Proper Names)", value: "title"},
					{caption: "disabled", value: "lowercase"}
				],
				onChange: "capitalizeChanged"
			},
			{
				kind: "ListSelector",
				label: "Modifier",
				value: "",
				items: [
					{caption: "Off", value: ""},
					{caption: "Number", value: "number"},
					{caption: "Num Lock", value: "num-lock"},
					{caption: "Shift", value: "shift"},
					{caption: "Shift Lock", value: "shift-lock"},
					{caption: "Num Single", value: "num-single"},
					{caption: "Shift Single", value: "shift-single"},
					{caption: "Normal", value: "normal"}
				],
				onChange: "autoKeyModifierChanged"
			},
			{
				kind: "ListSelector",
				label: "URL Linking",
				value: false,
				items: [
					{caption: "Disabled", value: false},
					{caption: "Enabled", value: true}
				],
				onChange: "autoLinkingChanged"
			}
		]}
	],
	capitalizeChanged: function(inSender, inValue) {
		this.$.field.setAutoCapitalize(inValue);
	},
	spellcheckChanged: function(inSender, inValue) {
		this.$.field.setSpellcheck(inValue);
	},
	autocorrectChanged: function(inSender, inValue) {
		this.$.field.setAutocorrect(inValue);
	},
	autoKeyModifierChanged: function(inSender, inValue) {
		this.$.field.setAutoKeyModifier(inValue);
	},
	autoLinkingChanged: function(inSender, inValue) {
		this.$.field.setAutoLinking(inValue);
	}
});

enyo.kind({
	name: "widgets.MoreTextfield",
	kind: HeaderView,
	components: [
		{className: "enyo-row", components: [
			{kind: "Input", hint: "Enter text...", components: [
				{kind: "Button", caption: "Click me"}
			]}
		]},
		{className: "enyo-row", components: [
			{kind: "Input", hint: "Search...", components: [
					{kind: "ListSelector", value: "Google", style: "width: 100px; color: rgb(31, 117, 191)", items: [
						{caption: "Google"},
						{caption: "Yahoo"},
						{caption: "Bing"}
					]}
				]}
		]}
	]
});