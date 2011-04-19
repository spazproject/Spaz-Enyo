/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "toolbar.Main",
	kind: HeaderView,
	components: [
		{kind: "Divider", caption: "EXAMPLES"},
		{kind: "ViewItem", className: "enyo-first", viewKind: "toolbar.ToolButtons",
			title: "Tool Buttons"},
		{kind: "ViewItem", className: "enyo-last", viewKind: "toolbar.MenuGroups",
			title: "ToolButton Groups"},
		{kind: "Divider", caption: "VIEW BASICS"},
		{kind: "ViewItem", className: "enyo-first enyo-last", viewKind: "toolbar.ButtonMenu",
			title: "Menu Panels",
			description: "A popup panel containing UI or lists, floating underneath the view or command menu."}
	]
});
