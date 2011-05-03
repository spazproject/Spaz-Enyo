/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
 * @name phone.js
 * @fileOverview basic routines to parse phone numbers around the world
 * 
 * Copyright (c) 2010-2011 HP, Inc.  All rights reserved.
 */

/*globals console G11n PhoneLoc PhoneUtils StatesData NumPlan GBStateHandler StateHandler */

/**
Creates a new PhoneNumber instance that parses the phone number parameter for its 
constituent parts, and store them as separate fields in the returned object.

* number (String/Object): A free-form phone number to be parsed, or a javascript object containing the already-parsed fields
* params (Object): parameters that guide the parser in parsing the number. 

The params object may include these properties:

* locale (String): The locale with which to parse the number.
* mcc (String): The MCC associated with the carrier that the phone is currently connected to, if known


This function is locale-sensitive, and will assume any number passed to it is
appropriate for the given locale. If the MCC is given, this method will assume
that numbers without an explicit country code have been dialled within the country
given by the MCC. This affects how things like area codes are parsed. If the MCC
is not given, this method will use the given locale to determine the country
code. If the locale is not explicitly given either, then this function uses the 
current phone region as the default.

The input number may contain any formatting characters for the given locale. Each 
field that is returned in the json object is a simple string of digits with
all formatting and whitespace characters removed.

The number is decomposed into its parts, regardless if the number
contains formatting characters. If a particular part cannot be extracted from given 
number, the field will not be returned as a field in the object. If no fields can be
extracted from the number at all, then all digits found in the string will be 
returned in the subscriberNumber field. If the number parameter contains no 
digits, an empty object is returned.

The output json has the following fields:

* vsc - if this number starts with a VSC (Vertical Service Code, or "star code"), this field will contain the star and the code together
* iddPrefix - the prefix for international direct dialing. This can either be in the form of a plus character or the IDD access code for the given locale
* countryCode - if this number is an international direct dial number, this is the country code
* cic - for "dial-around" services (access to other carriers), this is the prefix used as the carrier identification code
* emergency - an emergency services number
* mobilePrefix - prefix that introduces a mobile phone number
* trunkAccess - trunk access code (long-distance access)
* serviceCode - like a geographic area code, but it is a required prefix for various services
* areaCode - geographic area codes
* subscriberNumber - the unique number of the person or company that pays for this phone line
* extension - in some countries, extensions are dialed directly without going through an operator or a voice prompt system. If the number includes an extension, it is given in this field.
* invalid - this property is added and set to true if the parser found that the number is invalid in the numbering plan for the country. This method will make its best effort at parsing, but any digits after the error will go into the subscriberNumber field
 
The following rules determine how the number is parsed:

* If the number starts with a character that is alphabetic instead of numeric, do
not parse the number at all. There is a good chance that it is not really a phone number.
In this case, an empty json object will be returned.
* If the phone number uses the plus notation or explicitly uses the international direct
dialing prefix for the given locale, then the country code is identified in 
the number. The rules of given locale are used to parse the IDD prefix, and then the rules
of the country in the prefix are used to parse the rest of the number.
* If a country code is provided as an argument to the function call, use that country's
parsing rules for the number. This is intended for apps like contacts that know what the 
country is of the person that owns the phone number and can pass that on as a hint.
* If the appropriate locale cannot be easily determined, default to using the rules 
for the current user's region.

Example: parsing the number "+49 02101345345-78" will give the following properties:

     {
       iddPrefix: "+",
       countryCode: "49",
       areaCode: "02101",
       subscriberNumber: "345345",
       extension: "78"
     }
 
Note that in this example, because international direct dialing is explicitly used 
in the number, the part of this number after the IDD prefix and country code will be 
parsed exactly the same way in all locales with German rules (country code 49).
 
Regions currently supported are:
 
* NANP (North American Numbering Plan) countries - USA, Canada, Bermuda, various Caribbean nations
* UK
* Republic of Ireland
* Germany
* France
* Spain
* Italy
* Mexico
* India
* People's Republic of China
* Netherlands
* Belgium
* Luxembourg
* Australia
* New Zealand
* Singapore

*/
enyo.g11n.PhoneNumber = function(number, params) {
	var i, ch,
		state = 0,    // begin state
		newState,
		regionSettings,
		stateTable,
		handlerMethod,
		result,
		temp,
		dot,
		locale,
		plan;

	this.locale = new enyo.g11n.PhoneLoc(params);
	
	if (!number || (typeof number === "string" && number.length === 0)) {
		return this;
	} else if (typeof number === "object") {
		enyo.g11n.PhoneUtils.deepCopy(number, this);
		return this;
	}

	// use ^ to indicate the beginning of the number, because certain things only match at the beginning
	number = "^" + number.replace(/\^/g, '');
	
	//console.log("PhoneNumber: locale is: " + this.locale + " parsing number: " + number);
	
	// stateTable = Globalization.Phone._loadStatesFile(region);
	// formats = Globalization.Phone._loadFormatsFile(region);
	stateTable = new enyo.g11n.StatesData({
		root: enyo.g11n.Utils._getEnyoRoot("../"),
		path: "phone/parse/data",
		locale: this.locale
	});
	plan = new enyo.g11n.NumPlan({locale: this.locale});
	
	regionSettings = {
		stateTable: stateTable,
		plan: plan,
		handler: enyo.g11n._handlerFactory(this.locale, plan)
	};
	
	number = this._stripFormatting(number);
	dot = 14;	// special transition which matches all characters. See AreaCodeTableMaker.java
	
	i = 0;
	while (i < number.length) {
		ch = enyo.g11n.PhoneUtils._getCharacterCode(number.charAt(i));
		//console.info("parsing char " + number.charAt(i) + " code: " + ch + " current state is " + state);
		if (ch >= 0) {
			newState = stateTable.get(state)[ch];

			if (newState === -1 && stateTable.get(state)[dot] !== -1) {
				// check if this character can match the dot instead
				newState = stateTable.get(state)[dot];
				//console.log("char " + ch + " doesn't have a transition. Using dot to transition to state " + newState);
			}
			
			if (newState < 0) {
				// reached a final state for this table. Call the handler to handle
				// this final state. First convert the state to a positive array index
				// in order to look up the name of the handler function name in the array
				newState = -newState - 1;
				handlerMethod = enyo.g11n.PhoneUtils.states[newState];
				//console.info("reached final state " + newState + " handler method is " + handlerMethod);
				
				if (number.charAt(0) === '^') {
					result = regionSettings.handler[handlerMethod](number.slice(1), i-1, this, regionSettings);
				} else {
					result = regionSettings.handler[handlerMethod](number, i, this, regionSettings);
				}
				
				// reparse whatever is left
				number = result.number;
				i = 0;
				
				//console.log("reparsing with new number: " +  number);
				state = 0; // start at the beginning again

				// if the handler requested a special sub-table, use it for this round of parsing,
				// otherwise, set it back to the regular table to continue parsing
				if (result.push !== undefined) {
					//console.log("pushing to table " + result.push);
					locale = result.push;
					temp = new enyo.g11n.StatesData({
						root: enyo.g11n.Utils._getEnyoRoot("../"),
						path: "phone/parse/data",
						locale: locale
					});
					if (temp) {
						stateTable = temp;
					}
					temp = new enyo.g11n.NumPlan({locale: locale});
					if (temp) {
						plan = temp;
					}
					
					regionSettings = {
						stateTable: stateTable,
						plan: plan,
						handler: enyo.g11n._handlerFactory(locale, plan)
					};

					//console.log("push complete, now continuing parse.");
				} else if (result.skipTrunk !== undefined) {
					ch = enyo.g11n.PhoneUtils._getCharacterCode(regionSettings.plan.trunkCode);
					state = stateTable.get(state)[ch];
				}
			} else {
				// console.info("recognized digit " + ch + " continuing...");
				// recognized digit, so continue parsing
				state = newState;
				i++;
			}
		} else if (ch === -1) {
			// non-transition character, continue parsing in the same state
			i++;
		} else {
			// should not happen
			// console.info("skipping character " + ch);
			// not a digit, plus, pound, or star, so this is probably a formatting char. Skip it.
			i++;
		}
	}
	
	if (state > 0 && i > 0) {
		// we reached the end of the phone number, but did not finish recognizing anything. 
		// Default to last resort and put everything that is left into the subscriber number
		//console.log("Reached end of number before parsing was complete. Using handler for method none.")
		if (number.charAt(0) === '^') {
			result = regionSettings.handler.none(number.slice(1), i-1, this, regionSettings);
		} else {
			result = regionSettings.handler.none(number, i, this, regionSettings);
		}
	}
	
	//console.log("final result is: " + JSON.stringify(this));
	
	// clean up
	enyo.g11n.Utils.releaseAllJsonFiles();
	
	return this;
};

enyo.g11n.PhoneNumber.prototype = {
	//* @protected
	_stripFormatting: function _stripFormatting(str) {
		var ret = "";
		var i;
		
		for ( i = 0; i < str.length; i++) {
			if (enyo.g11n.PhoneUtils._getCharacterCode(str.charAt(i)) >= -1) {
				ret += str.charAt(i);
			}
		}
		
		return ret;
	},

	_getPrefix: function() {
		return this.areaCode || this.serviceCode || this.mobilePrefix || "";
	},
	
	_hasPrefix: function() {
		return (this._getPrefix() !== "");
	},
	
	/*
	 * @private
	 * Exclusive or -- return true, iff one is defined and the other isn't
	 */
	_xor: function(left, right) {
		if ((left === undefined && right === undefined ) || (left !== undefined && right !== undefined)) {
			return false;
		} else {
			return true;
		}
	},
	
	/* return a version of the phone number that contains only the dialable digits in the correct order */
	_join: function () {
		var field, fieldName, formatted = "";
		
		try {
			for (field in enyo.g11n.PhoneUtils.fieldOrder) {
				if (typeof field === 'string' && typeof enyo.g11n.PhoneUtils.fieldOrder[field] === 'string') {
					fieldName = enyo.g11n.PhoneUtils.fieldOrder[field];
					// console.info("normalize: formatting field " + fieldName);
					if (this[fieldName] !== undefined) {
						formatted += this[fieldName];
					}
				}
			}
		} catch ( e ) {
			console.warn("caught exception in _join: " + e);
			throw e;
		}

		return formatted;
	},

	//* @public
	/**
	 This routine will compare the two phone numbers in an locale-sensitive
	 manner to see if they possibly reference the same phone number.
	 
	 * other (Object): second phone number to compare this one to
	  
	 In many places,
	 there are multiple ways to reach the same phone number. In North America for 
	 example, you might have a number with the trunk access code of "1" and another
	 without, and they reference the exact same phone number. This is considered a
	 strong match. For a different pair of numbers, one may be a local number and
	 the other a full phone number with area code, which may reference the same 
	 phone number if the local number happens to be located in that area code. 
	 However, you cannot say for sure if it is in that area code, so it will 
	 be considered a somewhat weaker match. 
	  
	 Similarly, in other countries, there are sometimes different ways of 
	 reaching the same destination, and the way that numbers
	 match depends on the locale.
	 
	 The various phone number fields are handled differently for matches. There
	 are various fields that do not need to match at all. For example, you may
	 type equally enter "00" or "+" into your phone to start international direct
	 dialling, so the iddPrefix field does not need to match at all. 
	 
	 Typically, fields that require matches need to match exactly if both sides have a value 
	 for that field. If both sides specify a value and those values differ, that is
	 a strong non-match. If one side does not have a value and the other does, that 
	 causes a partial match, because the number with the missing field may possibly
	 have an implied value that matches the other number. For example, the numbers
	 "650-555-1234" and "555-1234" have a partial match as the local number "555-1234"
	 might possibly have the same 650 area code as the first number, and might possibly
	 not. If both side do not specify a value for a particular field, that field is 
	 considered matching. 
	  
	 The values of following fields are ignored when performing matches:
	    
	 * vsc
	 * iddPrefix
	 * cic
	 * trunkAccess
	 
	 The values of the following fields matter if they do not match:
	   
	 * countryCode - A difference causes a moderately strong problem except for 
	 certain countries where there is a way to access the same subscriber via IDD 
	 and via intranetwork dialling
	 * mobilePrefix - A difference causes a possible non-match
	 * serviceCode - A difference causes a possible non-match
	 * areaCode - A difference causes a possible non-match
	 * subscriberNumber - A difference causes a very strong non-match
	 * extension - A difference causes a minor non-match
	  
	 Returns non-negative integer describing the percentage quality of the match. 100 means 
	 a very strong match (100%), and lower numbers are less and less strong, down to 0 
	 meaning not at all a match.
	 */
	compare: function (other) {
		var match = 100,
			FRdepartments = {"590":1, "594":1, "596":1, "262":1},
			ITcountries = {"378":1, "379":1},
			thisPrefix,
			otherPrefix,
			currentCountryCode = enyo.g11n.PhoneUtils.mapRegiontoCC(this.locale.region);
		
		// subscriber number must be present and must match
		if (!this.subscriberNumber || !other.subscriberNumber || this.subscriberNumber !== other.subscriberNumber) {
			return 0;
		}
		
		// extension must match if it is present
		if (this._xor(this.extension, other.extension) || this.extension !== other.extension) {
			return 0;
		}
		
		if (this._xor(this.countryCode, other.countryCode)) {
			// if one doesn't have a country code, give it some demerit points, but if the
			// one that has the country code has something other than the current country
			// add even more. Ignore the special cases where you can dial the same number internationally or via 
			// the local numbering system
			switch (this.locale.region) {
			case 'fr': 
				if (this.countryCode in FRdepartments || other.countryCode in FRdepartments) {
					if (this.areaCode !== other.areaCode || this.mobilePrefix !== other.mobilePrefix) {
						match -= 100;
					}
				} else {
					match -= 16;
				}
				break;
			case 'it':
				if (this.countryCode in ITcountries || other.countryCode in ITcountries) { 
					if (this.areaCode !== other.areaCode) {
						match -= 100;
					}
				} else {
					match -= 16;
				}
				break;
			default:
				match -= 16;
				if ((this.countryCode !== undefined && this.countryCode !== currentCountryCode) || 
					(other.countryCode !== undefined && other.countryCode !== currentCountryCode)) {
					match -= 16;
				}
			}
		} else if (this.countryCode !== other.countryCode) {
			// ignore the special cases where you can dial the same number internationally or via 
			// the local numbering system
			if (other.countryCode === '33' || this.countryCode === '33') {
				// france
				if (this.countryCode in FRdepartments || other.countryCode in FRdepartments) {
					if (this.areaCode !== other.areaCode || this.mobilePrefix !== other.mobilePrefix) {
						match -= 100;
					}
				} else {
					match -= 100;
				}
			} else if (this.countryCode === '39' || other.countryCode === '39') {
				// italy
				if (this.countryCode in ITcountries || other.countryCode in ITcountries) { 
					if (this.areaCode !== other.areaCode) {
						match -= 100;
					}
				} else {
					match -= 100;
				}
			} else {
				match -= 100;
			}
		}

		if (this._xor(this.serviceCode, other.serviceCode)) {
			match -= 20;
		} else if (this.serviceCode !== other.serviceCode) {
			match -= 100;
		}

		if (this._xor(this.mobilePrefix, other.mobilePrefix)) {
			match -= 20;
		} else if (this.mobilePrefix !== other.mobilePrefix) {
			match -= 100;
		}

		if (this._xor(this.areaCode, other.areaCode)) {
			// one has an area code, the other doesn't, so dock some points. It could be a match if the local
			// number in the one number has the same implied area code as the explicit area code in the other number.
			match -= 12;
		} else if (this.areaCode !== other.areaCode) {
			match -= 100;
		}

		thisPrefix = this._getPrefix();
		otherPrefix = other._getPrefix();
		
		if (thisPrefix && otherPrefix && thisPrefix !== otherPrefix) {
			match -= 100;
		}
		
		// make sure we are between 0 and 100
		if (match < 0) {
			match = 0;	
		} else if (match > 100) {
			match = 100;
		}

		return match;
	},
	
	/**
	 Determine whether or not the other phone number is exactly equal to the current one.
	  
	 The difference between the compare method and the equals method is that the compare 
	 method compares normalized numbers with each other and returns the degree of match,
	 whereas the equals operator returns true iff the two numbers contain the same fields
	 and the fields are exactly the same. Functions and other non-phone number properties
	 are not compared.
	 */
	equals: function equals(other) {
		var p;
		
		if (other.locale && this.locale && !this.locale.equals(other.locale) && (!this.countryCode || !other.countryCode)) {
			return false;
		}
		
		for (p in other) {
			if (p !== undefined && this[p] !== undefined && typeof(this[p]) !== 'object') {
				if (other[p] === undefined) {
					console.error("PhoneNumber.equals: other is missing property " + p + " which has the value " + this[p] + " in this");
					console.error("this is : " + JSON.stringify(this));
					console.error("other is: " + JSON.stringify(other));
					return false;
				}
				if (this[p] !== other[p]) {
					console.error("PhoneNumber.equals: difference in property " + p);
					console.error("this is : " + JSON.stringify(this));
					console.error("other is: " + JSON.stringify(other));
					return false;
				}
			}
		}
		for (p in other) {
			if (p !== undefined && other[p] !== undefined && typeof(other[p]) !== 'object') {
				if (this[p] === undefined) {
					console.error("PhoneNumber.equals: this is missing property " + p + " which has the value " + other[p] + " in the other");
					console.error("this is : " + JSON.stringify(this));
					console.error("other is: " + JSON.stringify(other));
					return false;
				}
				if (this[p] !== other[p]) {
					console.error("PhoneNumber.equals: difference in property " + p);
					console.error("this is : " + JSON.stringify(this));
					console.error("other is: " + JSON.stringify(other));
					return false;
				}
			}
		}
		return true;
	},

	/**
	This function normalizes the current phone number to a canonical format and returns a
	string with that phone number. If parts are missing, this function attempts to fill in those parts.
		  
	* options (Object): an object containing options to help in normalizing. 
		 
	The options object contains a set of properties that can possibly help normalize
	this number by providing "extra" information to the algorithm. The options
	parameter may be null or an empty object if no hints can be determined before
	this call is made. If any particular hint is not
	available, it does not need to be present in the options object.
	
	The following is a list of hints that the algorithm will look for in the options
	object:
	
	* mcc: the mobile carrier code of the current network upon which this 
	phone is operating. This is translated into an IDD country code. This is 
	useful if the number being normalized comes from CNAP (callerid) and the
	MCC is known.
	* defaultAreaCode: the area code of the phone number of the current
	device, if available. Local numbers in a person's contact list are most 
	probably in this same area code.
	* country: the name or 2 letter ISO 3166 code of the country if it is
	known from some other means such as parsing the physical address of the
	person associated with the phone number, or the from the domain name 
	of the person's email address
	* networkType: specifies whether the phone is currently connected to a
	CDMA network or a UMTS network. Valid values are the strings "cdma" and "umts".
	If one of those two strings are not specified, or if this property is left off
	completely, this method will assume UMTS.
	
	The following are a list of options that control the behaviour of the normalization:
	
	* assistedDialing: if this is set to true, the number will be normalized
	so that it can dialled directly on the type of network this phone is 
	currently connected to. This allows customers to dial numbers or use numbers 
	in their contact list that are specific to their "home" region when they are 
	roaming and those numbers would not otherwise work with the current roaming 
	carrier as they are. The home region is 
	specified as the phoneRegion system preference that is settable in the 
	regional settings app. With assisted dialling, this method will add or 
	remove international direct dialling prefixes and country codes, as well as
	national trunk access codes, as required by the current roaming carrier and the
	home region in order to dial the number properly. If it is not possible to 
	construct a full international dialling sequence from the options and hints given,
	this function will not modify the phone number, and will return "undefined".
	If assisted dialling is false or not specified, then this method will attempt
	to add all the information it can to the number so that it is as fully
	specified as possible. This allows two numbers to be compared more easily when
	those two numbers were otherwise only partially specified.
	* sms: set this option to true for the following conditions: 
	  * assisted dialing is turned on
	  * the phone number represents the destination of an SMS message
	  * the phone is UMTS 
	  * the phone is SIM-locked to its carrier 
	This enables special international direct dialling codes to route the SMS message to
	the correct carrier. If assisted dialling is not turned on, this option has no
	affect.
	* manualDialing: set this option to true if the user is entering this number on
	the keypad directly, and false when the number comes from a stored location like a 
	contact entry or a call log entry. When true, this option causes the normalizer to 
	not perform any normalization on numbers that look like local numbers in the home 
	country. If false, all numbers go through normalization. This option only has an effect
	when the assistedDialing option is true as well, otherwise it is ignored. 
	
	If both a set of options and a locale are given, and they offer conflicting
	information, the options will take precedence. The idea is that the locale
	tells you the region setting that the user has chosen (probably in 
	firstuse), whereas the the hints are more current information such as
	where the phone is currently operating (the MCC). 
	
	This function performs the following types of normalizations with assisted
	dialling turned on:
	
	# If the current location of the phone matches the home country, this is a
	domestic call. 
	  * Remove any iddPrefix and countryCode fields, as they are not needed
	  * Add in a trunkAccess field that may be necessary to call a domestic numbers 
	    in the home country
	# If the current location of the phone does not match the home country,
	attempt to form a whole international number.
	  * Add in the area code if it is missing from the phone number and the area code
	    of the current phone is available in the hints
	  * Add the country dialling code for the home country if it is missing from the 
	    phone number
	  * Add or replace the iddPrefix with the correct one for the current country. The
	    phone number will have been parsed with the settings for the home country, so
	    the iddPrefix may be incorrect for the
	    current country. The iddPrefix for the current country can be "+" if the phone 
	    is connected to a UMTS network, and either a "+" or a country-dependent 
	    sequences of digits for CDMA networks.
	 
	This function performs the following types of normalization with assisted
	dialling turned off:
	 
	# Normalize the international direct dialing prefix to be a plus or the
	international direct dialling access code for the current country, depending
	on the network type.
	# If a number is a local number (ie. it is missing its area code), 
	use a default area code from the hints if available. CDMA phones always know their area 
	code, and GSM/UMTS phones know their area code in many instances, but not always 
	(ie. not on Vodaphone or Telcel phones). If the default area code is not available, 
	do not add it.
	# In assisted dialling mode, if a number is missing its country code, 
	use the current MCC number if
	it is available to figure out the current country code, and prepend that 
	to the number. If it is not available, leave it off. Also, use that 
	country's settings to parse the number instead of the current format 
	locale.
	# For North American numbers with an area code but no trunk access 
	code, add in the trunk access code.
	# For other countries, if the country code is added in step 3, remove the 
	trunk access code when required by that country's conventions for 
	international calls. If the country requires a trunk access code for 
	international calls and it doesn't exist, add one.
	 
	This method modifies the given phoneNumber object, and also returns a string 
	containing the normalized phone number that can be compared directly against
	other normalized numbers. The canonical format for phone numbers that is 
	returned from this method is simply an uninterrupted and unformatted string 
	of dialable digits.
	 */
	normalize: function(options) {
		var currentPlan,
			destinationPlan,
			formatted = "", 
			fieldName,
			field,
			norm,
			temp,
			homeLocale,
			currentLocale,
			destinationLocale;
		
		// clone this number, so we don't mess with it
		norm = new enyo.g11n.PhoneNumber(this); 

		homeLocale = enyo.g11n.phoneLocale();
		currentLocale = options ? new enyo.g11n.PhoneLoc(options) : homeLocale;
		destinationLocale = (norm.countryCode && new enyo.g11n.PhoneLoc({countryCode: norm.countryCode})) || norm.locale || currentLocale;

		// console.log("normalize: homeLocale is " + JSON.stringify(homeLocale));
		// console.log("normalize: currentLocale is " + JSON.stringify(currentLocale) + " and type is " + (currentLocale instanceof PhoneLoc));
		// console.log("normalize: destinationLocale is " + JSON.stringify(destinationLocale));
		
		currentPlan = new enyo.g11n.NumPlan({locale: currentLocale});
		destinationPlan = new enyo.g11n.NumPlan({locale: destinationLocale});
		
		if (options &&
				options.assistedDialing &&
				options.networkType === "cdma" && 
				destinationPlan.fieldLengths && 
				!norm.trunkAccess && 
				!norm.iddPrefix &&
				norm.subscriberNumber && 
				norm.subscriberNumber.length > destinationPlan.fieldLengths.maxLocalLength) {
			// not a valid number, so attempt to reparse with a + in the front to see if we get a valid international number
			// console.log("Attempting to reparse with +" + this._join());
			temp = new enyo.g11n.PhoneNumber("+" + this._join(), {locale: this.locale});
			if (temp.countryCode && enyo.g11n.PhoneUtils.mapCCtoRegion(temp.countryCode) !== "unknown") {
				// only use it if it is a recognized country code
				norm = temp;
				destinationLocale = (norm.countryCode && new enyo.g11n.PhoneLoc({countryCode: norm.countryCode})) || norm.locale || currentLocale;
				destinationPlan = new enyo.g11n.NumPlan({locale: destinationLocale});
			}
		}
		
		if (!norm.invalid && options && options.assistedDialing) {
			// don't normalize things that don't have subscriber numbers. Also, don't normalize
			// manually dialed local numbers. Do normalize local numbers in contact entries.
			if (norm.subscriberNumber && 
					(!options.manualDialing ||
					 norm.iddPrefix ||
					 norm.countryCode ||
					 norm.trunkAccess)) {
				// console.log("normalize: assisted dialling normalization of " + JSON.stringify(norm));
				if (!currentLocale.equals(destinationLocale) ) {
					// we are currently calling internationally
					if (!norm._hasPrefix() && options.defaultAreaCode && destinationLocale.equals(homeLocale)) {
						// area code is required when dialling from international, but only add it if we are dialing
						// to our home area. Otherwise, the default area code is not valid!
						norm.areaCode = options.defaultAreaCode;
						if (!destinationPlan.skipTrunk) {
							// some phone systems require the trunk access code, even when dialling from international
							norm.trunkAccess = destinationPlan.trunkCode;
						}
					}
					
					if (norm.trunkAccess && destinationPlan.skipTrunk) {
						// on some phone systems, the trunk access code is dropped when dialling from international
						delete norm.trunkAccess;
					}
					
					// for CDMA, make sure to get the international dialling access code for the current region, not the destination region
					if (options.networkType && options.networkType === "cdma") {
						norm.iddPrefix = currentPlan.iddCode;
					} else {
						// all umts carriers support plus dialing
						norm.iddPrefix = "+";
					}
	
					// make sure to get the country code for the destination region, not the current region!
					if (options.sms) {
						if (homeLocale.region === "us" && 
								currentLocale.region !== "us" &&
								destinationLocale.region !== "us") {
							norm.iddPrefix = "+011"; // make it go through the US first
						}
						norm.countryCode = norm.countryCode || enyo.g11n.PhoneUtils.mapRegiontoCC(destinationLocale.region);
					} else if (norm._hasPrefix() && !norm.countryCode) {
						norm.countryCode = enyo.g11n.PhoneUtils.mapRegiontoCC(destinationLocale.region);
					}
				} else {
					// console.log("normalize: dialing within the country");
					// we are in our destination country, so strip the international dialling prefixes
					if (norm.iddPrefix || norm.countryCode) {
						delete norm.iddPrefix;
						delete norm.countryCode;
						
						if (destinationPlan.skipTrunk && destinationPlan.trunkCode) {
							norm.trunkAccess = destinationPlan.trunkCode;
						}
					}
					
					if (options.defaultAreaCode) {
						if (destinationPlan.dialingPlan === "open") {
							if (!norm.trunkAccess && norm._hasPrefix() && destinationPlan.trunkCode) {
								// call is not local to this area code, so you have to dial the trunk code and the area code
								norm.trunkAccess = destinationPlan.trunkCode;
							}
						} else {
							// In closed plans, you always have to dial the area code, even if the call is local.
							if (!norm._hasPrefix()) {
								if (destinationLocale.equals(homeLocale)) {
									norm.areaCode = options.defaultAreaCode;
									if (destinationPlan.trunkCode) {
										norm.trunkAccess = norm.trunkAccess || destinationPlan.trunkCode;
									}
								}
							} else {
								norm.trunkAccess = norm.trunkAccess || destinationPlan.trunkCode;
							}
						}
					}
				}
			}
		} else if (!norm.invalid) {
			// console.log("normalize: non-assisted normalization");
			if (!norm._hasPrefix() && options && options.defaultAreaCode && destinationLocale.equals(homeLocale)) {
				norm.areaCode = options.defaultAreaCode;
			}
			
			if (!norm.countryCode && norm._hasPrefix()) {
				norm.countryCode = enyo.g11n.PhoneUtils.mapRegiontoCC(destinationLocale.region);
			}

			if (norm.countryCode) {
				if (options && options.networkType && options.networkType === "cdma") {
					norm.iddPrefix = currentPlan.iddCode; 
				} else {
					// all umts carriers support plus dialing
					norm.iddPrefix = "+";
				}
		
				if (destinationPlan.skipTrunk && norm.trunkAccess) {
					delete norm.trunkAccess;
				} else if (!destinationPlan.skipTrunk && !norm.trunkAccess && destinationPlan.trunkCode) {
					norm.trunkAccess = destinationPlan.trunkCode;
				}
			}
		}
		
		// console.info("normalize: after normalization, the normalized phone number is: " + JSON.stringify(norm));
		formatted = norm._join();
		
		enyo.g11n.Utils.releaseAllJsonFiles();
		
		return formatted;
	}		
};
