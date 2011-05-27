/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
// XXX: make catfish edit menu icons look right
enyo.kind({
	name: "enyo.EditMenuItem",
	kind: enyo.AppMenuItem,
	published: {
		showShortcut: false
	},
	shortcutChrome: [
		{name:"shortcutIcon", className:"enyo-editmenuitem-icon"},
		{name:"shortcut", className:"enyo-menuitem-caption enyo-editmenuitem-shortcut"}
	],
	create: function() {
		this.inherited(arguments);
		this.showShortcutChanged();
	},
	shortcutChanged: function() {
		if (this.$.shortcut) {
			this.$.shortcut.setContent('+' + this.shortcut);
		}
	},
	showShortcutChanged: function() {
		var hasShortcut = this.$.shortcut;
		if (this.showShortcut && !hasShortcut) {
			this.makeShortcutChrome();
		}
		if (hasShortcut) {
			this.$.shortcut.setShowing(this.showShortcut);
			this.$.shortcutIcon.setShowing(this.showShortcut);
		}
	},
	makeShortcutChrome: function() {
		this.$.item.createComponents(this.shortcutChrome, {owner:this});
		this.shortcutChanged();
		if (this.generated) {
			this.render();
		}
	}
});
