/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.Buttons",
	kind: HeaderView,
	components: [
		{kind: "Button", caption: "Primary Button"},
		{kind: "Button", className: "enyo-button-light", caption: "Secondary Button"},
		{kind: "Button", className: "enyo-button-affirmative", caption: "Affirmative Button"},
		{kind: "Button", className: "enyo-button-negative", caption: "Negative Button"},
		{kind: "Button", caption: "Disabled Button", disabled: true},
	]
});