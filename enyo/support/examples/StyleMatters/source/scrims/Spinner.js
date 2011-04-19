/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "scrims.Spinner",
	kind: HeaderView,
	components: [
		{kind: "Button", caption: "Show Scrim", onclick: "btnClick"},
		{kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [
			{kind: "SpinnerLarge"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.$.scrim.show();
	},
	clickHandler: function() {
		this.$.scrim.hide();
		return;
	},
	btnClick: function() {
		this.$.scrim.show();
		return true;
	}
});