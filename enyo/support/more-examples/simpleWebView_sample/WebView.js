/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.WebViewSample",
	kind: "enyo.Scroller",
	className: "layout",
	domStyles: {"background-color":"#FFFFFF"},
	components: [{
		kind: "RowGroup",
		caption: "URL",
		components: [{
			kind: "HFlexBox",
			components: [{
				kind: "Input",
				name: "txtURL",
				value: "http://www.palm.com",
				flex: 4
				}, {
				kind: "Button",
				className: "enyo-button-affirmative",
				caption: "GO!",
				onclick: "gotoURL",
				flex: 1
				}]
		}]
	}, {
		kind: "WebView", 
		name: "myWebView",
		url: "http://www.palm.com"
	}],
	gotoURL: function() {
		this.$.myWebView.setUrl(this.$.txtURL.value);
	}
});
