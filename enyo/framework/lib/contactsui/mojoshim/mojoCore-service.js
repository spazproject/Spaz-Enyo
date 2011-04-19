/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, inBuiltinEnv: true, setPrototype: true
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, document, enyo, console, Mojo, window, XMLHttpRequest, setTimeout */

/** section: Core
 * Service
 * Access device services like the accelerometer, GPS, contacts, and more!
 **/
if (!this.Mojo){
	Mojo = {};
}
if (!Mojo.Core){
	Mojo.Core = {};
}
Mojo.Core.Service = (function() {
	/**
	 * class Service.Request
	 * Created with [[Service.createRequest]]
	 **/
	
function assignPrototype(fn, proto) {                             
        if (typeof inBuiltinEnv !== 'undefined' && inBuiltinEnv) {
                setPrototype(fn, proto);                          
        }                                                         
        else {                                                    
                fn.prototype = proto;                             
        }                                                         
}

	function Request(url, parameters, callback) {
		var subscribed;

		// Decorate request with activity id if we have one.
		if (!parameters.$activity) {
			if (!PalmSystem.activityId) {
				console.warn("No activity id available for service request!");
			}
			else {
				parameters.$activity = {
					activityId: PalmSystem.activityId
				};
			}
		}
		
		// best known legacy-compatible method of determining whether a request
		// intends on receiving multiple responses is to check if either
		// 'watch':true or 'subcribe':true is specified
		subscribed = parameters && (parameters.subscribe === true || parameters.watch === true);

		parameters = JSON.stringify(parameters);
		this.cancelled = false;
		this.psRequest = new PalmServiceBridge();
		var req = this.psRequest;
		var firstResponse = true;
		// Response handler function must be a method at time of assignment or else will get GCed (?!).
		this.f = function(message) {
			var response;
			try {
				response = JSON.parse(message);
			}
			catch (e) {
				response = {
					errorCode: -1,
					errorText: "Bad JSON response: " + e.message
				};
			}
			if (!subscribed && !firstResponse && response.errorText && response.errorText.match(/is not running.$/)) {
				// NOV-114543
				req.cancel();
			} else {
				firstResponse = false;
				callback(response);
			}
		};
		this.psRequest.onservicecallback = this.f;
		this.psRequest.call(url, parameters);
	}

	assignPrototype(Request, {
		/**
		 * Service.Request#cancel() -> undefined
		 * Call this to cancel a pending request.
		 **/
		cancel: function cancel() {
			if (this.psRequest) {
				this.cancelled = true;
				this.psRequest.cancel();
				this.psRequest = undefined;
			} else {
				throw Error("cancelling a request that is not in progress");
			}
		}
	});

	var module = {
		/**
		 * Service.createRequest(url, parameters, callback) -> Service.Request
		 * - url (String): The url of the service and method to access.
		 * - parameters (Object): The parameters to pass to the service.
		 *   These will be serialized by the request automatically.
		 * - callback (Function): The function to be called with the results
		 *   of the service request.
		 *
		 * This creates a request to the Palm Service bus.
		 * See the [service docs][] for more details on service APIs.
		 *
		 * The url for a service is usually something like `palm://com.palm.location`. In
		 * regular Mojo, you pass a `method` parameter when creating a service request. In
		 * reality, that just gets tacked onto the service url. So, when using this API,
		 * the developer needs to do that concatenation himself. For example, if the
		 * developer is querying for the user's location, the url would be
		 * `palm://com.palm.location/getCurrentPosition`. The `parameters` argument should
		 * then be a JavaScript object to be serialized and sent to the method.
		 *
		 * Example
		 * -------
		 *     var request = MojoCore.Service.createRequest(
		 *         'palm://com.palm.location/getCurrentPosition',
		 *         {
		 *              accuracy: 1,
		 *              maximumAge: 0,
		 *              responseTime: 3
		 *         },
		 *         function(response) {
		 *              console.log("Latitude is: " + response.latitude);
		 *         });
		 *
		 * [service docs]: http://developer.palm.com/index.php?option=com_content&view=article&id=1651&Itemid=240
		 **/
		createRequest: function(url, parameters, callback) {
			return new Request(url, parameters, callback);
		},
		setup: function() {
			if (typeof PalmServiceBridge === "undefined") {
				if (typeof global !== "undefined") {
					// Triton environment
					(function() {
						var handle;
					
						global.PalmServiceBridge = function() {};
						global.PalmServiceBridge.prototype = {
							call: function(url, paramString) {
								var that = this;

								if (!handle) {
									handle = new webOS.Handle("", false);
								}

								this.request = handle.call(url, paramString, function(responseObj) {
									if (that.request) {
										that.onservicecallback(responseObj.payload());
									}
								});
							},
							cancel: function() {
								if (this.request) {
									handle.cancel(this.request);
									this.request = undefined;
								}
							}
						};
					
					})();
				} else {
					// Browser environment
					(function() {
						
						// Standalone version adapted from Foundations to avoid another dependency.
						function toQueryString(obj) {
							var key;
							var pairs = [];
							var len;
							
							for (key in obj) {
								if (obj.hasOwnProperty(key)) {
									var val = obj[key];
									var encKey = encodeURIComponent(key);
									
									if (val === null|| val === undefined) {
										
										// { a: undefined, b: 'c' } -> "a&b=c"
										pairs.push(encKey);

									} else if (typeof val == 'number' || typeof val == 'string' || val === true || val === false) {
										pairs.push(encKey + "=" + encodeURIComponent(val));

									} else if (val.length) {
										
										len = val.length;
										for (var i=0; i<len; ++i) {
											pairs.push(encKey + "=" + encodeURIComponent(val[i]));
										}

									} else {
										throw new Error("Can't convert unknown object \"" + key + "\" to a query string");
									}
								}
							}

							return pairs.join('&');
						}
						
						window.PalmServiceBridge = function() {};
						window.PalmServiceBridge.prototype = {
							call: function(fullUrl, parameters) {
								this.fullUrl = fullUrl;
								this.parameters = parameters;
								var matches = fullUrl.match(this.serviceExpression);
								if (matches && matches.length == 3) {
									this.identifier = matches[1];
									this.method = matches[2];
									this.sendRequestToMojoHost();
								} else {
									var error = this.makeError(this.cannotExtractIdentifierError);
									error.errorText += this.fullUrl;
									this.sendResponse(error);
								}
							},

							sendRequestToMojoHost: function() {
								var params = this.parameters || "{}";
								var self = this;
								var ajaxParams = {
									sessionID: window.parent.top.name,
									methodParams: params,
									serviceMethod: this.method,
									serviceName: this.identifier
								};
								var url = this.makeLunaHostUrl();
								var req = new XMLHttpRequest();
								req.onreadystatechange = function() {
									if (req.readyState == 4) {
										if (req.status >= 200 && req.status < 300) {
											req.responseJSON = JSON.parse(req.responseText);
											self.onSuccess(req);
										} else {
											self.onFailure(req);
										}
									}
								};
								req.open('GET', url + "?" + toQueryString(ajaxParams)); 
								req.send(null);
							},

							makeLunaHostUrl: function() {
								return "/bridge/handle_method.js";
							},

							makeError: function(original) {
								var key;
								var error = {};
								for (key in original) {
									if (original.hasOwnProperty(key)) {
										error[key] = original[key];
									}
								}
								return error;
							},

							makeNoSuchServiceError: function() {
								var error = this.makeError(this.noSuchServiceError);
								return error;
							},

							makeUnknownServiceError: function(transport) {
								var error = this.makeError(this.unknownServiceError);
								error.errorText += transport.status;
								error.errorText += ":";
								error.errorText += transport.responseText;
								return error;
							},

							onSuccess: function(transport) {
								var response = transport.responseJSON;
								if (window.parent && window.parent.comet) {
									window.parent.comet.serviceBridgeManager.requests[response.token] = this;
								}
							},

							onFailure: function(transport) {
								if (transport.status == 501) {
									this.sendResponse(this.makeNoSuchServiceError());
								} else {
									this.sendResponse(this.makeUnknownServiceError(transport));
								}
							},

							sendResponse: function(error) {
								var self = this;
								setTimeout(function() {
									self.onservicecallback(JSON.stringify(error));
								}, 0);
							},

							cancel: function() {

							},

							serviceExpression: /palm:\/\/([\w.]+)\/(.*)/,

							cannotExtractIdentifierError: {
								returnValue: false,
								errorCode: -1,
								errorText: "Cannot extract identifier and method from "
							},

							noSuchServiceError: {
								returnValue: false,
								errorCode: -1,
								errorText: "mojo-host provides no service '<%= identifier %>' with method '<%= method %>'"
							},

							unknownServiceError: {
								returnValue: false, 
								errorCode: -1,
								errorText: "mojo-host error: "
							}
						};
						
					})();
				}
			}
		}
	};

	return module;
})();
