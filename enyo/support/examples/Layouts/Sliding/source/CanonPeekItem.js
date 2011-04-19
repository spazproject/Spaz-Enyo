/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.CanonPeekItem",
	kind: "Item",
	layoutKind: "HFlexLayout",
	align: "center",
	published: {
		caption: ""
	},
	components: [
		{kind: "Button", name: "caption", flex: 1}
	],
	create: function() {
		this.inherited(arguments);
		this.captionChanged();
	},
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
	}
});
