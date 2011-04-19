/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that fills the space between other controls in a <a href="#enyo.FlexLayout">flex layout</a> by setting
its flex property to 1. For example:

	{kind: "HFlexBox", components: [
		{kind: "Button", caption: "On the left"},
		{kind: "Spacer"},
		{kind: "Button", caption: "On the right"}
	]}

*/
enyo.kind({
	name: "enyo.Spacer",
	kind: enyo.Control,
	className: "enyo-spacer",
	flex: 1
})
