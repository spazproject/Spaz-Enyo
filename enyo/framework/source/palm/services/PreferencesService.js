/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.PreferencesService",
	kind: enyo.PalmService,
	events: {
		onFetchPreferences: ""
	},
	//* @protected
	url: "palm://com.palm.systemservice/",
	//* @public
	// calling these functions update and fetch to differentiate from get/set published properties.
	updatePreferences: function(inPreferences) {
		this.method("setPreferences", inPreferences);
	},
	fetchPreferences: function(inKeys, inSubscribe) {
		this.method("getPreferences", {keys: inKeys, subscribe: inSubscribe}, "_fetchResult");
	},
	//* @protected
	_fetchResult: function(inResponse) {
		this.doFetchPreferences(inResponse);
	}
});
