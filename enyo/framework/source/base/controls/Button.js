/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
The button control displays a themed button with a caption. If you need to display a button with custom visual treatment, use a <a href="#base/controls/CustomButton.js">custom button</a>.
Initialize a button as follows:

	{kind: "Button", caption: "OK", onclick: "buttonClick"}
*/
enyo.kind({
	name: "enyo.Button",
	kind: enyo.CustomButton,
	className: "enyo-button",
	//* @protected
	create: function() {
		this.inherited(arguments);
		// FIXME: transitional, allow label (this may replace caption)
		this.caption = this.caption || this.label || this.content || this.onclick || "Button";
		this.captionChanged();
	}
});