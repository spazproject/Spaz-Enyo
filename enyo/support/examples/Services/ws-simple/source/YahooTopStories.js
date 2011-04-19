/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.YahooTopStories",
	kind: enyo.VFlexBox,
	components: [
		{name: "getYahooTopStories", kind: "WebService",
			url: "http://query.yahooapis.com/v1/public/yql?q=select%20title%20from%20rss%20where%20url%3D%22http%3A%2F%2Frss.news.yahoo.com%2Frss%2Ftopstories%22&format=json",
			onSuccess: "gotYahooTopStories",
			onFailure: "gotYahooTopStoriesFailure"},
		{kind: "Button", caption: "Get Yahoo Top Stories", onclick: "btnClick"},
		{name: "list", kind: "VirtualList", flex: 1, onSetupRow: "listSetupRow", components: [
			{kind: "Item", layoutKind: "HFlexLayout", components: [
				{name: "title", flex: 1}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.results = [];
	},
	btnClick: function() {
		this.$.getYahooTopStories.call();
	},
	gotYahooTopStories: function(inSender, inResponse) {
		this.results = inResponse.query.results.item;
		this.$.list.refresh();
	},
	gotYahooTopStoriesFailure: function(inSender, inResponse) {
		console.log("got failure from getYahooTopStories");
	},
	listSetupRow: function(inSender, inRow) {
		var r = this.results[inRow];
		if (r) {
			this.$.title.setContent(r.title);
			return true;
		}
	}
});
