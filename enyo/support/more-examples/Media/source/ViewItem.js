/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "ViewItem",
	kind: enyo.Item,
	tapHighlight: true,
	published: {
		title: "",
		description: "",
		viewKind: ""
	},
	components: [
		{name: "title"},
		{name: "description", style: "font-size: 14px"}
	],
	create: function(inProps) {
		this.inherited(arguments);
		this.titleChanged();
		this.descriptionChanged();
	},
	titleChanged: function() {
		this.$.title.setContent(this.title);
	},
	descriptionChanged: function() {
		this.$.description.setContent(this.description);
	},
	// default click handling
	clickHandler: function() {
		// make assumption here about the owner and set the view
		var c = this.owner.owner.setView(this.viewKind);
		// set title and description to HeaderView
		if (c && c instanceof HeaderView) {
			c.setTitle(this.title);
			c.setDescription(this.description);
		}
		this.inherited(arguments);
	}
});
