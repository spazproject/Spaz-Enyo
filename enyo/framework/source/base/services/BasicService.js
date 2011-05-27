/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
An _enyo.BasicService_ manages interaction with a process whose response
is available asynchronously. When the process is complete, the onResponse
event, containing the service response, fires. If the response was successful,
the onSuccess event fires; if not, the onFailure event fires.

To initiate the service, call the request method. Any properties
relevant to the request should be passed in the inProps object. Note that a
BasicService makes no assumptions about the actual asynchronous 
process. Instead, the request method creates an <a href="#enyo.Request">enyo.Request</a>
component, which manages the service request. A service may specify a requestKind,
which is the kind for the request component. For example:

	{kind: "Service", onResponse: "serviceResponse"}

To initiate this service, do the following:

	buttonClick: function() {
		this.$.service.request({index: 27, message: ""});
	},
	serviceResponse: function(inSender, inResponse, inRequest) {
		// process response
	}
*/
enyo.kind({
	name: "enyo.BasicService",
	kind: enyo.Component,
	published: {
		/**
		The name of the service. This information is delegated to the Request component.
		*/
		service: "",
		/**
		The timeout, specified in milliseconds, after which the service should return a failure condition. 
		If a request times out, the request object will have its didTimeout property set to true.
		*/
		timeout: 0
	},
	events: {
		onSuccess: "",
		onFailure: "",
		onResponse: ""
	},
	requestKind: "Request",
	//* @protected
	masterService: enyo.nob,
	create: function() {
		this.defaultKind = this.kindName;
		this.inherited(arguments);
	},
	importProps: function(inProps) {
		this.inherited(arguments);
		var m = this.masterService;
		this.service = this.service || m.service;
		this.onResponse = this.onResponse || m.onResponse;
		this.onSuccess = this.onSuccess || m.onSuccess;
		this.onFailure = this.onFailure || m.onFailure;
	},
	adjustComponentProps: function(inProps) {
		this.inherited(arguments);
		inProps.masterService = this;
	},
	makeRequestProps: function(inProps) {
		var request = {
			kind: this.requestKind,
			timeout: this.timeout
		};
		if (inProps) {
			enyo.mixin(request, inProps);
		}
		return request;
	},
	//* @public
	//* Cancels all requests.
	cancel: function() {
		this.destroyComponents();
	},
	//* Makes a service request. Returns a Request component.
	request: function(inProps) {
		return this.createComponent(this.makeRequestProps(inProps));
	},
	//* @protected
	// events fired from the request
	response: function(inRequest) {
		this.doResponse(inRequest.response, inRequest);
	},
	responseSuccess: function(inRequest) {
		this.doSuccess(inRequest.response, inRequest);
	},
	responseFailure: function(inRequest) {
		this.doFailure(inRequest.response, inRequest);
	}
});

/**
An _enyo.Request_ component is an abstract kind that manages a single asynchronous
process. Request components are typically customized to perform specific 
tasks, like making an AJAX call.

Request components are not typically created on their own. Instead, they are 
made by an <a href="#enyo.Service">enyo.Service</a>.

The call method should be implemented to initiate the request processing.
The receive method should be called with the response. For example, the 
following simply calls the receive method with some dummy data:

	call: function() {
		var dummyRequest = enyo.bind(this, "receive", {result: "ok"});
		setTimeout(dummyRequest, 100);
	}

*/
enyo.kind({
	name: "enyo.Request",
	kind: enyo.Component,
	events: {
		onRequestSuccess: "responseSuccess",
		onRequestFailure: "responseFailure",
		onRequestResponse: "response"
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.startTimer();
		this.call();
	},
	destroy: function() {
		this.endTimer();
		this.inherited(arguments);
	},
	//* @public
	//* Initiates the request.
	call: function() {
	},
	isFailure: function(inResponse) {
		return !Boolean(inResponse);
	},
	//* @protected
	setResponse: function(inResponse) {
		this.response = inResponse;
	},
	//* @public
	//* Processes the request's response. 
	receive: function(inResponse) {
		if (!this.destroyed) {
			this.endTimer();
			this.setResponse(inResponse);
			this.processResponse();
		}
	},
	//* @protected
	processResponse: function() {
		if (this.isFailure(this.response)) {
			this.failure();
		} else {
			this.success();
		}
		this.doRequestResponse();
		this.finish();
	},
	failure: function() {
		this.doRequestFailure()
	},
	success: function() {
		this.doRequestSuccess();
	},
	startTimer: function() {
		this.startTime = Date.now();
		if (this.timeout) {
			this.timeoutJob = setTimeout(enyo.bind(this, "timeoutComplete"), this.timeout);
		}
	},
	endTimer: function() {
		clearTimeout(this.timeoutJob);
		this.endTime = Date.now();
		this.latency = this.endTime - this.startTime;
	},
	timeoutComplete: function() {
		this.didTimeout = true;
		this.receive();
	},
	finish: function() {
		this.destroy();
	}
});