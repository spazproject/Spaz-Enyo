/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
var LoginUtils = (function () {

	return {
		// Exported methods
		
		// Get the validator address from the account template
		getValidatorAddress: function (parent) {
			if (parent.validator && typeof parent.validator === "object") {
				return parent.validator.address;
			} else {
				return parent.validator;
			}
		},
		
		// Get the service and method given a URL
		getServiceMethod: function (addr) {
			var service, method, pos;

		    pos = addr.lastIndexOf('/');
			if (pos === -1)
				throw new Error("multiLogin: Invalid validator: " + v.id);
				
			// Get the address and method		
			service = addr.substring(0, pos + 1);
			method = addr.substring(pos + 1);
			console.log("validate service=" + service + "  method=" + method);
			
			return {
				service: service,
				method: method
			};
		},
		
		// Create the parameter object to pass to the account validator 
		createValidatorParams: function(username, password, templateId, validatorConfig, config, options) {
			var accountId, combinedConfig;
			
			if (options && options.accountId)
				accountId = options.accountId;

			// Combine passed-in config and validator config from template
			// Passed-in (if any) takes priority over template config
			combinedConfig = {};
			if (validatorConfig || config) {
				enyo.mixin(combinedConfig, validatorConfig);
				enyo.mixin(combinedConfig, config);
			}
			console.log("validate config=" + enyo.json.stringify(combinedConfig));
			
			return {
				username: username,
				password: password,
				templateId: templateId,
				config: combinedConfig,
				accountId: accountId
			};
		},
		
		
	};
}());

