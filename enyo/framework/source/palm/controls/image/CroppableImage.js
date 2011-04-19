/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A control designed to crop a zoomable, pannable image.

onCrop returns the paramaters necessary to crop the image


	{
		suggestedXtop: left pixel start of the cropped image
		suggestedYtop: top pixel start of the cropped image
		suggestedScale: zoom%
		suggestedXsize: rounded X size of the cropped image
		suggestedYsize: rounded Y size of the cropped image
		sourceWidth: original image width
		sourceHeight: original image height
		sourceImage: absolute path to the image
		focusX: center of the cropped image in relation to width
		focusY: center of the cropped image in relation to height
	}

Use a CroppableImage like so:

	{kind: "VFlexBox", components: [
		{kind: "CroppableImage" src:"image.jpg", flex:1, onCrop "cropHandler"},
		{kind: "Button", onclick:"crop"}
	]}

	crop: function() { this.$.croppableImage.getCropParams() }
*/

enyo.kind({
	name:"enyo.CroppableImage",
	kind:"enyo.ScrollingImage",
	events: {
		onCrop:""
	},
	getCropParams: function() {
		var zoom = this.getZoom();
		var height = this._imageHeight;
		var width = this._imageWidth;
		var bounds = this._scroller.getBounds();
		var top = this._scroller.getScrollTop();
		var left = this._scroller.getScrollLeft();
		var focusX = (left + bounds.width/2) / (width*zoom);
		var focusY = (top + bounds.height/2) / (height*zoom);
		var sizeY = bounds.height / zoom;
		var sizeX = bounds.width / zoom;
		// Keep mojo2 names, for better or for worse
		var outParams = {
			scale: zoom,
			suggestedXtop: Math.max(0,Math.round((width * focusX) - (sizeX / 2))),
			suggestedYtop: Math.max(0,Math.round((height * focusY) - (sizeY / 2))),
			suggestedScale: zoom * 100,
			suggestedXsize: Math.round(sizeX),
			suggestedYsize: Math.round(sizeY),
			sourceWidth: width,
			sourceHeight: height,
			sourceImage: enyo.makeAbsoluteUrl(window,this.src),
			focusX: focusX,
			focusY: focusY
		};
		this.doCrop(outParams);
	},
	//* @protected
	autoSize:true,
	className:"enyo-croppable-image",

});
