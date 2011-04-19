/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "network.AJAXPost",
	kind: HeaderView,
	components: [
		{name: "postButton", kind: "Button", caption: "Send Post", onclick: "sendPost"},
		{name: "postResponse", kind: "HtmlContent"},
		{name: "post", kind: "WebService",
		    url: "http://www.snee.com/xml/crud/posttest.cgi",
	        method: "POST",
	        onSuccess: "onSuccess",
	        onFailure: "onFailure"}
	],
	sendPost: function() {
	 	var postdata='fname=enda&lname=mcgrath';
		this.$.post.call({
			handleAs: "text",
			postBody: postdata, 
			contentType: 'application/x-www-form-urlencoded'
		});
	},
	onSuccess: function(inSender, inResponse) {
		this.$.postResponse.setContent(inResponse);
		console.log("success response = " + inResponse);
	},
	onFailure: function(inSender, inResponse) {
		this.$.postResponse.setContent(inResponse);
		console.log("failure response = " + inResponse);
	},
});