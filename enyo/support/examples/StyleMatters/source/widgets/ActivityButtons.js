/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.ActivityButtons",
	kind: HeaderView,
	components: [
		{kind: "ActivityButton", active: true, caption: "Primary Button"},
		{kind: "ActivityButton", active: true, className: "enyo-button-light", caption: "Secondary Button"},
		{kind: "ActivityButton", active: true, className: "enyo-button-affirmative", caption: "Affirmative Button"},
		{kind: "ActivityButton", active: true, className: "enyo-button-negative", caption: "Negative Button"},
		{kind: "ActivityButton", disabled: true, active: true, caption: "Disabled Button"}
	]
});