/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A <a href="#enyo.Carousel">Carousel</a> that is designed to view an image full-screen, with support for zooming and panning, while optionally moving between additional images.
It can be used to display a single image, or a set of images that may be flipped through.

	{kind: "ImageView", flex: 1, onGetLeft: "getLeft", onGetRight: "getRight"}

Use <code>centerSrc</code> to specify the center image, and the <code>onGetLeft</code> and <code>onGetRight</code> events to build a scrolling list of images.

	create: function() {
		this.inherited(arguments);
		this.$.imageView.setCenterSrc(this.getImageUrl(this.index));
	},
	getImageUrl: function(inIndex) {
		var n = this.images[inIndex];
		if (n) {
			return "images/" + n;
		}
	},
	getLeft: function(inSender, inSnap) {
		inSnap && this.index--;
		return this.getImageUrl(this.index-1);
	},
	getRight: function(inSender, inSnap) {
		inSnap && this.index++;
		return this.getImageUrl(this.index+1);
	}
*/
enyo.kind({
	name: "enyo.ImageView",
	kind: enyo.Carousel,
	published: {
		// an array of config objects or strings representing image's src
		images: [],
		centerSrc: ""
	},
	defaultKind: "ViewImage",
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.centerSrcChanged();
		if (this.images && this.images.length) {
			this.imagesChanged();
		}
	},
	centerSrcChanged: function() {
		if (this.centerSrc) {
			this.setCenterView(this.centerSrc);
		}
	},
	imagesChanged: function() {
		this.setViews(this.images);
	},
	getImages: function() {
		return this.views;
	},
	//* @public
	/**
	 Adds additional images to the ImageView.
	 @param {Object} inImages
	 */
	addImages: function(inImages) {
		this.addViews(inImages);
	}
});

// BC
enyo.BasicImageView = enyo.ImageView;