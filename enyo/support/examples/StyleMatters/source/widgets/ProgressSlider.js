/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.ProgressSlider",
	kind: HeaderView,
	components: [
		{kind: "ProgressSlider", lockBar: true, position: 20},
		{kind: "Button", caption: "Toggle Progress!", onclick: "toggleProgress"}
	],
	toggleProgress: function() {
		var p = this.$.progressSlider;
		if (this._progressing) {
			clearInterval(this._progressing);
			this._progressing = null;
		} else {
			this._progressing = setInterval(enyo.hitch(this, function() {
				var i = p.minimum + ((p.position - p.minimum + 5) % (p.calcRange() + 1));
				p.setPositionImmediate(i);
			}), 300);
		}
	}
});