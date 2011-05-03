/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
 * @number format.js
 * @fileOverview This file has the implementation of the Number formatter object
 * 
 * Copyright (c) 2011 Palm, Inc.  All rights reserved.
 *
 */

/*globals console G11n enyo */

//* @public

/**
Creates a formatter object that formats number according to the given options. The options may include
any of the following:

* *locale* - The locale of the formatter. If this is not specified, the current formats locale is used 
as a default.
* *fractionDigits* - How many digits to show after the decimal. If this is not specified, all digits
are shown.
* *style* - one of "number", "percent", or "currency. If this is not specified, the default is "number".
Formats numbers according to the locale's conventions for formatting floating point numbers, percentages, 
and monetary amounts, respectively.

*/
enyo.g11n.NumberFmt = function(options) {
	var formatHash;
	if (typeof options === "number") {
		this.fractionDigits = options;
	} else if (options && typeof(options.fractionDigits) === 'number') {
		this.fractionDigits = options.fractionDigits;
	}
	
	if (!options || !options.locale) {
		this.locale = enyo.g11n.formatLocale();
	} else if (typeof(options.locale) === 'string') {
		this.locale = new enyo.g11n.Locale(options.locale);
	} else {
		this.locale = options.locale;
	}

	this.style = (options && options.style) || "number";
	if (this.style === "currency") {
		this.fractionDigits = 2;	
	}
	
	formatHash = enyo.g11n.Utils.getJsonFile({
		root: enyo.g11n.Utils._getEnyoRoot(),
		path: "base/formats",
		locale: this.locale
	});
	
	if (formatHash) {
		this.decimal = formatHash.numberDecimal || ".";
		this.divider = formatHash.numberDivider || ",";
		if (!formatHash.dividerIndex) {
			this.numberGroupRegex = /(\d+)(\d{3})/;
		} else if (formatHash.dividerIndex === 4) {
			this.numberGroupRegex = /(\d+)(\d{4})/;
		} else {
			this.numberGroupRegex = /(\d+)(\d{3})/;
		}
		this.percentageSpace = formatHash.percentageSpace;
		this.currencyPrepend = formatHash.currencyPrepend || "";
		this.currencyAppend = formatHash.currencyAppend || "";
	} else {
		// default is US/English style but no currency
		this.decimal = ".";
		this.divider = ",";
		this.numberGroupRegex = /(\d+)(\d{3})/;
		this.percentageSpace = false;
		this.currencyPrepend = "";
		this.currencyAppend = "";
	}
	this.numberGroupRegex.compile(this.numberGroupRegex);
	
	enyo.g11n.Utils.releaseAllJsonFiles();
};

/**
Converts a number into a string, using the proper locale-based format for numbers.

Returns the input number formatted as a string using the current locale formatting and the current 
option settings for the formatter.
*/
enyo.g11n.NumberFmt.prototype.format = function(number) {
	try {
		var rawFormat, parts, wholeNumberPart, num;
		
		if (typeof(this.fractionDigits) !== "undefined") {
			rawFormat = number.toFixed(this.fractionDigits);
		} else {
			rawFormat = number.toString();
		}
		parts = rawFormat.split(".");
		wholeNumberPart = parts[0];
		while (this.divider && this.numberGroupRegex.test(wholeNumberPart)) {
			wholeNumberPart = wholeNumberPart.replace(this.numberGroupRegex, '$1' + this.divider + '$2');
		}
		parts[0] = wholeNumberPart;
		num = parts.join(this.decimal);
		if (this.style === 'currency') {
			num = this.currencyPrepend + num + this.currencyAppend;
		} else if (this.style === 'percent') {
			num += (this.percentageSpace? " %" : "%");
		}
		return num;
	} catch(e) {
		console.log("formatNumber error : " + e);
		return (number || "0") + "." + (this.fractionDigits || "");
	}
};


