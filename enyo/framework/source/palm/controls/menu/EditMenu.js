/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A submenu with items to perform select all, cut, copy,
and paste commands. It is meant to go inside an <a href="#enyo.AppMenu">AppMenu</a>.

	{kind: "AppMenu", components: [
		{kind: "EditMenu"},
		{caption: "Some other item"}
	]}
*/
enyo.kind({
	name: "enyo.EditMenu",
	kind: enyo.AppMenuItem,
	caption: enyo._$L("Edit"),
	published: {
		/**
		If true, edit menu items will automatically disable if the focused element does not support
		editing. This setting will override the individual item disabled properties.
		*/
		autoDisableItems: true,
		selectAllDisabled: false,
		cutDisabled: false,
		copyDisabled: false,
		pasteDisabled: false,
		showShortcuts: false
	},
	events: {
		onSelectAll:"",
		onCut:"",
		onCopy:"",
		onPaste:""
	},
	defaultKind:"EditMenuItem",
	//* @protected
	components: [
		{name: "selectAll", caption: enyo._$L("Select All"), command: "selectAll", onclick: "send", shortcut:"A"},
		{name: "cut", caption: enyo._$L("Cut"), command: "cut", onclick: "send", shortcut:"X"},
		{name: "copy", caption: enyo._$L("Copy"), command: "copy", onclick: "send", shortcut:"C"},
		{name: "paste", caption: enyo._$L("Paste"), command: "paste", onclick: "send", shortcut:"P"}
	],
	create: function() {
		this.inherited(arguments);
		this.selectAllDisabledChanged();
		this.cutDisabledChanged();
		this.copyDisabledChanged();
		this.pasteDisabledChanged();
		this.showShortcutsChanged();
	},
	mousedownHandler: function(inSender, e) {
		// need to prevent default so the focus doesn't change
		e.preventDefault();
	},
	send: function(inSender) {
		this["do" + enyo.cap(inSender.command)]();
		enyo.dispatch({type: inSender.command, target: document.activeElement});
	},
	openChanged: function() {
		this.inherited(arguments);
		if (this.open && this.autoDisableItems) {
			this.setItemsDisabled(this.shouldDisableItems());
		}
	},
	shouldDisableItems: function() {
		var a = document.activeElement;
		return !Boolean(a && a.parentNode&& a.parentNode.querySelector(a.nodeName +":focus"));
	},
	setItemsDisabled: function(inDisable) {
		this.setSelectAllDisabled(inDisable);
		this.setCutDisabled(inDisable);
		this.setCopyDisabled(inDisable);
		this.setPasteDisabled(inDisable);
	},
	selectAllDisabledChanged: function() {
		this.$.selectAll.setDisabled(this.selectAllDisabled);
	},
	cutDisabledChanged: function() {
		this.$.cut.setDisabled(this.cutDisabled);
	},
	copyDisabledChanged: function() {
		this.$.copy.setDisabled(this.copyDisabled);
	},
	pasteDisabledChanged: function() {
		this.$.paste.setDisabled(this.pasteDisabled);
	},
	showShortcutsChanged: function() {
		this.$.selectAll.setShowShortcut(this.showShortcuts);
		this.$.cut.setShowShortcut(this.showShortcuts);
		this.$.copy.setShowShortcut(this.showShortcuts);
		this.$.paste.setShowShortcut(this.showShortcuts);
	}
});
