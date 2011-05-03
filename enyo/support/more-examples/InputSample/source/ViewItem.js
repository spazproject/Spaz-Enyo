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
	events: {
		onSelected: "",
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
		this.doSelected({
						 viewKind:this.viewKind, 
						 title:this.title, 
						 description:this.description
						});
	}
});
