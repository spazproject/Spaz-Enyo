/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
 * @name handler.js
 * @fileOverview class to handle phone number parse states
 * 
 * Copyright (c) 2010-2011 HP, Inc.  All rights reserved.
 */

/*globals console G11n PhoneLoc */

//* @protected

enyo.g11n.StateHandler = function _StateHandler () {
	return this;
};

enyo.g11n.StateHandler.prototype = {
	processSubscriberNumber: function(number, fields, regionSettings) {
		var last;
		
		last = number.search(/[xwtp]/i);	// last digit of the local number

		if ( last > -1 ) {
			if ( last > 0 ) {
				fields.subscriberNumber = number.substring(0, last);
			}
			// strip x's which are there to indicate a break between the local subscriber number and the extension, but
			// are not themselves a dialable character
			fields.extension = number.substring(last).replace('x', '');
		} else {
			fields.subscriberNumber = number;
		}
		
		if (regionSettings.plan.fieldLengths && 
				regionSettings.plan.fieldLengths.maxLocalLength &&
				fields.subscriberNumber &&
				fields.subscriberNumber.length > regionSettings.plan.fieldLengths.maxLocalLength) {
			fields.invalid = true;
		}
	},
	
	processFieldWithSubscriberNumber: function(fieldName, length, number, currentChar, fields, regionSettings, noExtractTrunk) {
		var ret, end, last;
		
		last = number.search(/[xwtp]/i);	// last digit of the local number
		
		if ( length !== undefined && length > 0 ) {
			// fixed length
			end = length;
			if ( regionSettings.plan.trunkCode === "0" && number.charAt(0) === "0" ) {
				end += regionSettings.plan.trunkCode.length;  // also extract the trunk access code
			}
		} else {
			// variable length
			// the setting is the negative of the length to add, so subtract to make it positive
			end = currentChar + 1 - length;
		}
		
		if ( fields[fieldName] !== undefined ) {
			// we have a spurious recognition, because this number already contains that field! So, just put
			// everything into the subscriberNumber as the default
			this.processSubscriberNumber(number, fields, regionSettings);
		} else {
			// substring() extracts the part of the string up to but not including the end character,
			// so add one to compensate
			if ( !noExtractTrunk && regionSettings.plan.trunkCode === "0" && number.charAt(0) === "0" ) {
				fields.trunkAccess = number.charAt(0);
				fields[fieldName] = number.substring(1, end);
			} else {
				fields[fieldName] = number.substring(0, end);
			}
			
			if ( number.length > end ) {
				this.processSubscriberNumber(number.substring(end), fields, regionSettings);
			}
		}
		
		ret = {
			number: ""
		};

		return ret;
	},

	processField: function(fieldName, length, number, currentChar, fields, regionSettings) {
		var ret = {}, end;
		
		if ( length !== undefined && length > 0 ) {
			// fixed length
			end = length;
			if ( regionSettings.plan.trunkCode === "0" && number.charAt(0) === "0" ) {
				end += regionSettings.plan.trunkCode.length;  // also extract the trunk access code
			}
		} else {
			// variable length
			// the setting is the negative of the length to add, so subtract to make it positive
			end = currentChar + 1 - length;
		}
		
		if ( fields[fieldName] !== undefined ) {
			// we have a spurious recognition, because this number already contains that field! So, just put
			// everything into the subscriberNumber as the default
			this.processSubscriberNumber(number, fields, regionSettings);
			ret.number = "";
		} else {
			// substring() extracts the part of the string up to but not including the end character,
			// so add one to compensate
			if ( regionSettings.plan.trunkCode === "0" && number.charAt(0) === "0" ) {
				fields.trunkAccess = number.charAt(0);
				fields[fieldName] = number.substring(1, end);
				ret.skipTrunk = true;
			} else {
				fields[fieldName] = number.substring(0, end);
			}
			
			ret.number = (number.length > end) ? number.substring(end) : "";
		}
		
		return ret;
	},

	trunk: function(number, currentChar, fields, regionSettings) {
		var ret, trunkLength;
		
		if ( fields.trunkAccess !== undefined ) {
			// What? We already have one? Okay, put the rest of this in the subscriber number as the default behaviour then.
			this.processSubscriberNumber(number, fields, regionSettings);
			number = "";
		} else {
			trunkLength = regionSettings.plan.trunkCode.length;
			fields.trunkAccess = number.substring(0, trunkLength);
			number = (number.length > trunkLength) ? number.substring(trunkLength) : "";
		}
		
		ret = {
			number: number
		};
		
		return ret;
	},

	plus: function(number, currentChar, fields, regionSettings) {
		var ret = {};
		
		if ( fields.iddPrefix !== undefined ) {
			// What? We already have one? Okay, put the rest of this in the subscriber number as the default behaviour then.
			this.processSubscriberNumber(number, fields, regionSettings);
			ret.number = "";
		} else {
			// found the idd prefix, so save it and cause the function to parse the next part
			// of the number with the idd table
			fields.iddPrefix = number.substring(0, 1);
	
			ret = {
				number: number.substring(1),
				push: new enyo.g11n.Locale('_idd')    // shared subtable that parses the country code
			};
		}		
		return ret;
	},
	
	idd: function(number, currentChar, fields, regionSettings) {
		var ret = {};
		
		if ( fields.iddPrefix !== undefined ) {
			// What? We already have one? Okay, put the rest of this in the subscriber number as the default behaviour then.
			this.processSubscriberNumber(number, fields, regionSettings);
			ret.number = "";
		} else {
			// found the idd prefix, so save it and cause the function to parse the next part
			// of the number with the idd table
			fields.iddPrefix = number.substring(0, currentChar+1);
	
			ret = {
				number: number.substring(currentChar+1),
				push: new enyo.g11n.Locale('_idd')    // shared subtable that parses the country code
			};
		}
		
		return ret;
	},
	
	country: function(number, currentChar, fields, regionSettings) {
		var ret, cc, locale;
		
		// found the country code of an IDD number, so save it and cause the function to 
		// parse the rest of the number with the regular table for this locale
		fields.countryCode = number.substring(0, currentChar+1);
		cc = fields.countryCode.replace(/[wWpPtT\+#\*]/g, ''); // fix for NOV-108200
		locale = new enyo.g11n.PhoneLoc({countryCode: cc});
		
		// console.log("Found country code " + fields.countryCode + ". Switching to country " + locale.region + " to parse the rest of the number");
		
		ret = {
			number: number.substring(currentChar+1),
			push: locale
		};
		
		return ret;
	},

	cic: function(number, currentChar, fields, regionSettings) {
		return this.processField('cic', regionSettings.plan.fieldLengths.cic, number, currentChar, fields, regionSettings);
	},

	service: function(number, currentChar, fields, regionSettings) {
		return this.processFieldWithSubscriberNumber('serviceCode', regionSettings.plan.fieldLengths.serviceCode, number, currentChar, fields, regionSettings);
	},

	area: function(number, currentChar, fields, regionSettings) {
		var ret, last, end, localLength;
		
		last = number.search(/[xwtp]/i);	// last digit of the local number
		localLength = (last > -1) ? last : number.length;

		if ( regionSettings.plan.fieldLengths.areaCode > 0 ) {
			// fixed length
			end = regionSettings.plan.fieldLengths.areaCode;
			if ( regionSettings.plan.trunkCode === number.charAt(0) ) {
				end += regionSettings.plan.trunkCode.length;  // also extract the trunk access code
				localLength -= regionSettings.plan.trunkCode.length;
			}
		} else {
			// variable length
			// the setting is the negative of the length to add, so subtract to make it positive
			end = currentChar + 1 - regionSettings.plan.fieldLengths.areaCode;
		}
		
		// substring() extracts the part of the string up to but not including the end character,
		// so add one to compensate
		if ( regionSettings.plan.trunkCode === number.charAt(0) ) {
			fields.trunkAccess = number.charAt(0);
			if ( number.length > 1 ) {
				fields.areaCode = number.substring(1, end);
			}
			if ( number.length > end ) {
				this.processSubscriberNumber(number.substring(end), fields, regionSettings);
			}
		} else if ( regionSettings.plan.fieldLengths.maxLocalLength !== undefined ) {
			if ( fields.trunkAccess !== undefined || fields.mobilePrefix !== undefined ||
					fields.countryCode !== undefined ||
					localLength > regionSettings.plan.fieldLengths.maxLocalLength ) {
				// too long for a local number by itself, or a different final state already parsed out the trunk
				// or mobile prefix, then consider the rest of this number to be an area code + part of the subscriber number
				fields.areaCode = number.substring(0, end);
				if ( number.length > end ) {
					this.processSubscriberNumber(number.substring(end), fields, regionSettings);
				}
			} else {
				// shorter than the length needed for a local number, so just consider it a local number
				this.processSubscriberNumber(number, fields, regionSettings);
			}
		} else {
			fields.areaCode = number.substring(0, end);
			if ( number.length > end ) {
				this.processSubscriberNumber(number.substring(end), fields, regionSettings);
			}
		}
		
		// extensions are separated from the number by a dash in Germany
		if (regionSettings.plan.findExtensions !== undefined && fields.subscriberNumber !== undefined) {
			var dash = fields.subscriberNumber.indexOf("-");
			if (dash > -1) {
				fields.subscriberNumber = fields.subscriberNumber.substring(0, dash);
				fields.extension = fields.subscriberNumber.substring(dash+1);
			}
		}

		ret = {
			number: ""
		};

		return ret;
	},
	
	none: function(number, currentChar, fields, regionSettings) {
		var ret;
		
		// this is a last resort function that is called when nothing is recognized.
		// When this happens, just put the whole stripped number into the subscriber number
		if ( regionSettings.plan && number.charAt(0) === regionSettings.plan.trunkCode ) {
			fields.trunkAccess = number.charAt(0);
			number = number.substring(1);
			//currentChar--;
		} 
			
		if (number.length > 0) {
			this.processSubscriberNumber(number, fields, regionSettings);
			if ( currentChar > 0 && currentChar < number.length ) {
				// if we were part-way through parsing, and we hit an invalid digit,
				// indicate that the number could not be parsed properly
				fields.invalid = true;
			}
		}
		
		ret = {
			number: ""        // indicate that there is nothing left to parse
		};
		
		return ret;
	},
	
	vsc: function(number, currentChar, fields, regionSettings) {
		var ret, length, end;

		if ( fields.vsc === undefined ) {
			length = regionSettings.plan.fieldLengths.vsc || 0;
			if ( length !== undefined && length > 0 ) {
				// fixed length
				end = length;
			} else {
				// variable length
				// the setting is the negative of the length to add, so subtract to make it positive
				end = currentChar + 1 - length;
			}
			
			// found a VSC code (ie. a "star code"), so save it and cause the function to 
			// parse the rest of the number with the same table for this locale
			fields.vsc = number.substring(0, end);
			number = (number.length > end) ? "^" + number.substring(end) : "";
		} else {
			// got it twice??? Okay, this is a bogus number then. Just put everything else into the subscriber number as the default
			this.processSubscriberNumber(number, fields, regionSettings);
			number = "";
		}

		// treat the rest of the number as if it were a completely new number
		ret = {
			number: number
		};

		return ret;
	},
	
	cell: function(number, currentChar, fields, regionSettings) {
		return this.processFieldWithSubscriberNumber('mobilePrefix', regionSettings.plan.fieldLengths.mobilePrefix, number, currentChar, fields, regionSettings);
	},
	
	personal: function(number, currentChar, fields, regionSettings) {
		return this.processFieldWithSubscriberNumber('serviceCode', regionSettings.plan.fieldLengths.personal, number, currentChar, fields, regionSettings);
	},
	
	emergency: function(number, currentChar, fields, regionSettings) {
		return this.processFieldWithSubscriberNumber('emergency', regionSettings.plan.fieldLengths.emergency, number, currentChar, fields, regionSettings, true);
	},
	
	premium: function(number, currentChar, fields, regionSettings) {
		return this.processFieldWithSubscriberNumber('serviceCode', regionSettings.plan.fieldLengths.premium, number, currentChar, fields, regionSettings);
	},
	
	special: function(number, currentChar, fields, regionSettings) {
		return this.processFieldWithSubscriberNumber('serviceCode', regionSettings.plan.fieldLengths.special, number, currentChar, fields, regionSettings);
	},
	
	service2: function(number, currentChar, fields, regionSettings) {
		return this.processFieldWithSubscriberNumber('serviceCode', regionSettings.plan.fieldLengths.service2, number, currentChar, fields, regionSettings);
	},
	
	service3: function(number, currentChar, fields, regionSettings) {
		return this.processFieldWithSubscriberNumber('serviceCode', regionSettings.plan.fieldLengths.service3, number, currentChar, fields, regionSettings);
	},
	
	service4: function(number, currentChar, fields, regionSettings) {
		return this.processFieldWithSubscriberNumber('serviceCode', regionSettings.plan.fieldLengths.service4, number, currentChar, fields, regionSettings);
	},
	
	cic2: function(number, currentChar, fields, regionSettings) {
		return this.processField('cic', regionSettings.plan.fieldLengths.cic2, number, currentChar, fields, regionSettings);
	},
	
	cic3: function(number, currentChar, fields, regionSettings) {
		return this.processField('cic', regionSettings.plan.fieldLengths.cic3, number, currentChar, fields, regionSettings);
	},
	
	start: function(number, currentChar, fields, regionSettings) {
		// don't do anything except transition to the next state
		return {
			number: number
		};
	},
	
	local: function(number, currentChar, fields, regionSettings) {
		// in open dialling plans, we can tell that this number is a local subscriber number because it
		// starts with a digit that indicates as such
		this.processSubscriberNumber(number, fields, regionSettings);
		return {
			number: ""
		};
	}
};

// context-sensitive handler
enyo.g11n.CSStateHandler = function () {
	return this;
};

enyo.g11n.CSStateHandler.prototype = new enyo.g11n.StateHandler();
enyo.g11n.CSStateHandler.prototype.special = function (number, currentChar, fields, regionSettings) {
	var ret;
	
	// found a special area code that is both a node and a leaf. In
	// this state, we have found the leaf, so chop off the end 
	// character to make it a leaf.
	if (number.charAt(0) === "0") {
		fields.trunkAccess = number.charAt(0);
		fields.areaCode = number.substring(1, currentChar);
	} else {
		fields.areaCode = number.substring(0, currentChar);
	}
	this.processSubscriberNumber(number.substring(currentChar), fields, regionSettings);
	
	ret = {
		number: ""
	};
	
	return ret;
};

enyo.g11n.USStateHandler = function () {
	return this;
};
enyo.g11n.USStateHandler.prototype = new enyo.g11n.StateHandler();
enyo.g11n.USStateHandler.prototype.vsc = function (number, currentChar, fields, regionSettings) {
	var ret, length, end;

	// found a VSC code (ie. a "star code")
	fields.vsc = number;

	// treat the rest of the number as if it were a completely new number
	ret = {
		number: ""
	};

	return ret;
};

enyo.g11n._handlerFactory = function (locale, plan) {
	if (typeof(plan.contextFree) === 'boolean' && plan.contextFree === false) {
		return new enyo.g11n.CSStateHandler();
	}
	var region = (locale && locale.region) || "zz";
	switch (region) {
	case 'us':
		return new enyo.g11n.USStateHandler();
		break;
	default:
		return new enyo.g11n.StateHandler();
	}
};