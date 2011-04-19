/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.VideoObjectView",
	kind: HeaderView,
	title: "Embedded Video",
	description: "This is a subset of what you can do with direct video object manipulation.",
	components: [
	{name: "video", kind:"Video", showControls: false, src:"http://cdn.kaltura.org/apis/html5lib/kplayer-examples/media/bbb_trailer_iphone270P.m4v"},
	{name:"playButton", kind: "Button", caption: "Play", onclick: "play"}
	],
	create: function() {
		this.inherited(arguments);
	},
	play: function() {
		this.$.video.play();
	}
});