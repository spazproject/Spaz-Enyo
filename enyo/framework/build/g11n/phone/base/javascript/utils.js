/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
 * @name utils.js
 * @fileOverview Utility functions for the entire phone library
 * 
 * Copyright (c) 2010-2011, HP Inc.  All rights reserved.
 *
 */

/*globals console G11n PhoneLoc enyo*/

//* @protected
enyo.g11n.PhoneUtils = {
	// what order should fields of the parsed phone model be formatted?
	fieldOrder: [
		"vsc",
		"iddPrefix",
		"countryCode",
		"trunkAccess",
		"cic",
		"emergency",
		"mobilePrefix",
		"serviceCode",
		"areaCode",
		"subscriberNumber",
		"extension"
	],
		
	// parsing states in the FSM tables. First state (none) is -1, "unknown" is -2, etc.
	states: [
		"none",
		"unknown",
		"plus",
		"idd",
		"cic",
		"service",
		"cell",
		"area",
		"vsc",
		"country",
		"personal",
		"special",
		"trunk",
		"premium",
		"emergency",
		"service2",
		"service3",
		"service4",
		"cic2",
		"cic3",
		"start",
		"local"
	],
	
	deepCopy: function _deepCopy(from, to) {
		var prop;
		
		for (prop in from) {
			if (prop) {
				if (typeof(from[prop]) === 'object') {
					to[prop] = {};
					_deepCopy(from[prop], to[prop]);
				} else {
					to[prop] = from[prop];
				}
			}
		}
		
		return to;
	},
	
	/*
	 * Return the region that controls the dialing plan in the given
	 * region. (ie. the "normalized phone region".)
	 */
	normPhoneReg: function (region) {
		var norm;
		
		// Map all NANP regions to the right region, so that they get parsed using the 
		// correct state table
		switch (region) {
			case "us": // usa
			case "ca": // canada
			case "ag": // antigua and barbuda
			case "bs": // bahamas
			case "bb": // barbados
			case "dm": // dominica
			case "do": // dominican republic
			case "gd": // grenada
			case "jm": // jamaica
			case "kn": // st. kitts and nevis
			case "lc": // st. lucia
			case "vc": // st. vincent and the grenadines
			case "tt": // trinidad and tobago
			case "ai": // anguilla
			case "bm": // bermuda
			case "vg": // british virgin islands
			case "ky": // cayman islands
			case "ms": // montserrat
			case "tc": // turks and caicos
			case "as": // American Samoa 
			case "vi": // Virgin Islands, U.S.
			case "pr": // Puerto Rico
			case "mp": // Northern Mariana Islands
			case "tl": // East Timor
			case "gu": // Guam
				norm = "us";
				break;
			
			// these all use the Italian dialling plan
			case "it": // italy
			case "sm": // san marino
			case "va": // vatican city
				norm = "it";
				break;
			
			// all the French dependencies are on the French dialling plan
			case "fr": // france
			case "gf": // french guiana
			case "mq": // martinique
			case "gp": // guadeloupe, 
			case "bl": // saint barthélemy
			case "mf": // saint martin
			case "re": // réunion, mayotte
				norm = "fr";
				break;
				
			default:
				norm = region;
				break;
		}
		
		return norm;
	},
	
	//* @public
	/**
	Map a mobile carrier code to a country dialing code.
	*/
	mapMCCtoCC: function (mcc) {
		if (!mcc) {
			return undefined;
		}
		if (!enyo.g11n.PhoneUtils.mcc2cc) {
			enyo.g11n.PhoneUtils.mcc2cc = enyo.g11n.Utils.getNonLocaleFile({
				root: enyo.g11n.Utils._getEnyoRoot("../"),
				path: "phone/base/data/maps/mcc2cc.json"
			});
		}
		
		return enyo.g11n.PhoneUtils.mcc2cc[mcc];
	},
	
	/**
	Map a mobile carrier code to a region code.
	*/
	mapMCCtoRegion: function (mcc) {
		if (!mcc) {
			return undefined;
		}
		if (!enyo.g11n.PhoneUtils.mcc2reg) {
			enyo.g11n.PhoneUtils.mcc2reg = enyo.g11n.Utils.getNonLocaleFile({
				root: enyo.g11n.Utils._getEnyoRoot("../"),
				path: "phone/base/data/maps/mcc2reg.json"
			});
		}
		
		return enyo.g11n.PhoneUtils.normPhoneReg(enyo.g11n.PhoneUtils.mcc2reg[mcc]) || "unknown";
	},
	
	/**
	Map a country dialing code to a region code.
	*/
	mapCCtoRegion: function (cc) {
		if (!cc) {
			return undefined;
		}
		if (!enyo.g11n.PhoneUtils.cc2reg) {
			enyo.g11n.PhoneUtils.cc2reg = enyo.g11n.Utils.getNonLocaleFile({
				root: enyo.g11n.Utils._getEnyoRoot("../"),
				path: "phone/base/data/maps/cc2reg.json"
			});
		}
		
		return enyo.g11n.PhoneUtils.cc2reg[cc] || "unknown";
	},
	
	/**
	Map a region code to a country dialing code.
	*/
	mapRegiontoCC: function(region) {

		if (!region) {
			return undefined;
		}
		if (!enyo.g11n.PhoneUtils.reg2cc) {
			enyo.g11n.PhoneUtils.reg2cc = enyo.g11n.Utils.getNonLocaleFile({
				root: enyo.g11n.Utils._getEnyoRoot("../"),
				path: "phone/base/data/maps/reg2cc.json"
			});
		}

		return enyo.g11n.PhoneUtils.reg2cc[region] || "0";
	},

	/**
	Map an area code within a dialing plan (cc) to a region code.
	Some dialing plans (notably the North American Numbering Plan)
	encompass multiple countries, and have particular area codes 
	assigned to those countries. This maps back to the actual
	country code.
	*/
	mapAreaToRegion: function (cc, area) {
		if (!cc) {
			return undefined;
		}
		if (!enyo.g11n.PhoneUtils.area2reg) {
			enyo.g11n.PhoneUtils.area2reg = enyo.g11n.Utils.getNonLocaleFile({
				root: enyo.g11n.Utils._getEnyoRoot("../"),
				path: "phone/base/data/maps/area2reg.json"
			});
		}

		if (cc in enyo.g11n.PhoneUtils.area2reg) {
			return enyo.g11n.PhoneUtils.area2reg[cc][area] || enyo.g11n.PhoneUtils.area2reg[cc]["default"];
		} else {
			return enyo.g11n.PhoneUtils.mapCCtoRegion(cc);
		}
	},
	
	//* @protected
	// return a code for each dialable digit in a phone number
	_getCharacterCode: function _getCharacterCode(ch) {
		if (ch >= '0' && ch <= '9') {
			return ch - '0';
		}
		switch (ch) {
		case '+':
			return 10;
		case '*':
			return 11;
		case '#':
			return 12;
		case '^':
			return 13;
		case 'p':		// pause chars
		case 'P':
		case 't':
		case 'T':
		case 'w':
		case 'W':
			return -1;
		case 'x':
		case 'X':		// extension char
			return -1;
		}
		return -2;
	},
	
	//* @public
	/**
	 Takes an IMSI number as a string, parses out the parts and returns them
	  
	 This function takes an IMSI number as a string, and returns its parts.
	 The parts are:
	 
	 *- *mcc*: the Mobile Country Code
	 * *mnc*: the Mobile Network Code (identifies the carrier)
	 * *msin*: the Mobile Service Identification Number (usually the person's subscriber number)
	 
	 Returns an object containing the the parsed imsi, or undefined if the imsi
	 could not be parsed. 
	 */
	parseImsi: function(imsi) {
		var ch, 
			i,
			stateTable, 
			end, 
			handlerMethod,
			state = 0,
			newState,
			fields = {};
		
		// console.log("parseImsi: parsing imsi " + imsi);
		
		if (!imsi) {
			return undefined;
		}
		
		i = 0;
		stateTable = new enyo.g11n.StatesData({
			path: "phone/base/data/states",
			locale: new enyo.g11n.Locale("_mnc")
		});
		if (!stateTable) {
			// can't parse anything
			return undefined;
		}
		
		while ( i < imsi.length ) {
			ch = enyo.g11n.PhoneUtils._getCharacterCode(imsi.charAt(i));
			// console.info("parsing char " + imsi.charAt(i) + " code: " + ch);
			if (ch >= 0) {
				newState = stateTable.get(state)[ch];
				
				if (newState < 0) {
					// reached a final state. First convert the state to a positive array index
					// in order to look up the name of the handler function name in the array
					state = newState;
					newState = -newState - 1;
					handlerMethod = enyo.g11n.PhoneUtils.states[newState];
					// console.info("reached final state " + newState + " handler method is " + handlerMethod + " and i is " + i);

					// deal with syntactic ambiguity by using the "special" end state instead of "area"
					if ( handlerMethod === "area" ) {
						end = i+1;
					} else if ( handlerMethod === "special" ) {
						end = i;
					} else {
						// unrecognized imsi, so just assume the mnc is 3 digits
						end = 6;
					}
					
					fields.mcc = imsi.substring(0,3);
					fields.mnc = imsi.substring(3,end);
					fields.msin = imsi.substring(end);

					break;
				} else {
					// console.info("recognized digit " + optionalch + " continuing...");
					// recognized digit, so continue parsing
					state = newState;
					i++;
				}
			} else if ( ch === -1 ) {
				// non-transition character, continue parsing in the same state
				i++;
			} else {
				// should not happen
				// console.info("skipping character " + ch);
				// not a digit, plus, pound, or star, so this is probably a formatting char. Skip it.
				i++;
			}
		}
		
		if ( state > 0 ) {
			if ( i >= imsi.length && i >= 6 ) {
				// we reached the end of the imsi, but did not finish recognizing anything. 
				// Default to last resort and assume 3 digit mnc
				fields.mcc = imsi.substring(0,3);
				fields.mnc = imsi.substring(3,6);
				fields.msin = imsi.substring(6);
			} else {
				// unknown or not enough characters for a real imsi 
				fields = undefined;
			}
		}
		
		// console.info("Globalization.Phone.parseImsi: final result is: " + JSON.stringify(fields));
		
		enyo.g11n.Utils.releaseAllJsonFiles();
		
		return fields;
	}
};