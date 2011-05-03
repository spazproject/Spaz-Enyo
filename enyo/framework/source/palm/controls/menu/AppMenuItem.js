/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.AppMenuItem",
	kind: enyo.MenuItem,
	defaultKind: "AppMenuItem",
	create: function() {
		this.inherited(arguments);
		this.$.item.addClass("enyo-appmenu-item");
	}
});