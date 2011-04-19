/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control styled as a header fitting across the top of the application window.

Content for PageHeader can be specified either via the content property or by placing
components in the PageHeader. For example,

	{kind: "PageHeader", content: "Header"}

or

	{kind: "PageHeader", components: [
		{content: "Header", flex: 1},
		{kind: "Button", caption: "Right-aligned button"}
	]}
*/
enyo.kind({
	name: "enyo.PageHeader",
	kind: enyo.Header
});
