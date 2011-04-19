/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "storage.Cookie",
	kind: HeaderView,
	components: [
		{name: "setButton", kind: "Button", caption: "Set Cookie", onclick: "setCookie"},
		{name: "getButton", kind: "Button", caption: "Get Cookie", onclick: "getCookie"},
		{name: "cookieInfo", kind: "HtmlContent"},
	],
	setCookie: function() {
		enyo.setCookie("userInfo", "frankie");
	},
	getCookie: function() {
		var userInfo = enyo.getCookie("userInfo");		
		this.$.cookieInfo.setContent(enyo.json.stringify(userInfo));
	}
});