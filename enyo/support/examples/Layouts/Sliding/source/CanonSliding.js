/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
someContent = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

enyo.kind({
	name: "enyo.CanonSliding",
	kind: enyo.VFlexBox,
	components: [
		{kind: "VFlexBox", className: "enyo-fit", components: [
			{kind: "Header"},
			{kind: "Spacer"},
			{kind: "Toolbar"}
		]},
		{name: "slidingPane", kind: "SlidingPane", flex: 1, onSelectView: "slidingSelected", components: [
			{name: "left", width: "320px", components: [
				{kind: "CanonView", headerContent: "Panel 1", flex: 1, onGo: "gotoMiddle", components: [
					{kind: "CanonPeekItem", caption: "Button 1", className: "enyo-first", onclick: "peekItemClick"},
					{kind: "CanonPeekItem", caption: "Button 2", onclick: "peekItemClick"},
					{kind: "CanonPeekItem", caption: "Button 3", className: "enyo-last", onclick: "peekItemClick"}
				]}
			]},
			{name: "middle", width: "320px", peekWidth: 68, components: [
				{kind: "CanonView", headerContent: "Panel 2", onGo: "gotoRight", flex: 1, components: [
					{className: "margin-medium", components: [
						{kind: "RowGroup", caption: "Inputs", components: [
							{kind: "Input"},
							{kind: "Input"},
							{kind: "Input"}
						]},
						{name: "info", style: "height: 50px;"}
					]}
				]}
			]},
			{name: "right", flex: 1, onResize: "slidingResize", components: [
				{kind: "CanonView", headerContent: "Panel 3", flex: 1, onGo: "gotoLeft", components: [
					{className: "margin-medium", content: someContent}
				]}
			]}
		]}
	],
	gotoLeft: function() {
		this.$.slidingPane.selectView(this.$.left);
	},
	gotoMiddle: function() {
		this.$.slidingPane.selectView(this.$.middle);
	},
	gotoRight: function() {
		this.$.slidingPane.selectView(this.$.right);
	},
	peekItemClick: function(inSender) {
		this.$.info.setContent("You clicked: " + inSender.caption);
		this.gotoMiddle();
	},
	slidingSelected: function(inSender, inSliding, inLastSliding) {
		this.log(inSliding.id, (inLastSliding || 0).id);
	},
	slidingResize: function(inSender) {
		this.log(inSender.id);
	},
	backHandler: function(inSender, e) {
		this.$.slidingPane.back(e);
	},
	resizeHandler: function() {
		this.$.slidingPane.resize();
	}
});