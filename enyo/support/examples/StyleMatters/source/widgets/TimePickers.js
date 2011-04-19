/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.TimePickers",
	kind: HeaderView,
	components: [
		{kind: "TimePicker"},
		{kind: "TimePicker", is24HrMode: true},
		{kind: "RowGroup", caption: "schedule", components: [
			{kind: "TimePicker", label: "start", labelClass: "widgets-timepickers-label", tapHighlight: false},
			{kind: "TimePicker", label: "end", labelClass: "widgets-timepickers-label", tapHighlight: false}
		]}
	]
});