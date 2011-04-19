/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.ExampleView",
	kind: enyo.HFlexBox,
	components: [
		{flex: 2, className: "view", components: [
			{name: "view", kind: enyo.Iframe, className: "enyo-fit"}
		]},
		{flex: 2, name: "source", kind: "AjaxContent", className: "source", onContentChanged: "sourceChange"}
	],
	setSrc: function(inSrc) {
		//this.log(inSrc);
		this.src = inSrc;
		this.$.view.setUrl("../" + inSrc);
		this.$.source.setUrl("../" + inSrc + "/index.html");
	},
	sourceChange: function(inSender) {
		var c = inSender.content.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		inSender.content = c;
	}
});

enyo.kind({
	name: "enyo.Canon.Demo",
	kind: enyo.VFlexBox, 
	components: [
		{kind: enyo.HFlexBox, components: [
			{className: "button-bar", components: [
				{nodeTag: "span", content: "Prev", className: "button", onclick: "prevClick"},
				{name: "next", nodeTag: "span", content: "Next", className: "button", style: "margin: 4px;", onclick: "nextClick"}
			]},
			{flex: 1, name: "title", style: "padding: 16px 8px; border: 1px solid silver; background-color: #FFFFFF;"},
		]},
		//{content: "Usually Views would be separated into separate modules, but it's all inline here for simplicity. Don't forget to CLICK THE STAGES (the green boxes) to see all the scenes.", style: "padding: 16px 8px; border-bottom: 1px solid silver;"},
		{kind: enyo.Pane, flex: 1, components: [
			{name: "exampleView1", kind: enyo.Canon.ExampleView, flex: 1},
			{name: "exampleView2", kind: enyo.Canon.ExampleView, flex: 1},
			{name: "exampleView3", kind: enyo.Canon.ExampleView, flex: 1},
			{name: "exampleView4", kind: enyo.Canon.ExampleView, flex: 1}
		]}
	],
	sources: [
		"0-theme",
		"1-theme",
		"2-theme",
		"3-theme"
	],
	create: function() {
		this.inherited(arguments);
		this.v1 = this.$.exampleView1;
		this.v2 = this.$.exampleView2;
		this.v3 = this.$.exampleView3;
		this.setIndex(0);
		this.index = 0;
	},
	setIndex: function(inIndex) {
		var src = this.sources[inIndex];
		if (this.v2.src !== src) {
			this.v2.setSrc(this.sources[inIndex]);
		}
		//
		var h = "../" + src;
		this.$.title.setContent(src + ' (<a target="_blank" href="' + h + '">' + h + '/</a>)');
		//
		this.$.pane.selectViewByIndex((this.$.pane.getViewIndex() + 1) % 2);
		//
		var v = this.v1;
		this.v1 = this.v2;
		this.v2 = v;
		this.index = inIndex;
		//
		// preload next view
		var src = this.sources[inIndex + 1];
		if (src && this.v2.src !== src) {
			this.v2.setSrc(this.sources[inIndex + 1]);
		}
	},
	nextClick: function() {
		if (this.index < this.sources.length-1) {
			this.setIndex(this.index + 1);
		}
	},
	prevClick: function() {
		if (this.index > 0) {
			this.setIndex(this.index - 1);
		}
	}
});