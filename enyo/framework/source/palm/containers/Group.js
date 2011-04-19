/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control used to show a series of controls visually grouped together. A group can optionally
describe itself with a caption.

Here's an example:

	{kind: "Group", caption: "Audio/Video Options", components: [
		{kind: "HFlexBox", components: [
			{content: "Sound", flex: 1},
			{kind: "ToggleButton"}
		]},
		{kind: "HFlexBox", components: [
			{content: "Video", flex: 1},
			{kind: "ToggleButton"}
		]}
	]}
*/
enyo.kind({
	name: "enyo.Group", 
	kind: enyo.Control,
	className: "enyo-group enyo-roundy",
	published: {
		caption: ""
	},
	//* @protected
	chrome: [
		{name: "label", kind: "Control", className: "enyo-group-label"},
		{name: "client", kind: "Control", className: "enyo-group-inner"}
	],
	create: function() {
		this.inherited(arguments);
		this.captionChanged();
	},
	captionChanged: function() {
		this.$.label.setContent(this.caption);
		this.$.label.setShowing(this.caption);
		this.addRemoveClass("labeled", this.caption);
	}
});
