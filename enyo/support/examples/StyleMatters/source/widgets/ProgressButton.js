/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "widgets.ProgressButton",
	kind: HeaderView,
	components: [
		{kind: "ProgressButton", position: 50, components: [
			{content: "0"},
			{kind: "Spacer"},
			{content: "100"}
		]},
		{kind: "Button", caption: "Toggle Progress!", onclick: "toggleProgress"}
	],
	toggleProgress: function() {
		var p = this.$.progressButton;
		if (this._progressing) {
			clearInterval(this._progressing);
			this._progressing = null;
		} else {
			this._progressing = setInterval(enyo.hitch(this, function() {
				var i = p.minimum + ((p.position - p.minimum + 5) % (p.calcRange() + 1));
				p.setPosition(i);
			}), 500);
		}
	}
});