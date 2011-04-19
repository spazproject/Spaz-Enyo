/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.IntegerPickers",
	kind: HeaderView,
	components: [
		{kind: "IntegerPicker"},
		{kind: "IntegerPicker", label: "rating", min: 1, max: 10, value: 5}
	]
});