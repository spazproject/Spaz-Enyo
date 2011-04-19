/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
// XXX: make catfish edit menu icons look right
enyo.kind({
	name: "enyo.EditMenuItem",
	kind: enyo.AppMenuItem,
	published: {
		showShortcut: true
	},
	shortcutIconChrome: {name:"shortcutIcon", className:"enyo-editmenuitem-icon"},
	shortcutChrome: {name:"shortcut", className:"enyo-menuitem-caption enyo-editmenuitem-shortcut"},
	create: function() {
		this.inherited(arguments);
		this.$.item.createComponent(this.shortcutIconChrome, {owner:this});
		this.$.item.createComponent(this.shortcutChrome, {owner:this});
		this.shortcutChanged();
		this.showShortcutChanged();
	},
	shortcutChanged: function() {
		this.$.shortcut.setContent('+' + this.shortcut);
	},
	showShortcutChanged: function() {
		this.$.shortcut.setShowing(this.showShortcut)
		this.$.shortcutIcon.setShowing(this.showShortcut)
	}
});
