/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.ToolInputs",
	kind: HeaderView,
	components: [
		{kind: "ToolInput", hint: "Name..."},
		{kind: "ToolInput", hint: "Enter URL or search terms", width: "100%", components: [
			{style: "background: url(images/menu-icon-forward.png) 0 0; width: 32px; height: 32px;"}
		]}
	]
});