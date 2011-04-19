/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A header that floats over the content at the top of its parent. Specify
header content using a components block or the content property.

	{kind: "FloatingHeader", content: "Page Header"}

or

	{kind: "FloatingHeader", layoutKind: "HFlexLayout", components: [
		{content: "Header", flex: 1},
		{kind: "Button", caption: "Go"}
	]}

*/
enyo.kind({
	name: "enyo.FloatingHeader",
	kind: enyo.Control,
	className: "enyo-floating-header"
});