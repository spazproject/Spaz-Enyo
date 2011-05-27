/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
(function() {
	//* @protected
	//* register palm sources of logLevel settings
	setupLoggingLevel = function() {
		var fc = enyo.fetchRootFrameworkConfig();
		if (fc) {
			enyo.setLogLevel(fc.logLevel);
		}
		var uc = enyo.fetchFrameworkConfig();
		if (uc) {
			enyo.setLogLevel(uc.logLevel);
		}
		var ai = enyo.fetchAppInfo();
		if (ai) {
			enyo.setLogLevel(ai.logLevel);
		}
	};

	// launch right away to control logging for app load
	setupLoggingLevel();
})();
