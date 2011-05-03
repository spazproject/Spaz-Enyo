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
		{name: "item", kind: enyo.Item, layoutKind: "HFlexLayout", tapHighlight: true, align: "center", onclick: "itemClick", components: [
			{name: "icon", kind: enyo.Image, className: "enyo-menuitem-icon"},
			{name: "caption", flex: 1, className: "enyo-menuitem-caption"},
			{name: "arrow", kind: enyo.CustomButton, toggling: true, showing: false, className: "enyo-menuitem-arrow"}
		]}
		// NOTE: client is dynamically created if needed
	],
	_depth: 0,
	//* @protected
	create: function(inProps) {
		this.inherited(arguments);
		if (this.value === undefined) {
			this.value = this.caption;
		}
		this.caption = this.caption || this.content || this.value;
		this.captionContainer = this.$.item;
		this.$.item.addClass(this.itemClassName);
		this.captionChanged();
		this.openChanged();
		this.iconChanged();
		this.disabledChanged();
		this.tapHighlightChanged();
	},
	addControl: function(inControl) {
		// Optimization: dynamically add a client region, if we have controls.
		if (!inControl.isChrome && !this.$.client) {
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
		this.inherited(arguments);
	},
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
	},
	iconChanged: function() {
		this.$.icon.setSrc(enyo.path.rewrite(this.icon));
		this.$.icon.setShowing(!this.hideIcon && this.icon);
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
		var controls = this.manager ? this.manager.getControls() : [];
		return this == controls[controls.length-1];
	},
	openChanged: function() {
		this.$.item.addRemoveClass("collapsed", !this.open);
		this.$.arrow.setDown(this.open);
		if (this.$.client) {
			this.$.client.setOpen(this.open);
		}
		// NOTE: if we are the bottom control, tell menu we need to update bottom styling
		if (this.isLastControl()) {
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
	getItemClassName: function() {
		return this.$.item.getClassName();
	},
	setItemClassName: function(inClassName) {
		this.$.item.setClassName(inClassName);
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
	chrome: [
		{name: "item", kind: enyo.Item, tapHighlight: true, align: "center", className: "enyo-menuitem", 
			layoutKind: "HFlexLayout", onclick: "itemClick", components: [
			{name: "icon", kind: "Image", className: "enyo-menuitem-icon"},
			{name: "caption", flex: 1, className: "enyo-menucheckitem-caption"},
			{name: "arrow", kind: enyo.CustomButton, toggling: true, className: "enyo-menucheckitem-arrow"}
		]}
	],
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
