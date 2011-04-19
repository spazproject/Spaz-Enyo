/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.WsSimple",
	kind: enyo.VFlexBox,
	components: [
		{name: "pane", kind: "Pane", flex: 1, components: [
			{kind: "VFlexBox", className: "enyo-bg", components: [
				{kind: "PageHeader", content: "WebService Samples"},
				{kind: "Button", caption: "Get Local File", onclick: "getLocalFileClick"},
				{kind: "Button", caption: "Yahoo Top Stories", onclick: "yahooTopStoriesClick"},
				{kind: "Button", caption: "Feed List", onclick: "feedListClick"}
			]},
			{kind: "Canon.GetLocalFile", className: "enyo-bg"},
			{kind: "Canon.YahooTopStories", className: "enyo-bg"},
			{kind: "Canon.FeedList", className: "enyo-bg"}
		]}
	],
	getLocalFileClick: function() {
		this.$.pane.selectViewByName("getLocalFile");
	},
	yahooTopStoriesClick: function() {
		this.$.pane.selectViewByName("yahooTopStories");
	},
	feedListClick: function() {
		this.$.pane.selectViewByName("feedList");
	},
	backHandler: function(inSender, e) {
		this.$.pane.back(e);
	}
});