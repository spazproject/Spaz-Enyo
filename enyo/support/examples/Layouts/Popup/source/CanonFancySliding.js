/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "CanonFancySliding",
	kind: "SlidingPane",
	components: [
		{width: "220px", style: "padding: 10px;", components: [
			{kind: "Button", caption: "Sample"},
			{kind: "Button", caption: "Sample"},
			{kind: "Button", caption: "Sample"}
		]},
		{width: "220px", components: [
			{content: "Hello World", style: "padding: 10px;", flex: 1}
		]},
		{flex: 1, layoutKind: "VFlexLayout", components: [
			{flex: 1, style: "background: white; padding: 10px;", components: [
				{content: "Hello World"},
				{kind: "RowGroup", caption: "Some Controls with popups", components: [
					{kind: "Input"},
					{kind: "ListSelector", items: ["foo", "bar", "bot"]},
					{kind: "DatePicker"},
					{kind: "TimePicker"}
				]}
			]}
		]}
	]
});