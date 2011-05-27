/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "PrintManagerService",
	kind: enyo.PalmService,
	service: "palm://com.palm.printmgr/",
	requestKind: "PrintManagerService.Request"
});

//* @protected
enyo.kind({
	name: "PrintManagerService.Request",
	kind: enyo.PalmService.MockRequest,
	destroy: function() {
		this.inherited(arguments);
		if (this.job) {
			clearInterval(this.job);
			delete this.job;
		}
	},
	_call: function() {
		if (this.job) {
			this.url = "mock/" + this.owner.id + "_" + String(this.responseCount) + ".json";
			this.responseCount++;
		}
		else {
			this.url = "mock/" + this.owner.id + ".json";
		}
		enyo.xhr.request({
			url: this.url,
			method: "GET",
			callback: enyo.hitch(this, "receive")
		});
		this.log("Getting " + this.url + " ...");
	},
	call: function() {
		setTimeout(enyo.bind(this, "_call"), enyo.irand(500) + 1000);
	},
	finish: function() {
		if (!this.job) {
			this.destroy();
		}
	},
	isFailure: function() {
		if (this.response) {
			if (this.job) {
				// Assume success if subscription response does not have returnValue set 
				if (this.response.returnValue === undefined) {
					this.response.returnValue = true;
				}
			}
			else if (this.response.returnValue === true && this.response.subscribed === true) {
				// Start interval for subscription responses
				this.responseCount = 1;
				this.job = setInterval(enyo.bind(this, "_call"), 1000);
			}
		}
		else {
			if (this.job) {
				// Stop interval for subscription responses
				clearInterval(this.job);
				delete this.job;
			}
		}
		return this.inherited(arguments);
	}
});

if (window.PalmSystem) {
	PrintManagerService.Request = enyo.PalmService.Request;
}

