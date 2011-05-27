/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
An application menu that appears in the upper left corner of the screen when the
user taps the left-hand side of the status bar.

By default, an application menu's items are instances of
<a href="#enyo.AppMenuItem">AppMenuItem</a>.

Example menu with two items and a submenu:

	{kind: "AppMenu", components: [
		{caption: "New Card", onclick: "openNewCard"},
		{caption: "Help"},
		{caption: "Find", components: [
			{caption: "Find Next"},
			{caption: "Find Prev"}
		]}
	]}

To signal that the app menu should be shown,
an "openAppMenu" event is fired to the application. When it should be hidden,
a "closeAppMenu" event is fired. An application should implement methods to respond to 
these events as follows:

	openAppMenuHandler: function() {
		this.$.appMenu.open();
	},
	closeAppMenuHandler: function() {
		this.$.appMenu.close();
	}

*/
enyo.kind({
	name: "enyo.AppMenu",
	kind: enyo.Menu,
	className: "enyo-appmenu enyo-popup-float",
	defaultKind: "AppMenuItem",
	published: {
		automatic: true
	},
	//* @protected
	initComponents: function() {
		this.inherited(arguments);
		this.createComponent({kind: "ApplicationEvents", onOpenAppMenu: "openAppMenu", onCloseAppMenu: "closeAppMenu"});
	},
	componentsReady: function() {
		this.inherited(arguments);
		this.$.client.addClass("enyo-appmenu-inner");
	},
	canOpen: function() {
		return this.inherited(arguments) && !enyo.BasicPopup.modalCount;
	},
	openAppMenu: function() {
		if (this.automatic) {
			this.open();
		}
	},
	closeAppMenu: function() {
		if (this.automatic) {
			this.close();
		}
	},
	showingChanged: function() {
		if (this.showing) {
			// limit app menu size to screen height.
			// FIXME: this is likely not good enough. body could be larger than we want
			this.applyMaxSize(this.clampSize());
		}
		this.inherited(arguments);
		enyo.appMenu.isOpen = this.showing;
	}/*,
	show: function() {
		// limit app menu size to screen height.
		// FIXME: this is likely not good enough. body could be larger than we want
		this.applyMaxSize(this.clampSize());
		this.inherited(arguments);
		enyo.appMenu.isOpen = true;
	},
	hide: function() {
		this.inherited(arguments);
		enyo.appMenu.isOpen = false;
	}
	*/
});

//* @protected
/**
Manages showing and hiding the app menu. 
*/
enyo.appMenu = {
	isOpen: false,
	toggle: function() {
		// NOTE: shower of the app menu responsible for this flag.
		if (enyo.appMenu.isOpen) {
			enyo.appMenu.close();
		} else {
			enyo.appMenu.open();
		}
	},
	open: function() {
		enyo.dispatch({type: "openAppMenu"});
	},
	close: function() {
		enyo.dispatch({type: "closeAppMenu"});
	}
};
