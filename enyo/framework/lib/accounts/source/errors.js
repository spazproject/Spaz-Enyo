/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
var AccountError = (function() {
	var rb = new enyo.g11n.Resources({root: "$enyo-lib/accounts"});
	
	var _errorStrings = {
		"UNKNOWN_ERROR":				rb.$L("Unknown error"),
	
		"401_UNAUTHORIZED":				rb.$L("The account credentials you entered are incorrect. Try again."),
		"408_TIMEOUT":					rb.$L("Request timeout"),
		"500_SERVER_ERROR":				rb.$L("Server error"),
		"503_SERVICE_UNAVAILABLE":		rb.$L("Server unavailable"),
		"412_PRECONDITION_FAILED":		rb.$L("The request is not suitable for the current configuration"),
		"400_BAD_REQUEST":				rb.$L("Bad request"),
		"HOST_NOT_FOUND":				rb.$L("Host not found"),
		"CONNECTION_TIMEOUT":			rb.$L("Connection timeout"),
		"CONNECTION_FAILED":			rb.$L("Connection failed"),
		"NO_CONNECTIVITY":				rb.$L("Must be connected to a network to sign in"),
		"SSL_CERT_EXPIRED":				rb.$L("SSL certificate expired"),
		"SSL_CERT_UNTRUSTED":			rb.$L("SSL certificate untrusted"),
		"SSL_CERT_INVALID":				rb.$L("SSL certificate invalid"),
		"SSL_CERT_HOSTNAME_MISMATCH":	rb.$L("SSL certificate hostname mismatch"),
	
		"DUPLICATE_ACCOUNT":			rb.$L("Duplicate account"),
		"UNSUPPORTED_CAPABILITY":		rb.$L("Your account is not configured for this service."),
		"INVALID_EMAIL_ADDRESS":		rb.$L("Please enter a valid email address.")
	};
	
	var _numericErrorCodes = {
		"-3141601": "UNKNOWN_ERROR",
		"-3141602": "401_UNAUTHORIZED",
		"-3141603": "408_TIMEOUT",
		"-3141604": "500_SERVER_ERROR",
		"-3141605": "503_SERVICE_UNAVAILABLE",
		"-3141606": "412_PRECONDITION_FAILED",
		"-3141607": "400_BAD_REQUEST",
		"-3141608": "HOST_NOT_FOUND",
		"-3141609": "CONNECTION_TIMEOUT",
		"-3141610": "CONNECTION_FAILED",
		"-3141611": "NO_CONNECTIVITY",
		"-3141612": "SSL_CERT_EXPIRED",
		"-3141613": "SSL_CERT_UNTRUSTED",
		"-3141614": "SSL_CERT_INVALID",
		"-3141615": "SSL_CERT_HOSTNAME_MISMATCH",
		"-3141616": "DUPLICATE_ACCOUNT",
		"-3141617": "UNSUPPORTED_CAPABILITY"
	};
	
	return {
		getErrorText: function(error) {
			var text = _errorStrings["UNKNOWN_ERROR"];
	
			if (error) {
				error = _numericErrorCodes[error] || error;
				text = _errorStrings[error] || text;
			}
			return text;
		}
	}
}());

