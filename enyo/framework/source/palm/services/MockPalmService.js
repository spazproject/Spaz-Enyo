/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.kind({
	name: "enyo.PalmService.MockRequest",
	kind: enyo.WebService.Request,
	handleAs: "json",
	call: function() {
		// If a callback has been specified which will generate
		// the URL of a mock-data file, use it.  Otherwise, use
		// the default URL-generation scheme.
		("mockDataProvider" in this.owner)
			? this.url = this.owner.mockDataProvider(this)
			: this.url = "mock/" + this.owner.id + ".json";
		enyo.xhr.request({
			url: this.url,
			method: "GET",
			callback: enyo.hitch(this, "receive")
		});
	},
	isFailure: function() {
		if (!this.response) {
			this.response = {returnValue: false, errorText: "Expected mock response at: " + this.url};
			this.log(this.response.errorText);
		}
		return !this.response.returnValue;
	}
});


if (!window.PalmSystem) {
	enyo.PalmService.prototype.requestKind = "PalmService.MockRequest";
	enyo.DbService.prototype.requestKind = "PalmService.MockRequest";
}