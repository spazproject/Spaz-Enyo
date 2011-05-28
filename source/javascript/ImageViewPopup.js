enyo.kind({
	name: "Spaz.ImageViewPopup",
	kind: enyo.Popup,
	scrim: true,
	modal: true,
	events: {
		onClose : ""
	},
	style: "height: 100%; width: 100%; ",
	className: "enyo-imageviewpopup",
	components: [
		{kind: "enyo.ToolButton", style: "position: absolute; right: 10px; top: 10px; z-index: 1000;", icon: "source/images/icon-close.png", onclick: "doClose"},	
		{name: "imageView", kind: "enyo.ImageView", style: "margin: 10px;", height: "100%", flex: 1, onGetLeft: "getLeft", onGetRight: "getRight"}
	],
	
	setImages: function(inImages, inIndex) {
		this.$.imageView.applyStyle("height", window.innerHeight - 20 + "px");
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
