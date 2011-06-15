enyo.kind({
	name: "Spaz.Popup",
	kind: "Popup",
	openAtHalfCenter:function() {
		this.setBoundsInfo("applyHalfCenterBounds", arguments);
		this.open();
	},
	'applyHalfCenterBounds':function() {
		this.applyBounds(this.calcHalfCenterPosition());
	},
	calcHalfCenterPosition: function() {
		var s = this.calcSize();
		var vp = this.calcViewport();
		var o = {
			left: Math.max(0, (vp.width - s.width) / 2),
			top: Math.max(0, ((vp.height - s.height) / 2) / 4)
		};
		return o;
	},
	resizeHandler: function() {
		alert('resizeHandler');
	}
});