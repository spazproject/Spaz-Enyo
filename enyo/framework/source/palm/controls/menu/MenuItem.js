/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A labeled item with icon.  It is meant to go inside a <a href="#enyo.Menu">Menu</a>.
*/
// FIXME: do we need (for simplicity / performance) an item that doesn't support sub-items?
enyo.kind({
	name: "enyo.MenuItem",
	kind: enyo.Control,
	published: {
		caption: "",
		value: undefined,
		icon: "",
		orderStyle: "",
		open: false,
		disabled: false,
		hideIcon: false,
		tapHighlight: true
	},
	indentPadding: 24,
	events: {
		onclick: "menuItemClick"
	},
	defaultKind: "MenuItem",
	chrome: [
		{name: "item", kind: enyo.Item, className: "enyo-menuitem", tapHighlight: true, align: "center", onclick: "itemClick"}
		// NOTE: item chrome and client are created if needed
	],
	itemChrome: [
		{name: "icon", kind: enyo.Image, className: "enyo-menuitem-icon"},
		{name: "caption", flex: 1},
		{name: "arrow", kind: enyo.CustomButton, toggling: true, showing: false, className: "enyo-menuitem-arrow"}
	],
	captionClassName: "enyo-menuitem-caption",
	_depth: 0,
	//* @protected
	create: function(inProps) {
		this.inherited(arguments);
		if (this.value === undefined) {
			this.value = this.caption;
		}
		this.caption = this.caption || this.content || this.value;
		this.setCaptionControl(this.$.item);
		this.$.item.addClass(this.itemClassName);
		this.iconChanged();
		this.captionChanged();
		this.openChanged();
		this.disabledChanged();
		this.tapHighlightChanged();
	},
	addControl: function(inControl) {
		// Optimization: dynamically add a client region, if we have controls.
		// FIXME: this optimization makes using MenuItem in a flyweight context problematic
		// because our controls can change while rendering.
		// For example, if a PopupList, which uses a flyweigted MenuItem has an icon only in 
		// its second item, but not its first, then these controls will change when the 2nd row
		// is rendered due to the call to setIcon.
		if (!inControl.isChrome && !this.$.client) {
			this.validateItemChrome();
			this.$.arrow.setShowing(true);
			this.createChrome([{
				name: "client",
				kind: enyo.BasicDrawer,
				open: false,
				layoutKind: "OrderedLayout"
			}]);
		}
		this.inherited(arguments);
	},
	validateItemChrome: function() {
		if (!this.$.caption) {
			this.createItemChrome();
		}
	},
	createItemChrome: function() {
		this.$.item.setLayoutKind("HFlexLayout");
		this.$.item.createComponents(this.itemChrome, {owner: this});
		this.setCaptionControl(this.$.caption);
		this.captionChanged();
	},
	styleDepth: function() {
		this.$.item.applyStyle("padding-left", (this._depth * this.indentPadding) + "px");
	},
	hasControls: function() {
		return this.getControls().length;
	},
	flowMenu: function() {
		var controls = this.getControls();
		this.$.item.addRemoveClass("enyo-menu-has-items", controls.length);
		for (var i=0, c; c=controls[i]; i++) {
			if (c.styleDepth) {
				c._depth = this._depth +1;
				c.styleDepth();
			}
		}
	},
	flow: function() {
		this.flowMenu();
		// FIXME: it's important that captionClassName be set right before rendering to ensure
		// that it's not incorrectly set on the wrong captionControl.
		this.captionControl && this.captionControl.addClass(this.captionClassName);
		this.inherited(arguments);
	},
	setCaptionControl: function(inControl) {
		this.captionControl = inControl;
	},
	captionChanged: function() {
		this.captionControl.setContent(this.caption);
	},
	iconChanged: function() {
		if (this.icon) {
			this.validateItemChrome();
		}
		if (this.$.icon) {
			this.$.icon.setSrc(this.icon ? enyo.path.rewrite(this.icon) : "");
			this.$.icon.setShowing(!this.hideIcon && this.icon);
		}
	},
	hideIconChanged: function() {
		this.$.icon.setShowing(!this.hideIcon);
	},
	disabledChanged: function() {
		this.$.item.setDisabled(this.disabled);
	},
	tapHighlightChanged: function() {
		this.$.item.tapHighlight = this.tapHighlight;
	},
	fetchMenu: function() {
		var m = this.parent;
		while (m) {
			if (m instanceof enyo.Menu) {
				return m;
			}
			m = m.parent;
		}
	},
	itemClick: function(inSender, inEvent) {
		// automate closing of menu on click
		if (this.hasControls()) {
			this.setOpen(!this.open);
		} else {
			var m = this.fetchMenu();
			if (m) {
				m.close();
			}
		}
		this.doClick(inEvent);
	},
	// defeat default click handling in favor of clicking on item.
	clickHandler: function() {
	},
	isLastControl: function() {
		var controls = this.container ? this.container.getControls() : [];
		return this == controls[controls.length-1];
	},
	openChanged: function() {
		if (this.$.client) {
			this.$.item.addRemoveClass("collapsed", !this.open);
			this.$.arrow.setDepressed(this.open);
			this.$.client.setOpen(this.open);
		}
		// NOTE: if we are the bottom control, tell menu we need to update bottom styling
		if (this.generated && this.isLastControl()) {
			var m = this.fetchMenu();
			if (m) {
				m.styleLastItem();
			}
		}
	},
	closeAll: function() {
		this.setOpen(false);
		for (var i=0, c$=this.getControls(), c; c=c$[i]; i++) {
			enyo.call(c, "closeAll");
		}
	},
	addRemoveMenuLastStyle: function(inLast) {
		this.$.item.addRemoveClass("enyo-menu-last", inLast);
	},
	orderStyleChanged: function(inOldOrderStyle) {
		this.$.item.removeClass(inOldOrderStyle);
		this.$.item.addClass(this.orderStyle);
	},
	addRemoveItemClass: function(inClass, inTrueToAdd) {
		this.$.item.addRemoveClass(inClass, inTrueToAdd);
	}
});

/**
An labeled item with icon and checkmark.  It is meant to go inside a <a href="#enyo.Menu">Menu</a>.
*/
enyo.kind({
	name: "enyo.MenuCheckItem",
	kind: enyo.MenuItem,
	published: {
		checked: false
	},
	captionClassName: "enyo-menucheckitem-caption",
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.checkedChanged();
	},
	checkedChanged: function() {
		this.$.item.checked = this.checked;
		this.$.item.stateChanged("checked");
	},
	setSelected: function(inSelected) {
		this.setChecked(inSelected);
	}
});
