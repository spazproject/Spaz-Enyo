/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
 * @name name.js
 * @fileOverview This file has the implementation of the Name formatter object
 * 
 * Copyright (c) 2010-2011, HP Inc.  All rights reserved.
 *
 */

/*globals console G11n PhoneLoc NumPlan new enyo.g11n.FmtStyles PhoneUtils */

//* @public
/**
Create a new phone number formatter object that formats numbers according to the parameters.

The params object can contain zero or more of the following parameters

* locale (String): locale to use to format this number, or undefined to use the default locale (optional)
* style (String): the name of style to use to format this number, or undefined to use the default style (optional)
* mcc (String): the MCC of the country to use if the number is a local number and the country code is not known (optional)

Some regions have more than one style of formatting, and the style parameter
selects which style the user prefers. The style names can be found by calling 
FmtStyles.getExamples().

If the MCC is given, numbers will be formatted in the manner of the country
specified by the MCC. If it is not given, but the locale is, the manner of
the country in the locale will be used. If neither the locale or MCC are not given,
then the country of the phone locale for the device is used. 

*/
enyo.g11n.PhoneFmt = function(params) {
	this.locale = new enyo.g11n.PhoneLoc(params);
	
	this.style = (params && params.style) || "default";
	this.plan = new enyo.g11n.NumPlan({locale: this.locale});
	this.styles = new enyo.g11n.FmtStyles(this.locale);
	
	enyo.g11n.Utils.releaseAllJsonFiles();
	return this;
};

enyo.g11n.PhoneFmt.prototype = {
	//* @protected
	_substituteDigits: function _substituteDigits(part, formats, mustUseAll) {
		var formatString,
			formatted = "",
			partIndex = 0,
			i;
		
		// console.info("Globalization.Phone._substituteDigits: typeof(formats) is " + typeof(formats));
		
		if (!part) {
			return formatted;
		}
		
		if (typeof(formats) === "object") {
			if (part.length > formats.length) {
				// too big, so just use last resort rule.
				throw "part " + part + " is too big. We do not have a format template to format it.";
			}
			// use the format in this array that corresponds to the digit length of this
			// part of the phone number
			formatString = formats[part.length-1];
			// console.info("Globalization.Phone._substituteDigits: formats is an Array: " + JSON.stringify(formats));
		} else {
			formatString = formats;
		}
		// console.info("Globalization.Phone._substituteDigits: part is " + part + " format is " + formatString);
		
		for (i = 0; i < formatString.length; i++) {
			if (formatString.charAt(i) === "X") {
				formatted += part.charAt(partIndex);
				partIndex++;
			} else {
				formatted += formatString.charAt(i);
			}
		}
		
		if (mustUseAll && partIndex < part.length-1) {
			// didn't use the whole thing in this format? Hmm... go to last resort rule
			throw "too many digits in " + part + " for format " + formatString;
		}
		
		return formatted;
	},
	
	//* @public
	/**
	 Format the parts of a phone number appropriately according to the settings in 
	 this formatter instance.
	  
	 number (Object): object containing the phone number to format
	 
	 params (Object): The params can contain zero or more of these properties:
	 
	 * partial (Boolean): whether or not this phone number represents a partial number. 
	 The default is false, which means the number represents a whole number
	      
	 The partial parameter specifies whether or not the phone number model contains
	 a partial phone number or if the caller thinks it is a whole phone number. The
	 reason is that for certain phone numbers, they should be formatted differently
	 depending on whether or not it represents a whole number. Specifically, SMS
	 short codes are formatted differently. 
	 
	 Example: a subscriber number of "48773" in the US would get formatted as:
	 
	 * partial: 487-73  (perhaps the user is on the way to typing a whole phone number such as 487-7379)
	 * whole:   48773   (SMS short code)
	 
	 Any place in the UI where the user types in phone numbers, such as the keypad in the phone app, should
	 pass in partial: true to this formatting routine. All other places, such as the call log in
	 the phone app, should pass in partial: false, or leave the partial flag out of the parameters
	 entirely. 
	 
	 Returns the formatted phone number as a string.
	 */
	format: function format(number, params) {
		var temp, 
			templates, 
			fieldName, 
			countryCode, 
			isWhole, 
			style,
			field,
			formatted = "",
			styles,
			locale,
			styleTemplates;
		
		// console.log("PhoneFmt.format: formatting " + JSON.stringify(number));
		
		try {
			style = this.style;		// default style for this formatter
			
			// figure out what style to use for this type of number
			if (number.countryCode) {
				// dialing from outside the country
				// check to see if it to a mobile number because they are often formatted differently
				style = (number.mobilePrefix) ? "internationalmobile" : "international";
			} else if (number.mobilePrefix !== undefined) {
				style = "mobile";
			} else if (number.serviceCode !== undefined && this.styles.hasStyle("service")) {
				// iff there is a special format for service numbers, then use it
				style = "service";
			}
			
			isWhole = (!params || !params.partial);
			styleTemplates = this.styles.getStyle(style);
			locale = this.locale;
			
			// console.log("Style ends up being " + style + " and using subtype " + (isWhole ? "whole" : "partial"));
			
			styleTemplates = (isWhole ? styleTemplates.whole : styleTemplates.partial) || styleTemplates;
	
			for (field in enyo.g11n.PhoneUtils.fieldOrder) {
				if (typeof field === 'string' && typeof enyo.g11n.PhoneUtils.fieldOrder[field] === 'string') {
					fieldName = enyo.g11n.PhoneUtils.fieldOrder[field];
					// console.info("format: formatting field " + fieldName + " value: " + number[fieldName]);
					if (number[fieldName] !== undefined) {
						if (styleTemplates[fieldName] !== undefined) {
							templates = styleTemplates[fieldName];
							if (fieldName === "trunkAccess") {
								if (number.areaCode === undefined && number.serviceCode === undefined && number.mobilePrefix === undefined) {
									templates = "X";
								}
							}
							// console.info("format: formatting field " + fieldName);
							temp = this._substituteDigits(number[fieldName], templates, (fieldName === "subscriberNumber"));
							// console.info("format: formatted is: " + temp);
							formatted += temp;
			
							if ( fieldName === "countryCode" ) {
								// switch to the new country to format the rest of the number
								countryCode = number.countryCode.replace(/[wWpPtT\+#\*]/g, '');	// fix for NOV-108200
								locale = new enyo.g11n.PhoneLoc({countryCode: countryCode});
								styles = new enyo.g11n.FmtStyles(locale);
								styleTemplates = styles.getStyle((number.mobilePrefix !== undefined) ? "internationalmobile" : "international");
			
								// console.info("format: switching to region " + locale.region + " and style " + style + " to format the rest of the number ");
							}
						} else {
							console.warn("PhoneFmt.format: cannot find format template for field " + fieldName + ", region " + locale.region + ", style " + style);
							// use default of "minimal formatting" so we don't miss parts because of bugs in the format templates
							formatted += number[fieldName];
						}
					}
				}
			}
		} catch (e) {
			if (typeof(e) === 'string') { 
				// console.warn("caught exception: " + e + ". Using last resort rule.");
				// if there was some exception, use this last resort rule
				formatted = "";
		
				for (field in enyo.g11n.PhoneUtils.fieldOrder) {
					if (typeof field === 'string' && typeof enyo.g11n.PhoneUtils.fieldOrder[field] === 'string' && number[enyo.g11n.PhoneUtils.fieldOrder[field]] !== undefined) {
						// just concatenate without any formatting
						formatted += number[enyo.g11n.PhoneUtils.fieldOrder[field]];
						if (enyo.g11n.PhoneUtils.fieldOrder[field] === 'countryCode') {
							formatted += ' ';		// fix for NOV-107894
						}
					}
				}
			} else {
				throw e;
			}
		}
		// console.info("format: final result is " + formatted );
	
		enyo.g11n.Utils.releaseAllJsonFiles();
		
		return formatted;
	},
	
	/**
	 This function evaluates whether reformatting is possible, and if so returns the 
	 same phone number, but reformatted to the standard format. If it is not possible, 
	 the original string is returned unchanged.
	 
	 * phoneNumber (String): a string that probably contains a phone number
	 * params (Object, optional): parameters for use in parsing and reformatting
	 
	 The function first does a character count of the string to determine if there are
	 enough digits for a phone number, and whether or not there are too many non-dialable
	 characters. If it looks like it is just some text rather than a phone number, the 
	 original string is returned instead.
	 
	 Another reason it may not be possible to reformat is if the digits in the phone
	 number itself form an invalid number in the numbering plan. If so, this function 
	 will not attempt to reformat the number (which would turn out incorrect) and 
	 just return the original string.
	 
	 The params object is passed to the enyo.g11n.PhoneNumber() constructor 
	 function, so it should contain the same properties as the one expected
	 by that function. Please see the documentation for PhoneNumber for more
	 details on the expected properties.
	 
	 Returns a string containing the given phone number reformatted to the 
	 standard format if possible, or the original string if not.
	 */
	reformat: function (phoneNumber, params) {
		var ret = "",
			i,
			ch,
			dialableCount = 0,
			formatCount = 0,
			otherCount = 0,
			countryCode,
			formatsRegion,
			parsedLocale,
			region,
			regionSettings,
			formatChars;
		
		if (!phoneNumber || typeof(phoneNumber) !== 'string') {
			return phoneNumber;
		}
		
		// console.log("PhoneFmt.reformat: reformatting number: " + phoneNumber);

		formatChars = (this.plan && this.plan.commonFormatChars) || " ()-/.";
		
		for (i = 0; i < phoneNumber.length; i++) {
			ch = phoneNumber.charAt(i);
			if (enyo.g11n.PhoneUtils._getCharacterCode(ch) > -1) {
				dialableCount++;
			} else if (formatChars.indexOf(ch) > -1) {
				formatCount++;
			} else {
				otherCount++; 
			}
		}
	
		// console.log("PhoneFmt.reformat: dialable: " + dialableCount + " format: " + formatCount + " other: " + otherCount);
		
		if (this.plan && 
			this.plan.fieldLengths && 
			this.plan.fieldLengths.minLocalLength && 
			dialableCount < this.plan.fieldLengths.minLocalLength &&
			otherCount > 0) {
			// not enough digits for a local number, and there are other chars in there? well, probably not a real phone number then
			return phoneNumber;
		} 
		
		if (dialableCount < otherCount) {
			// if the ratio of other chars to dialable digits is too high, assume it is not a real phone number
			return phoneNumber;
		}
	
		var temp = new enyo.g11n.PhoneNumber(phoneNumber, {locale: this.locale});
		
		if (temp.invalid) {
			// could not be parsed properly, so return the original
			return phoneNumber;
		}
		
		return this.format(temp, params);
	}
};

