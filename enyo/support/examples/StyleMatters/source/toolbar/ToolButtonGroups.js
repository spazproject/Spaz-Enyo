/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "toolbar.MenuGroups",
	kind: HeaderView,
	noScroller: true,
	components: [
		{flex: 1},
		{kind: "Toolbar", pack: "justify", components: [
			{kind: "RadioToolButtonGroup", className: "enyo-radiobutton-dark", components: [
				{caption: "One"},
				{caption: "Two"},
				{caption: "Three"}
			]},
			{kind: "RadioToolButtonGroup", className: "enyo-radiobutton-dark", components: [
				{icon: "images/menu-icon-back.png"},
				{width: "80px", caption: "Middle"},
				{icon: "images/menu-icon-forward.png"}
			]},
			{kind: "ToolButtonGroup", className: "enyo-toolbutton-dark", components: [
				{icon: "images/menu-icon-refresh.png"},
				{icon: "images/menu-icon-refresh.png"},
				{icon: "images/menu-icon-refresh.png"},
				{icon: "images/menu-icon-search.png"}
			]},
			{toggling: true, icon: "images/menu-icon-new.png"}
		]}
	]
});