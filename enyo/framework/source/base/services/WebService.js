/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A web service component initiates and processes an AJAX request.
This component is an abstraction of the XMLHttpRequest object.

To initialize a web service component:

	{name: "getWeather", kind: "WebService",
		url: "http://somewebsite.com/weather.json",
		onSuccess: "gotWeather",
		onFailure: "gotWeatherFailure"}

To initiate the AJAX request:

	this.$.getWeather.call({location: "Sunnyvale CA"});
	
Note: You can set any of the published properties via the setter function, 
e.g. setUrl(). For example, if you need to change the URL before initiating 
the AJAX request, you can do this:

	this.$.getWeather.setUrl("http://somewebsite.com/Sunnyvale+CA/weather.json");
	this.$.getWeather.call();

(Please see the <b>Published Properties</b> section for a full list of available options.)

All 2xx responses are treated as success, as well as 0 and unknown status.
To process the AJAX response:

	gotWeather: function(inSender, inResponse, inRequest) {
		this.results = inResponse;
	}
	
If the handleAs property is set to "json" (default), the content of the responseText 
property will automatically be converted into a JavaScript object.

To handle failure:

	gotWeatherFailure: function(inSender, inResponse, inRequest) {
		console.log("got failure from getWeather");
	}
	
A third parameter, <code>inRequest</code>, is always passed to the event handler 
functions. It contains a lot of details about the request, including a 
reference to the actual XHR object. For example, status code can be 
retrieved via <code>inRequest.xhr.status</code>.

You can obtain HTTP response headers from the XHR object using getResponseHeader. 
For example, to get Content-Type in the response headers:

	inRequest.xhr.getResponseHeader("Content-Type")

The default HTTP method is GET, to make a POST request, set method property to "POST".
Here is an example of making a POST request:

	{name: "login", kind: "WebService",
			url: "http://myserver.com/login",
			method: "POST",
			onSuccess: "loginSuccess",
			onFailure: "loginFailure"}
			
	this.$.login.call({username: "foo", password: "bar"});
	
WebService requests to fetch local files will fail when using Google Chrome unless you start the browesr
with the <code>--allow-file-access-from-files</code> command-line switch.
*/
enyo.kind({
	name: "enyo.WebService",
	kind: enyo.Service,
	requestKind: "WebService.Request",
	published: {
		/**
		The URL for the service.  This can be a relative URL if used to fetch resources bundled with the application.
		*/
		url: "",
		/**
		The HTTP method to use for the request. Defaults to GET.
		*/
		method: "GET", // {value: "GET", options: ["GET", "POST", "PUT", "DELETE"]},
		/**
		How the response will be handled. 
		Supported values are: <code>"json", "text", "xml"</code>.
		*/
		handleAs: "json", // {value: "json", options: ["text", "json", "xml"]},
		/**
		The Content-Type header for the request as a String.
		*/
		contentType: "application/x-www-form-urlencoded",
		/**
		If true, makes a synchronous (blocking) call, if supported.
		*/
		sync: false,
		/**
		Optional additional request headers in object format, or null.
		*/
		headers: null,
		/**
		The optional user name to use for authentication purposes.
		*/
		username: "",
		/**
		The optional password to use for authentication purposes.
		*/
		password: ""
	},
	//* @protected
	constructor: function() {
		this.inherited(arguments);
		this.headers = {};
	},
	makeRequestProps: function(inParams) {
		var props = {
			params: inParams,
			url: this.url,
			method: this.method,
			handleAs: this.handleAs,
			contentType: this.contentType,
			sync: this.sync,
			headers: this.headers,
			username: this.username,
			password: this.password
		};
		return enyo.mixin(props, this.inherited(arguments));
	}
});

//* @protected
enyo.kind({
	name: "enyo.WebService.Request",
	kind: enyo.Request,
	call: function() {
		var params = this.params || "";
		params = enyo.isString(params) ? params : enyo.objectToQuery(params);
		//
		var url = this.url;
		if (this.method == "GET" && params) {
			url += (url.indexOf('?') >= 0 ? '&' : '?') + params;
			params = null;
		}
		//
		var headers = {};
		headers["Content-Type"] = this.contentType;
		enyo.mixin(headers, this.headers);
		//
		enyo.xhr.request({
			url: url,
			method: this.method,
			callback: enyo.bind(this, "receive"),
			body: params,
			headers: headers,
			sync: window.PalmSystem ? false : this.sync,
			username: this.username,
			password: this.password
		});
	},
	isFailure: function(inResponse) {
		var xhr = this.xhr;
		return !xhr || !this.isSuccess(xhr.status);
	},
	isSuccess: function(inStatus) {
		return !inStatus || (inStatus >= 200 && inStatus < 300);
	},
	receive: function(inText, inXhr) {
		this.xhr = inXhr;
		this.inherited(arguments, [inXhr]);
	},
	setResponse: function(inXhr) {
		var r;
		switch (this.handleAs) {
			case "json":
				try {
					var resp = inXhr.responseText;
					r = resp && enyo.json.parse(resp);
				} catch (e) {
					this.log("responseText is not in JSON format");
					this.log(e);
					this.log(resp);
					r = resp;
				}
				break;
			case "xml":
				r = inXhr.responseXML;
				break;
			default:
				r = inXhr.responseText;
				break;
		}
		this.response = r;
	}
});