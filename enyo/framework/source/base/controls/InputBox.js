/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A box styled like an input control. Use to arrange a set of controls adjacent to an input with all of the controls
appearing to be inside the input. Note that by default, InputBox has a layoutKind of HFLexLayout.

For example, to place controls to the left and right of an input:

	{kind: "InputBox", components: [
		{content: "Foo"},
		{kind: "BasicRichText", flex: 1, className: "enyo-input-inner"},
		{content: "Bar"}
	]}

*/
enyo.kind({
	name: "enyo.InputBox", 
	kind: enyo.Control,
	events: {
		onfocus: "",
		onblur: ""
	},
	published: {
		alwaysLooksFocused: false,
		focusClassName: "enyo-input-focus",
		spacingClassName: "enyo-input-spacing"
	},
	chrome: [
		{name: "client"}
	],
	align: "center",
	layoutKind: "HFlexLayout",
	className: "enyo-input",
	create: function() {
		this.inherited(arguments);
		this.alwaysLooksFocusedChanged();
		this.spacingClassNameChanged();
	},
	spacingClassNameChanged: function(inOldValue) {
		if (inOldValue) {
			this.$.client.removeClass(inOldValue);
		}
		this.$.client.addClass(this.spacingClassName);
	},
	alwaysLooksFocusedChanged: function() {
		if (this.alwaysLooksFocused) {
			this.addClass(this.focusClassName);
		}
	},
	focusHandler: function(inSender, inEvent) {
		if (!this.alwaysLooksFocused) {
			this.addClass(this.focusClassName);
		}
		this.doFocus(inEvent);
	},
	blurHandler: function(inSender, inEvent) {
		if (!this.alwaysLooksFocused) {
			this.removeClass(this.focusClassName);
		}
		this.doBlur(inEvent);
	},
	layoutKindChanged: function() {
		this.$.client.align = this.align;
		this.$.client.pack = this.pack;
		this.$.client.setLayoutKind(this.layoutKind);
	}
});