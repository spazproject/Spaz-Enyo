/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.ImageViews",
	kind: HeaderView,
	components: [
		{kind: "Divider", caption: "EXAMPLES"},
		{kind: "ViewItem", className: "enyo-first", viewKind: "widgets.ImageViewSingle",
			title: "One image"},
		{kind: "ViewItem", viewKind: "widgets.ImageViewList",
			title: "List of images"},
		{kind: "ViewItem", className: "enyo-last", viewKind: "widgets.ImageViewDynamic",
			title: "Load images dynamically as needed",
			description: "Using events onGetLeft and onGetRight to build a scrolling list of images"}
	]
});

enyo.kind({
	name: "widgets.ImageViewSingle",
	kind: HeaderView,
	noScroller: true,
	components: [
		{name: "imageView", kind: "BasicImageView", flex: 1, images: ["images/01.jpg"]}
	],
	resizeHandler: function() {
		this.$.imageView.resize();
	}
});

enyo.kind({
	name: "widgets.ImageViewList",
	kind: HeaderView,
	noScroller: true,
	components: [
		{kind: "PrevNextBanner", onPrevious: "previous", onNext: "next", components: [
			{kind: "Spacer"},
			{kind: "IntegerPicker", max: 11, label: "Image", onChange: "pickerChange"},
			{kind: "Spacer"}
		]},
		{name: "imageView", kind: "BasicImageView", flex: 1, onSnap: "snap", images: [
			"images/01.jpg",
			"images/02.jpg",
			"images/03.jpg",
			"images/04.jpg",
			"images/05.jpg",
			"images/06.jpg",
			"images/07.jpg",
			"images/08.jpg",
			"images/09.jpg",
			"images/10.jpg",
			"images/11.jpg",
			"images/12.jpg",
		]}
	],
	resizeHandler: function() {
		this.$.imageView.resize();
	},
	pickerChange: function(inSender, inValue) {
		this.$.imageView.snapTo(inValue);
	},
	previous: function() {
		this.$.imageView.previous();
	},
	next: function() {
		this.$.imageView.next();
	},
	snap: function(inSender, inValue) {
		this.$.integerPicker.setValue(inValue);
	}
});

enyo.kind({
	name: "widgets.ImageViewDynamic",
	kind: HeaderView,
	noScroller: true,
	components: [
		{kind: "PrevNextBanner", onPrevious: "previous", onNext: "next"},
		{kind: "ImageView", flex: 1,
			onGetLeft: "getLeft",
			onGetRight: "getRight"
		}
	],
	images: ["01.jpg", "02.jpg", "03.jpg", "04.jpg", "05.jpg", "06.jpg", "07.jpg", "08.jpg", "09.jpg", "10.jpg", "11.jpg", "12.jpg", ],
	index: 5,
	create: function() {
		this.inherited(arguments);
		this.$.imageView.setCenterSrc(this.getImageUrl(this.index));
	},
	resizeHandler: function() {
		this.$.imageView.resize();
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
	},
	previous: function() {
		this.$.imageView.previous();
	},
	next: function() {
		this.$.imageView.next();
	}
});
