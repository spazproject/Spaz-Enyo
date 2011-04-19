/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "CropExample",
	kind: "VFlexBox",
	components: [
		{kind:"PageHeader", content:"This is an app with a CroppableImage, and a few controls to showcase the functionality"},
		{name:"curValue"},
		{kind:"Slider", minimum:1, maximum: 50, onChange: "setZoomRatio", onChanging:"showValue"},
		{kind:"Button", onclick:"grab"},
		{kind:"Popup", modal:true, scrim:true, components: [
			{name:"output"},
			{kind:"Button", onclick:"closePopup"}
		]},
		{flex:1, kind:"CroppableImage", onCrop:"cropBack", src:"image1.jpg"},
	],
	initComponents: function() {
		this.inherited(arguments);
		var zr = this.$.croppableImage.getMaxZoomRatio();
		this.$.slider.setPosition(zr);
		this.showValue(this,zr);
	},
	setZoomRatio: function(_,inValue) {
		this.showValue(_,inValue);
		this.$.croppableImage.setMaxZoomRatio(inValue);
	},
	grab: function() {
		this.$.croppableImage.getCropParams();
	},
	cropBack: function(_,inValue) {
		var p = enyo.json.stringify(inValue,"",1);
		p = p.replace(/\n/g,"<br/>");
		this.$.output.setContent(p);
		this.$.popup.openAtCenter();
	},
	closePopup: function() {
		this.$.popup.close();
	},
	showValue: function(_,inValue) {
		this.$.curValue.setContent("Zoom Ratio: " + inValue);
	}
});
