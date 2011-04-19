/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control that allows you to play video.  This component is an abstraction of HTML 5 Video.

Initialize a video component as follows:

	{kind: "Video", src: "http://www.w3schools.com/html5/movie.mp4"}
	
To play a video, do this:

	this.$.video.play();

You can get a reference to the actual HTML 5 Video element via <code>this.$.video.node</code>.
*/
enyo.kind({
	name: "enyo.Video",
	kind: enyo.Control,
	published: {
		src: "",
		showControls: true,
		autoplay: false,
		loop: false
	},
	//* @protected
	nodeTag: "video",
	create: function() {
		this.inherited(arguments);
		this.srcChanged();
		this.showControlsChanged();
		this.autoplayChanged();
	},
	srcChanged: function() {
		var path = enyo.path.rewrite(this.src);
		this.setAttribute("src", path);
	},
	showControlsChanged: function() {
		this.setAttribute("controls", this.showControls ? "controls" : null);
	},
	autoplayChanged: function() {
		this.setAttribute("autoplay", this.autoplay ? "autoplay" : null);
	},
	loopChanged: function() {
		this.setAttribute("loop", this.loop ? "loop" : null);
	},
	//* @public
	play: function() {
		if (this.hasNode()) {
			if (!this.node.paused) {
				this.node.currentTime = 0;
			} else {
				this.node.play();
			}
		}
	},
	pause: function() {
		if (this.hasNode()) {
			this.node.pause();
		}
	}
});