/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "HeaderView",
	kind: enyo.VFlexBox,
	published: {
		title: "",
		description: ""
	},
	events: {
		onBack: "",
	},
	headerChrome: [
		{kind: "PageHeader", components: [
			{kind: "VFlexBox", flex: 1, components: [
				{name: "title"},
				{name: "description", style: "font-size: 14px"}
			]},
		{kind: "Button", caption: "Back", onclick:"backClicked"}
		]}
	],
	create: function(inProps) {
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
	},
	backClicked: function(){
		this.doBack();
	},
});
