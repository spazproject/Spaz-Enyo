/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
 * @name phoneloc.js
 * @fileOverview This file has the implementation of the phone locale object. This differs from a regular locale
 * in that the phone locale is normalized to the dialing plan region that controls the plan for the requested country.
 * 
 * Copyright (c) 2010-2011, HP Inc.  All rights reserved.
 *
 */

/*globals console G11n Locale enyo*/

//* @protected
enyo.g11n.PhoneLoc = function(params) {
	var locale, region;
	
	if (params) {
		if (params.mcc) {
			locale = enyo.g11n.phoneLocale();
			region = enyo.g11n.PhoneUtils.mapMCCtoRegion(params.mcc);
		}
		
		if (params.locale) {
			if (typeof(params.locale) === 'string') {
				locale = new enyo.g11n.Locale(params.locale);
			} else {
				locale = params.locale;
			}
			
			if (!region) {
				region = locale.region;
			}
		}
		
		if (params.countryCode) {
			locale = enyo.g11n.phoneLocale();
			region = enyo.g11n.PhoneUtils.mapCCtoRegion(params.countryCode);
		}
	}
	
	if (!region) {
		locale = enyo.g11n.phoneLocale();
		region = locale.region;
	}

	this.language = locale.language;
	this.variant = locale.variant;
	this.region = enyo.g11n.PhoneUtils.normPhoneReg(region);
	
	return this;
};

// subclass locale
enyo.g11n.PhoneLoc.prototype = new enyo.g11n.Locale();