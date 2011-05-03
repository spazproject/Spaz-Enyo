/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
 * @name style.js
 * @fileOverview This file has the implementation of the FmtRegion object that gives the phone format styles for a given region
 * 
 * Copyright (c) 2010-2011, HP Inc.  All rights reserved.
 *
 */

/*globals console G11n PhoneLoc */

//* @public
/**
Create a new format styles object. This object documents the styles available
for the given enyo.g11n.Locale instance. 
*/
enyo.g11n.FmtStyles = function(locale) {
	this.locale = locale || enyo.g11n.phoneLocale();
	this.styles = enyo.g11n.Utils.getNonLocaleFile({
		root: enyo.g11n.Utils._getEnyoRoot("../"),
		path: "phone/format/data/" + this.locale.region + ".json",
		locale: this.locale
	});
	
	if (!this.styles) {
		this.locale = new enyo.g11n.Locale("unknown_unknown");
		this.styles = enyo.g11n.Utils.getNonLocaleFile({
			root: enyo.g11n.Utils._getEnyoRoot("../"),
			path: "phone/format/data/unknown.json",
			locale: this.locale
		});
	}
	
	return this;
};

enyo.g11n.FmtStyles.prototype = {
	/**
	Returns the style with the given name, or the default style if there
	is no style with that name.
	*/
	getStyle: function getStyle(name) {
		return this.styles[name] || this.styles["default"];
	},

	/**
	Returns true if this locale contains the named style, and false otherwise.
	*/
	hasStyle: function hasStyle(name) {
		return this.styles[name] !== undefined;
	},
	
	/**
	 Return an array of phone number formatting styles, plus examples
	 of each. Each element of the array has a key and a value. The key 
	 is the name of the style used with enyo.g11n.PhoneFmt,
	 and the value is an example number formatted in that style. 
	 The intention is that these
	 examples can be shown in a preference UI to allow the user to
	 choose the formatting style they prefer.
	 
	 The style name string will already be localized for the format region.
	 */
	getExamples: function getExamples() {
		var ret, style;
		
		ret = [];
		
		if (this.styles) {
			for (style in this.styles) {
				if (this.styles[style].example) {
					ret.push({ 
						key: style, 
						value: this.styles[style].example 
					});
				}
			}
		}
		
		return ret;
	}
};


/**
Return an array of regions supported by this phone formatter. Each
item in the array has a lower-cased ISO "countryCode" and a "countryName" property.

The countryName property is in English, not localized.
*/
enyo.g11n.FmtStyles.getRegions = function getRegions() {
	return [
        {countryCode: "us", countryName: "US, Canada, Caribbean"},
		{countryCode: "au", countryName: "Australia"},
		{countryCode: "be", countryName: "Belgium"},
		{countryCode: "cn", countryName: "China (PRC)"},
		{countryCode: "fr", countryName: "France"},
		{countryCode: "de", countryName: "Germany"},
		{countryCode: "in", countryName: "India"},
		{countryCode: "ie", countryName: "Ireland"},
		{countryCode: "it", countryName: "Italy"},
		{countryCode: "lu", countryName: "Luxembourg"},
		{countryCode: "mx", countryName: "Mexico"},
		{countryCode: "nl", countryName: "Netherlands"},
		{countryCode: "nz", countryName: "New Zealand"},
		{countryCode: "sg", countryName: "Singapore"},
		{countryCode: "es", countryName: "Spain"},
		{countryCode: "gb", countryName: "United Kingdom"}
	];
};

