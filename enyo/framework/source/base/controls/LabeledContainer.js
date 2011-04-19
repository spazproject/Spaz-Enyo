/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A simple container with a label specified by the label property. By default, layoutKind is set to HFlexBox, and
thus the label is displayed to the left of the container's content. Change layoutKind to 
VFlexBox to place the label above the content. The label will fill any space not taken up by
the content.

NOTE: If additional control over the styling of the label or container content is required, use 
separate controls instead of a LabeledContainer.

	{kind: "LabeledContainer", label: "3 buttons", components: [
		{kind: "Button", caption: "1"},
		{kind: "Button", caption: "2"},
		{kind: "Button", caption: "3"}
	]}
*/
enyo.kind({
	name: "enyo.LabeledContainer",
	kind: enyo.HFlexBox,
	published: {
		label: ""
	},
	//* @protected
	chrome: [
		{name: "label", flex: 1},
		{name: "client"}
	],
	create: function(inProps) {
		this.inherited(arguments);
		this.layout.align = "center";
		//bc
		this.label = this.label || this.caption;
		//
		this.labelChanged();
	},
	labelChanged: function() {
		this.$.label.setContent(this.label);
	}
})