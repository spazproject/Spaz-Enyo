/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "input.Gestures",
	kind: enyo.VFlexBox,
	noScroller: true,
	components: [
		{ kind: "PageHeader", content: "Place 2 fingers in the box below to test gesture events", flex: 0, style: "font-size: 16px", disabled: true },
		{
			kind: "VFlexBox", 
			className: "big_border", flex: 1, components:[{
				kind: "HtmlContent", 
				style:"border: 2px solid #000;margin-left:10px;margin-right:10px;background-color:gray;",
				onmousedown: "ShowCoords",
				ongesturestart: "itemGestureStart", 
				ongesturechange: "itemGestureChange", 
				ongestureend: "itemGestureEnd",
				flex: 1
				}]
		},
		{kind: "HtmlContent", name: "txtResults", flex: 0, style: "height:100px;"}
	],
	itemGestureStart: function(inSender, inEvent) {
		var resultText = "Gesture Center @ " + inEvent.pageX + ", " + inEvent.pageY;
		this.AlertMe( resultText );
	},
	itemGestureChange: function(inSender, inEvent) {
		var resultText = "Gesture Center @ " + inEvent.pageX + ", " + inEvent.pageY + "<br />";
		resultText += "Gesture Scale = " + inEvent.scale + "<br />";
		resultText += "Gesture Rotation = " + inEvent.rotation;
		
		this.AlertMe( resultText );
	},
	itemGestureEnd: function(inSender, inEvent) {
		this.AlertMe( "Gesture ended" );
	},
	AlertMe: function(resultText) {
		this.$.txtResults.setContent( resultText );
	}
});