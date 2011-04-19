/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control designed to view an image, with support for zooming and panning.

	{kind: "ScrollingImage", src: "images/tree.jpg"}
*/
enyo.kind({
	name: "enyo.ScrollingImage",
	kind: enyo.SizeableImage,
	autoSize: false,
	className: "enyo-scrolling-image",
	chrome: [
		{name: "animator", kind: "Animator", onAnimate: "stepAnimation", onEnd: "endAnimation"},
		{name: "scroller", kind: "BasicScroller", className: "enyo-fit", components: [
			{name: "image", kind: "Image"}
		]}
	],
	//* @protected
	create: function() {
		this.inherited(arguments);
		this._scroller = this.$.scroller;
	}
});
