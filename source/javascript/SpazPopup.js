enyo.kind({
	name: "Spaz.Popup",
	kind: "Popup",
	fixPositionY: true, // set this to false to get normal repositioning behavior
	current_y: null,
	openAtTopCenter:function() {
		this.setBoundsInfo("applyHalfCenterBounds", arguments);
		this.open();
	},
	'applyHalfCenterBounds':function(x_only) {
		this.applyBounds(this.calcHalfCenterPosition(x_only));
	},
	calcHalfCenterPosition: function(x_only) {
		var s = this.calcSize();
		var vp = this.calcViewport();
		var o = {
			left: Math.max(0, (vp.width - s.width) / 2),
			top: Math.max(0, ((vp.height - s.height) / 2) / 8) // dividing by 8 to get the popup close to top
		};
		
		if (this.fixPositionY && this.showing && x_only && this.current_y != null) {
			o.top = this.current_y;
		} else {
			this.current_y = o.top;
		}
		
		return o;
	},
	resizeHandler: function() {
		if (this.isOpen) {
			var args = arguments;
			// FIXME: Wait a beat to resize. We need to do this to dismiss correctly via a click 
			// when the device keyboard hides as the result of the click.
			// This is because the keyboard hides on mouse up and if it is in resize window mode, the
			// window resizes, prompting this resize handler to be called. Resizing a popup can result
			// in it moving position and this can move the button the user clicked on at mouseup time.
			// Moving a button underneath the mouse at mouse up time can prevent a click from firing.
			// Avoid this issue by deferring resize slightly; we only need the space between mouseup and click.
			enyo.asyncMethod(this, function() {
				this.applyBoundsInfo('x_only');
			});
		}
	},
	applyBoundsInfo: function(x_only) {
		x_only = !!x_only;
		var bi = this.boundsInfo;
		if (bi) {
			bi.args = [x_only];
			this.clearSizeCache();
			this.clearClampedSize();
			this[bi.method].apply(this, bi.args);
		}
	},
	clearClampedSize: function() {
		var s = this.getContentControl();
		if (this._clampedWidth) {
			s.applyStyle("max-width", null);
		}
		if (this._clampedHeight) {
			s.applyStyle("max-height", null);
		}
		this._clampedHeight = this._clampedWidth = false;
	}
});