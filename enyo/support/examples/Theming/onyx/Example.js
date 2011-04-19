/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "Example",
	kind: enyo.Control,
	published: {
		caption: ""
	},
	style: "margin: 24px 12px; border: 1px solid #333;",
	components: [
		{name: "caption", style: "padding: 6px; background: #bbb"},
		{name: "client", style: "padding: 12px"}
	],
	create: function() {
		this.inherited(arguments);
		this.captionChanged();
	},
	captionChanged: function() {
		this.$.caption.setContent(this.caption);
	},
	layoutKindChanged: function() {
		this.$.client.align = this.align;
		this.$.client.pack = this.pack;
		this.$.client.setLayoutKind(this.layoutKind);
	}
});