/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.Canon.Services",
	kind: enyo.VFlexBox,
	components: [
		{Xkind: enyo.HFlexBox, defaultKind: "Button", className: "button-bar", components: [
			{content: "Clear", onclick: "clearClick"},
			{content: "Call Foo", onclick: "fooClick"},
			{content: "Multiple Foo Calls", onclick: "multiFooClick"},
			{content: "Call Sequence", onclick: "sequenceClick"},
			{content: "Subscribe", onclick: "subscribeClick"},
			{content: "Unsubscribe", onclick: "unsubscribeClick"},
			{content: "Get Prefs (device only)", onclick: "getPrefsClick"}
		]},
		{flex: 1, kind: "Scroller", components: [
			{name: "content", content: "", style: "font-size: 16px"}
		]},
		{name: "foo", kind: "MockService", method: "foo", onSuccess: "genericSuccess", onFailure: "genericFailure"},
		// shorthand syntax allows you to avoid renaming the service, or other properties depending on the service
		{kind: "MockService", components: [
			// 'name' is used as 'method' by default, but remember that all names in this scope must be unique
			{name: "one", onSuccess: "oneSuccess", onFailure: "genericFailure"},
			{name: "two", onSuccess: "twoSuccess", onFailure: "twoFailure"},
			{name: "three", onSuccess: "threeSuccess", onFailure: "genericFailure"}
		]},
		{name: "watched", kind: "MockService", method: "watchedMethod", subscribe: true, onSuccess: "genericSuccess", onFailure: "genericFailure"},
		// in fact, 'method' defaults to 'name', so we don't need the method property here, but in this example we include both properties for clarity
		{name: "getPreferences", kind: "SystemService", method: "getPreferences", onSuccess: "gotPreferences", onFailure: "genericFailure"}
	],
	content: "Hello World!",
	message: function(inMsg, inColor) {
		this.$.content.setContent(this.$.content.content + '<div style="padding: 1px 4px; border-bottom: 1px solid gray; background-color: ' + inColor + ';">' + inMsg + "</div>");
		this.$.scroller.scrollToBottom();
	},
	clearClick: function() {
		this.$.content.setContent("");
	},
	fooClick: function() {
		this.message("calling method 'foo' on MockService", "white");
		this.$.foo.call();
	},
	multiFooClick: function() {
		this.message("calling method 'foo' on MockService 4 times concurrently", "white");
		this.$.foo.call();
		this.$.foo.call();
		this.$.foo.call();
		this.$.foo.call();
	},
	sequenceClick: function() {
		this.message("calling one-two-three sequence", "white");
		this.$.one.call();
	},
	subscribeClick: function() {
		this.message("subscribing to a service", "white");
		this.$.watched.call();
	},
	unsubscribeClick: function() {
		this.message("unsubscribing from a service", "white");
		this.$.watched.cancel();
	},
	getPrefsClick: function() {
		this.message("requesting preferences", "white");
		this.$.getPreferences.call({keys: [
			"locale",
			"defaultWebSearch",
			"browserEnableJavascript"
		]});
	},
	gotPreferences: function(inSender, inResponse) {
		this.message("gotPreferences:");
		this.message("... locale: " + inResponse.locale.languageCode + '_' + inResponse.locale.countryCode);
	},
	genericSuccess: function(inSender) {
		this.message(inSender.getMethod() + " success", "lightgreen");
	},
	genericFailure: function(inSender) {
		this.message(inSender.getMethod() + " FAIL", "#FF8080");
	},
	oneSuccess: function(inSender, inResponse) {
		this.message("one succeeded", "yellow");
		this.$.two.oneResponse = inResponse;
		this.$.two.call();
	},
	twoSuccess: function(inSender) {
		this.message("two succeeded, the current value of method-one is " + inSender.oneResponse, "yellow");
		this.$.three.call();
	},
	twoFailure: function(inSender) {
		this.message("two FAIL, logging and ignoring failure, continuing sequence...", "yellow");
		this.$.three.call();
	},
	threeSuccess: function(inSender) {
		this.message("three succeeded", "yellow");
		this.message("one-two-three sequence finished successfully", "lightgreen");
	},
});