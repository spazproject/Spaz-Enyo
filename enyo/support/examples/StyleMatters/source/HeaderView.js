/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "HeaderView",
	kind: enyo.VFlexBox,
	published: {
		title: "",
		description: ""
	},
	headerChrome: [
		{kind: "Header", layoutKind: "VFlexLayout", align: "start", components: [
			{name: "title"},
			{name: "description", style: "font-size: 14px"}
		]}
	],
	create: function(inProps) {
		//this.chrome = this.headerChrome.concat(this.chrome || []);
		this.inherited(arguments);
		this.titleChanged();
		this.descriptionChanged();
	},
	initComponents: function() {
		this.createChrome(this.headerChrome);
		this.inherited(arguments);
	},
	titleChanged: function() {
		this.$.title.setContent(this.title);
	},
	descriptionChanged: function() {
		this.$.description.setContent(this.description);
	}
});
