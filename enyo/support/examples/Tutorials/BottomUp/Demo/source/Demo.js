/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.ExampleView",
	kind: enyo.HFlexBox,
	components: [
		{flex: 1, className: "view", components: [
			{name: "view", kind: enyo.Iframe, className: "enyo-fit"}
		]},
		{name: "source", kind: enyo.AjaxContent, flex: 2, className: "source", onContentChanged: "sourceChange"}
	],
	setSrc: function(inSrc) {
		this.log(inSrc);
		this.src = inSrc;
		this.$.view.setUrl("../" + inSrc);
		this.$.source.setUrl("../" + inSrc);
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
		{className: "button-bar", components: [
			{nodeTag: "span", content: "Prev", className: "button", onclick: "prevClick"},
			{name: "next", nodeTag: "span", content: "Next", className: "button", style: "margin: 4px;", onclick: "nextClick"}
		]},
		{name: "title", style: "padding: 8px; border: 1px solid silver; background-color: #FFFFFF;"},
		{content: "More exposition goes here.", style: "padding: 16px 8px; border-bottom: 1px solid silver;"},
		{kind: enyo.Pane, flex: 1, transitionKind: "enyo.transitions.Simple", components: [
			{name: "exampleView1", kind: enyo.Canon.ExampleView, flex: 1},
			{name: "exampleView2", kind: enyo.Canon.ExampleView, flex: 1}
		]}
	],
	sources: [
		"01.html",
		"02.html",
		"03.html",
		"04.html"
	],
	create: function() {
		this.inherited(arguments);
		this.v1 = this.$.exampleView1;
		this.v2 = this.$.exampleView2;
		this.setIndex(0);
		this.index = 0;
	},
	setIndex: function(inIndex) {
		// cache the index
		this.index = inIndex;
		// the source file for this index
		var src = this.sources[inIndex];
		// load these files, if they are not already loaded
		if (this.v2.src !== src) {
			this.v2.setSrc(this.sources[inIndex]);
		}
		// source title
		var h = "../" + src;
		this.$.title.setContent(src + ' (<a target="_blank" href="' + h + '">' + h + '/</a>)');
		// transition to the view displaying this source
		this.$.pane.selectViewByIndex((this.$.pane.getViewIndex() + 1) % 2);
		// rotate the view references
		var v = this.v1;
		this.v1 = this.v2;
		this.v2 = v;
		// preload next view
		var src = this.sources[inIndex + 1];
		if (src && this.v2.src !== src) {
			//this.v2.setSrc(this.sources[inIndex + 1]);
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