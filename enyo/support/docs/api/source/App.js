/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "App",
	kind: enyo.HFlexBox,
	components: [
		{kind: "VFlexBox", width: "320px", style: "border-right: 1px solid gray;", components: [
			{kind: "RadioGroup", style: "padding: 10px;", onChange: "radioGroupChange", components: [
				{caption: "Packages", flex: 1},
				{caption: "Index", flex: 1}
			]},
			{kind: "Pane", flex: 1, onclick: "tocClick", className: "selectable", domAttributes: {"enyo-pass-events": true}, components: [
				{name: "toc", className: "toc"},
				{name: "index", style: "padding: 10px; background: white; overflow: auto;"}
			]}
		]},
		{flex: 1, kind: "VFlexBox", style: "background: white; overflow: auto; padding: 10px;", components: [
			{name: "docs", onclick: "docClick", requiresDomMousedown: true, className: "selectable"}
		]}
	],
	create: function() {
		window.onhashchange = enyo.bind(this, 'hashChange');
		this.modules = enyo.Module.topicMap;
		this.inherited(arguments);
		this.$.toc.setContent(enyo.Module.buildToc());
		this.nextDoc();
	},
	docsFinished: function() {
		this.$.index.setContent(enyo.Module.buildIndex());
		this.selectTopic(window.location.hash.slice(1) || "base/core/Component.js");
	},
	radioGroupChange: function(inSender, inValue) {
		this.$.pane.selectViewByIndex(inValue);
	},
	tocClick: function(inSender, inEvent) {
		try {
			this.selectTopic(inEvent.target.hash.slice(1));
		} catch(x) {
		}
	},
	docClick: function(inSender, inEvent) {
		try {
			this.selectTopic(inEvent.target.parentNode.hash.slice(1));
		} catch(x) {
		}
	},
	selectTopic: function(inTopic) {
		this.topic = inTopic;
		var c = this.modules[inTopic];
		this.$.docs.setContent(c && c.renderContent() || "(no topic)");
		var a = document.anchors[inTopic];
		if (a) {
			a.scrollIntoView();
		}
	},
	hashChange: function() {
		var topic = window.location.hash.slice(1);
		if (topic != this.topic) {
			this.selectTopic(topic);
		}
	},
	//
	docIndex: 0,
	nextDoc: function() {
		var m = enyo.modules[this.docIndex++];
		if (m) {
			this.loadDoc(m.path);
		} else {
			this.docsFinished();
		}
	},
	loadDoc: function(inUrl) {
		enyo.xhrGet({
			url: inUrl,
			load: enyo.bind(this, "docLoaded", inUrl)
		});
	},
	docLoaded: function(inUrl, d) {
		this.addDocs(inUrl, d);
		this.nextDoc();
	},
	addDocs: function(inPath, inCode) {
		// remove crufty part of path
		var module = enyo.Module.relativizePath(inPath);
		this.modules[module] = this.createComponent({kind: "Module", name: module, path: module, source: inCode});
	}
});
