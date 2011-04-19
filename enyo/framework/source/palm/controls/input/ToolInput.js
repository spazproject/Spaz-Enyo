/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.ToolInput", 
	kind: enyo.Input,
	className: "enyo-tool-input",
	inputClassName: "enyo-tool-input-input",
	focusClassName: "enyo-tool-input-focus",
	spacingClassName: "enyo-tool-input-spacing",
	create: function() {
		this.inherited(arguments);
		this.$.input.addClass("enyo-tool-input-input");
	}
});