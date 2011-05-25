enyo.kind({
	name: "Spaz.ImageViewPopup",
	kind: enyo.Popup,
	scrim: true,
	modal: true,
	events: {
		onClose : ""
	},
	style: "height: 90%; width: 90%",
	components: [
		{kind: "enyo.HFlexBox", components: [
			{kind: "enyo.Spacer", flex: 1},
			{kind: "enyo.ToolButton", icon: "source/images/icon-close.png", onclick: "doClose"}	
		]},
		{name: "imageView", kind: "enyo.ImageView", flex: 1, style: "max-height: 90%; max-width: 90%;", onGetLeft: "getLeft", onGetRight: "getRight"}
	],
	
	setImages: function(inImages, inIndex) {
		this.images = inImages;
		this.index = inIndex;
		this.$.imageView.setCenterSrc(this.images[this.index]);
	},
	
	getLeft: function(inSender, inSnap) {
		inSnap && this.index--;
		return this.images[this.index - 1];
	},
	
	getRight: function(inSender, inSnap) {
		inSnap && this.index++;
		return this.images[this.index + 1];
	}
});
