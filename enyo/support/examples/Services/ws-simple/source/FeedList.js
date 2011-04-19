/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.FeedList",
	kind: enyo.VFlexBox,
	components: [
		{name: "getFeed", kind: "WebService",
			onSuccess: "gotFeed",
			onFailure: "gotFeedFailure"},
		{kind: "RowGroup", caption: "Feed URL", components: [
			{kind: "Input", value: "http://rss.cnn.com/rss/cnn_topstories.rss", components: [
				{kind: "Button", caption: "Get Feed", onclick: "btnClick"},
			]}
		]},
		{name: "list", kind: "VirtualList", flex: 1, onSetupRow: "listSetupRow", components: [
			{kind: "Item", layoutKind: "VFlexLayout", components: [
				{name: "title", kind: "Divider"},
				{name: "description"}
			]}
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.results = [];
	},
	btnClick: function() {
		var url = "http://query.yahooapis.com/v1/public/yql?q=select%20title%2C%20description%20from%20rss%20where%20url%3D%22" + this.$.input.getValue() + "%22&format=json&callback=";
		this.$.getFeed.setUrl(url);
		this.$.getFeed.call();
	},
	gotFeed: function(inSender, inResponse) {
		this.results = inResponse.query.results.item;
		this.$.list.refresh();
	},
	gotFeedFailure: function(inSender, inResponse) {
		console.log("got failure from getFeed");
	},
	listSetupRow: function(inSender, inRow) {
		var r = this.results[inRow];
		if (r) {
			this.$.title.setCaption(r.title);
			this.$.description.setContent(r.description);
			return true;
		}
	}
});