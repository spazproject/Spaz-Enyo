/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.CanonPagedVirtualList", 
	kind: enyo.VFlexBox,
	pageSize: 10,
	components: [
		{name: "flickrSearch", kind: "WebService", onSuccess: "gotSearchResults", onFailure: "gotSearchFailure"},
		{kind: "PageHeader", content: "Flickr Search"},
		{kind: "RowGroup", components: [
			{name: "input", kind: "Input", hint: "Enter Search Filter..."},
			{kind: "Button", caption: "Search", tapHighlight: false, onclick: "searchBtnClick"}
		]},
		{kind: "Divider", caption: "Search Results"},
		{kind: enyo.HFlexBox, flex: 1, components: [
			{name: "list", kind: enyo.VirtualList, flex: 1, 
				onSetupRow: "setupRow",
				onAcquirePage: "acquirePage",
				onDiscardPage: "discardPage",
				components: [
					{kind: "Item", layoutKind: "HFlexLayout", onclick: "itemClick", components: [
						{name: "thumbnail", kind: "Image", width: "64px", height: "64px"},
						{name: "title", flex: 1, style: "font-size: 16px; padding: 20px 0 0 20px;"}
					]}
				]
			}
		]},
		{kind: "HFlexBox", align: "right", components: [
			{kind: "Spinner", showing: false}
		]}
	],
	constructor: function() {
		this.inherited(arguments);
		this.pages = [];
	},
	create: function() {
		this.inherited(arguments);
		this.$.list.pageSize = this.pageSize;
	},
	fetchRow: function(inIndex) {
		var page = Math.floor(inIndex / this.pageSize);
		var p = this.pages[page];
		if (!p || !p.data) {
			return null;
		}
		var row = inIndex - (page * this.pageSize);
		if (inIndex < 0) {
			row -= (this.pageSize - p.data.length);
		}
		return p.data[row];
	},
	setupRow: function(inSender, inRow) {
		var data = this.fetchRow(inRow);
		if (data) {
			this.$.thumbnail.setSrc(data.photoUrl_thumb);
			this.$.title.setContent(data.title);
			return true;
		}
	},
	acquirePage: function(inSender, inPage) {
		if (inPage >= 0 && !this.pages[inPage]) {
			return this.search(inPage);
		}
	},
	discardPage: function(inSender, inPage) {
	},
	searchBtnClick: function() {
		this.filter = this.$.input.getValue();
		if (!this.filter) {
			this.filter = "sushi";
			this.$.input.setValue(this.filter);
		}
		this.pages = [];
		this.$.list.punt();
		this.$.list.reset();
	},
	search: function(inPage) {
		this.log(inPage);
		if (!this.filter) {
			return false;
		}
		var i = inPage*this.pageSize;
		var range = i + "%2C" + (i+this.pageSize);
		var url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20flickr.photos.search(" + range + ")%20where%20text%3D%22" + this.filter + "%22&format=json&callback=";
		this.$.flickrSearch.setUrl(url);
		var r = this.$.flickrSearch.call(null, {pageIndex: inPage});
		this.$.spinner.setShowing(true);
		return true;
	},
	gotSearchResults: function(inSender, inResponse, inRequest) {
		var pageIndex = inRequest.pageIndex;
		this.$.spinner.setShowing(false);
		var photos = inResponse.query.results.photo;
		for (var i=0, p; p = photos[i]; i++) {
			var urlprefix = "http://farm" + p.farm + ".static.flickr.com/" + p.server + "/" + p.id + "_" + p.secret;
			p.photoUrl_thumb = urlprefix + "_s.jpg"
			p.photoUrl = urlprefix + ".jpg"
		}
		this.pages[pageIndex] = {
			data: photos
		};
		// after getting the first batch of data, tell the list to render; alternative is to scroll the empty list
		if (pageIndex == 0) {
			this.$.list.refresh();
		}
	},
	gotSearchFailure: function() {
		this.$.spinner.setShowing(false);
		this.log("got search failure!");
	}
})