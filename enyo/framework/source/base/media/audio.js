/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Audio",
	kind: enyo.Control,
	published: {
		src: "",
		preload: true
	},
	nodeTag: "audio",
	//* @protected
	create: function() {
		if (window.PhoneGap) {
			this.nodeTag = "span";
			this.showing = false;
		}
		this.inherited(arguments);
		this.srcChanged();
		this.preloadChanged();
	},
	srcChanged: function() {
		var path = enyo.path.rewrite(this.src);
		if (window.PhoneGap) {
			this.media = new Media(path);
		}
		this.setAttribute("src", path);
	},
	preloadChanged: function() {
		this.setAttribute("autobuffer", this.preload ? "autobuffer" : null);
		this.setAttribute("preload", this.preload ? "preload" : null);
	},
	//* @public
	play: function() {
		if (window.PhoneGap) {
			//new Media(this.src).play()
			this.media.play();
		} else {
			if (this.hasNode()) {
				if (!this.node.paused) {
					this.node.currentTime = 0;
				} else {
					this.node.play();
				}
			}
		}
	}
});