/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.MockService",
	kind: enyo.Service,
	requestKind: "MockService.Request",
	published: {
		method: "",
		subscribe: false
	},
	//* @protected
	importProps: function(inProps) {
		inProps.method = inProps.method || inProps.name;
		this.inherited(arguments);
	},
	//* @public
	call: function() {
		return this.request({method: this.method, subscribe: this.subscribe});
	}
});

//* @protected
enyo.kind({
	name: "enyo.MockService.Request",
	kind: enyo.Request,
	destroy: function() {
		this.inherited(arguments);
		clearInterval(this.job);
	},
	_call: function() {
		setTimeout(enyo.bind(this, "receive", this.makeResponse()), enyo.irand(200) + 100);
	},
	call: function() {
		this._call();
		if (this.subscribe) {
			this.job = setInterval(enyo.bind(this, "_call"), 3000);
		}
	},
	makeResponse: function() {
		return enyo.irand(1000) + 1000;
	},
	isFailure: function(inResponse) {
		return inResponse < 1250;
	},
	finish: function() {
		if (!this.subscribe) {
			this.destroy();
		}
	}
});
