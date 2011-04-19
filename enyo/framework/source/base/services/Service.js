/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
An _enyo.Service_ manages interaction with a process whose response is available asynchronously.
See <a href="#enyo.BasicService">enyo.BasicService</a> for more information.

In addition to the functionality of enyo.BasicService, enyo.Service adds
support for making multiple request calls. Use the call method to initiate a 
service call. The call method takes two arguments. The first, inParams, is the 
parameters the request should use to make the service request; the second, inProps, can optionally 
customize the request itself. It's most common to pass event handler delegate names via call.

Here's an example:

	{kind: "Service", service: "importantService", onResponse: "genericResponse"}

The service could be called in a variety of ways:

	this.$.service.call({index: 5});

In this case, the genericResponse method will be called with the service response.

	this.$.service.call({index: 10}, {onResponse: ""});


*/
enyo.kind({
	name: "enyo.Service",
	kind: enyo.BasicService,
	methodHandlers: {
	},
	//* @public
	/**
		Calls a service.

		inParams {Object} Parameters to send to the service.

		inProps {Object} (optional) Properties to set on the service call request,
		can include: onSuccess, onFailure, onResponse, name.
	*/
	call: function(inParams, inProps) {
		var props = inProps || {};
		props.params = props.params || inParams || this.params || {};
		var m = this.findMethodHandler(props.method || this.method) || "request";
		return this[m](props);
	},
	/**
		Cancels a specific service call request.

		inName {String} Name of the service call to cancel.
	*/
	cancelCall: function(inName) {
		enyo.call(this.$[inName], "destroy");
	},
	//* @protected
	findMethodHandler: function(inMethod) {
		if (inMethod in this.methodHandlers) {
			return this.methodHandlers[inMethod] || inMethod;
		}
	},
	makeRequestProps: function(inProps) {
		var delegates = {
			onResponse: this.onResponse,
			onSuccess: this.onSuccess,
			onFailure: this.onFailure
		};
		var props = this.inherited(arguments);
		return enyo.mixin(delegates, props);
	},
	// events fired from the request
	dispatchResponse: function(inDelegate, inRequest) {
		this.dispatch(this.owner, inDelegate, [inRequest.response, inRequest]);
	},
	response: function(inRequest) {
		this.dispatchResponse(inRequest.onResponse, inRequest);
	},
	responseSuccess: function(inRequest) {
		this.dispatchResponse(inRequest.onSuccess, inRequest);
	},
	responseFailure: function(inRequest) {
		this.dispatchResponse(inRequest.onFailure, inRequest);
	}
});
