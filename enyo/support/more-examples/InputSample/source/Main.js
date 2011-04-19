/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "Main",
	kind: enyo.VFlexBox,
	components: [
		{kind: "FadeScroller", flex: 1, components: [
			{defaultKind: "ViewItem", components: [
				{kind: "Divider", caption: "Input"},
				
				{ viewKind: "input.KeyPresses", title: "Key Presses", className: "enyo-first", description: "Type and Capture"},
				{ viewKind: "input.ScreenMovement", title: "Screen Movement", description: "Mind your x's and y's"},
				{ viewKind: "input.Gestures", title: "Multitouch Gestures", className: "enyo-last", description: "Get finger happy"},
			]}
		]}
	]
});
