/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "input.ScreenMovement",
	kind: HeaderView,
	noScroller: true,
	components: [
		{ kind: "PageHeader", content: "Drag or flick in the area below", flex: 0, style: "font-size: 16px", disabled: true},
		{
			kind: "VFlexBox", 
			className: "big_border", flex: 1, components:[{
					kind: "HtmlContent", 
					style:"border: 2px solid #000;margin-left:10px;margin-right:10px;",
					onmousedown: "showCoords",
					ondrag: "itemDrag",
					flex: 1, 
					onflick: "flickIt", 
					content: "drag area"
			}]
		},
		{kind: "HtmlContent", name: "txtResults", flex: 0, style: "height:100px;"}
	],
	showCoords: function(inSender, inEvent) {
		this.alertMe(inEvent.pageX, inEvent.pageY);
	},
	itemDrag: function(inSender, inEvent) {
		this.alertMe(inEvent.pageX, inEvent.pageY);
	},
	alertMe: function(_x, _y) {
		var resultText = "x = " + _x + "<br />" + "y = " + _y;
		this.$.txtResults.setContent( resultText );
	},
	flickIt: function(inSender, e) {
		this.$.txtResults.setContent( "flick velocity x = " + e.xVel + "<br />" + "flick velocity y = " + e.yVel );
	}
});