/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "Main",
	kind: "VFlexBox",
	events: {
		onItemSelected: "",
	},
	components: [
		{kind: "FadeScroller", flex: 1, components: [
			{defaultKind: "ViewItem", components: [
				{kind: "Divider", caption: "Input"},
				{viewKind: "input.KeyPresses", title: "Key Presses", onSelected:'itemSelected', description: "Type and Capture", className: "enyo-first"},
				{viewKind: "input.ScreenMovement", title: "Screen Movement", onSelected:'itemSelected', description: "Mind your x's and y's"},
				{viewKind: "input.Gestures", title: "Multitouch Gestures", onSelected:'itemSelected', description: "Get finger happy"}
			]}
		]}
	],	
	itemSelected: function(inSender, inEvent){
		this.doItemSelected(inEvent)
	}
});
