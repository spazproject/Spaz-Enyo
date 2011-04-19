/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A group of
<a href="#enyo.RadioToolButton">RadioToolButton</a> objects with toolbar styling.

	{kind: "RadioToolButtonGroup", components: [
		{icon: "images/foo.png"},
		{label: "bar"},
		{icon: "images/baz.png"}
	]}

Also see <a href="#enyo.RadioGroup">RadioGroup</a> for more examples.
*/
enyo.kind({
	name: "enyo.RadioToolButtonGroup",
	kind: enyo.RadioGroup,
	className: "enyo-radio-toolbutton-group",
	defaultKind: "RadioToolButton"
});
