/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A multi-line text input that supports rich formatting such as bold, italics, and underlining.
Note that rich formatting can be disabled by setting the richContent property to false.

Use the value property to get or set the displayed text. The onchange event fires when the control blurs (loses focus).

Create a RichText as follows:

	{kind: "RichText", value: "To <b>boldly</b> go..", onchange: "richTextChange"}

*/
/**
	A styled rich text control.
	
	See <a href="#enyo.RichText">enyo.RichText</a> for more information.
*/
enyo.kind({
	name: "enyo.RichText", 
	kind: enyo.Input,
	published: {
		richContent: true,
		maxTextHeight: null,
		/**
		The selection property is a dom Selection object describing the selected text.
		It cannot be set. Instead the selection can be altered by manipulated the object directly
		via the dom selection object api.
		For example, this.$.richText.getSelection().collapseToEnd();
		*/
		selection: null
	},
	events: {
		onchange: ""
	},
	chrome: [
		{name: "input", flex: 1, kind: enyo.BasicRichText, className: "enyo-input-input", onchange: "doChange"},
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.richContentChanged();
		this.maxTextHeightChanged();
	},
	richContentChanged: function() {
		this.$.input.setRichContent(this.richContent);
	},
	maxTextHeightChanged: function() {
		if (this.maxTextHeight) {
			this.$.input.applyStyle("max-height", this.maxTextHeight);
		}
	},
	getHtml: function() {
		return this.$.input.getHtml();
	},
	getText: function() {
		return this.$.input.getText();
	},
	inputChange: function(inSender, inEvent) {
		if (this.changeOnKeypress) {
			return true;
		} else {
			this.value = inSender.getValue();
			this.doChange(inEvent, this.value);
		}
	},
	inputTypeChanged: function() {
		this.$.input.domAttributes["x-palm-input-type"] = this.inputType;
		if (this.hasNode()) {
			this.$.input.render();
		}
	},
	selectionChanged: function() {
	},
	getSelection: function() {
		return this.hasFocus() ? window.getSelection() : null;
	}
});
