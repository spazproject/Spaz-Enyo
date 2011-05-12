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
Creates a formatter object that formats number according to the given options. Once the formatter object
is created, it is intended to be immutable so that you can create multiple formatters for different 
purposes, and they will not conflict with each other. 

The options object may include any of the following properties:

* locale - The locale of the formatter. If this is not specified, the current formats locale is used 
as a default.
* style - one of "number", "percent", or "currency". If this is not specified, the default is "number".
This formats numbers according to the locale's conventions for formatting floating point numbers, percentages, 
and monetary amounts, respectively.
* currency - the ISO 4217 3-letter code for the currency to format. The currency property affects the
currency sign used to identify the currency in the output string. It can interact with the locale in that the
currency sign may be placed before or after the amount and with or without space, depending on the locale. For example, both
Germany and Ireland use the same currency (the Euro), but in Ireland amounts are written "€5.34" whereas in
Germany, the same amount would be written as "5,34 €". If a locale spec is given as the the currency property and
the legal currency for the named locale can be determined, then that currency will be used. If the currency 
property is not specified, then
the legal currency for the locale is used as the default. This property only has an effect if the style
property is given as "currency".
* currencyStyle - the value of this property may have one of the following values: "iso" or "common". 
The "iso" style causes the currency to be formatted using the ISO 4217 code as the currency sign. 
The "common" style causes the currency to be formatted using the common currency sign for the locale. For 
example, the "iso" style in the German locale would be "5,34 EUR" whereas the "common" style would be 
"5,34 €". In Ireland, the "iso" style would be "EUR 5.34", and the "common" style would be "€5.34". 
For some locales, the symbol for the common style is not available in the webOS fonts, so the string is
always formatted as style "iso", even when "common" is requested. Otherwise, the default if this property 
is not specified is "common".
* fractionDigits - How many digits to show after the decimal. If this is not specified, all digits
are shown in the "number" and "percent" styles. With the "currency" style, the default number of fractional
digits shown is the number that is commonly used for the currency being formatted, which is usually 0, 2 or
3. When a number being formatted has more digits than the fraction digits property allows, the number 
is rounded to fit within that number of fractional digits.
*/
enyo.g11n.NumberFmt = function(options) {
	var formatHash, 
		currencyInfo,
		currencyName,
		currencyEntry,
		currencyLocale,
		template,
		otherFormatHash;
	
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

	// console.log("NumberFmt: locale is " + this.locale);
	
	this.style = (options && options.style) || "number";

	formatHash = enyo.g11n.Utils.getJsonFile({
		root: enyo.g11n.Utils._getEnyoRoot(),
		path: "base/formats",
		locale: this.locale
	});

	if (this.style === "currency") {
		currencyName = (options && options.currency) || (formatHash && formatHash.currency && formatHash.currency.name);

		if (currencyName) {
			currencyName = currencyName.toUpperCase();
			this.currencyStyle = (options && options.currencyStyle === "iso") ? "iso" : "common";
			// console.log("currentName is " + currencyName + " and currencyStyle is " + this.currencyStyle);
			
			currencyInfo = enyo.g11n.Utils.getNonLocaleFile({
				root: enyo.g11n.Utils._getEnyoRoot(),
				path: "base/number_data/iso4217.json"
			});
			
			if (currencyInfo) {
				currencyEntry = currencyInfo[currencyName];
				if (!currencyEntry) {
					// invalid currency name... see if it is a locale name instead
					currencyLocale = new enyo.g11n.Locale(currencyName);
					otherFormatHash = enyo.g11n.Utils.getJsonFile({
						root: enyo.g11n.Utils._getEnyoRoot(),
						path: "base/formats",
						locale: currencyLocale
					});
					
					if (otherFormatHash) {
						currencyName = otherFormatHash.currency && otherFormatHash.currency.name;
						currencyEntry = currencyInfo[currencyName];
					}
				}
				
				if (!currencyEntry) {
					// still not there? try using the currency for the current locale
					currencyName = formatHash && formatHash.currency && formatHash.currency.name;
					currencyEntry = currencyInfo[currencyName];
				}
				
				if (currencyEntry) {
					this.sign = this.currencyStyle !== "iso" ? currencyEntry.sign : currencyName;
					this.fractionDigits = (options && typeof(options.fractionDigits) === 'number') ? options.fractionDigits : currencyEntry.digits;
				} else {
					// okay, give up and format as a plain number instead
					this.style = "number";
				}
			} else {
				// no currency info -- probably not passed a currency name... try the currency of this locale, otherwise
				// don't format
				currencyName = (formatHash && formatHash.currency && formatHash.currency.name);
				this.sign = currencyName;
			}
			
		} else {
			// no currency name to use, so just format this amount as an ISO format using the current locale
			currencyName = (formatHash && formatHash.currency && formatHash.currency.name);
			this.sign = currencyName;
		}
		
		if (currencyName) {
			// console.log("currency sign is " + this.sign);
			template = (formatHash && formatHash.currency && formatHash.currency[this.currencyStyle]) || "#{sign} #{amt}";
			// console.log("currency template is " + template);
			this.currencyTemplate = new enyo.g11n.Template(template);
		} else {
			// can't find the currency name and don't have a current locale -- okay, just format this amount as a number then.
			this.style = "number";
		}
	}
	
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
	} else {
		// default is US/English style
		this.decimal = ".";
		this.divider = ",";
		this.numberGroupRegex = /(\d+)(\d{3})/;
		this.percentageSpace = false;
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
		if (this.style === 'currency' && this.currencyTemplate) {
			num = this.currencyTemplate.evaluate({
				amt: num, 
				sign: this.sign
			});
		} else if (this.style === 'percent') {
			num += (this.percentageSpace? " %" : "%");
		}
		return num;
	} catch(e) {
		console.log("formatNumber error : " + e);
		return (number || "0") + "." + (this.fractionDigits || "");
	}
};


