/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*
 * Copyright (c) 2010-2011 HP, Inc.  All rights reserved.
 */

/*globals G11n PhoneLoc console PhoneNumber NumPlan StatesData PhoneUtils Resources */

//* @public

/**
Create a new geo locator instance that behaves according to the given parameters.

The params object can contain zero or more of the following properties:

* locale: locale to use for geolocation
* mcc: mcc of the carrier the device is currently connected to, which specifies the locale

If the MCC is also not available, this method will fall back on the passed-in 
locale parameter if it is available. 

If the locale parameter is also not available, this method relies on the default 
phone region of the device.

*/
enyo.g11n.GeoLocator = function(params) {
	this.locale = new enyo.g11n.PhoneLoc(params);
	this.transLocale = (params && params.locale) || this.locale;
	
	this.idd = enyo.g11n.Utils.getNonLocaleFile({
		root: enyo.g11n.Utils._getEnyoRoot("../"),
		path: "phone/geo/data/area/idd.json",
		locale: this.locale
	});
	
	this.geoTable = enyo.g11n.Utils.getNonLocaleFile({
		root: enyo.g11n.Utils._getEnyoRoot("../"),
		path: "phone/geo/data/area/" + this.locale.region + ".json",
		locale: this.locale
	});

	this.plan = new enyo.g11n.NumPlan({locale: this.locale});

	if (this.plan.extendedAreaCodes) {
		this.extGeoTable = enyo.g11n.Utils.getNonLocaleFile({
			root: enyo.g11n.Utils._getEnyoRoot("../"),
			path: "phone/geo/data/extarea/" + this.locale.region + ".json",
			locale: this.locale
		}); 
		this.extStatesTable = new enyo.g11n.StatesData({
			root: enyo.g11n.Utils._getEnyoRoot("../"),
			path: "phone/geo/data/extstates",
			locale: this.locale
		});
	}
};

enyo.g11n.GeoLocator.prototype = {
	//* @protected
	// used for locales where the area code is very general, and you need to add in
	// the initial digits of the subscriber number in order to get the area
	_parseAreaAndSubscriber: function _parseAreaAndSubscriber(number, stateTable) {
		var ch,
			i,
			handlerMethod,
			state = 0,
			newState,
			prefix = "",
			dot = 14;	// special transition which matches all characters. See AreaCodeTableMaker.java
		
		i = 0;
		if (!number || !stateTable) {
			// can't parse anything
			return undefined;
		}
		
		//console.log("GeoLocator._parseAreaAndSubscriber: parsing number " + number);
		
		while (i < number.length) {
			ch = enyo.g11n.PhoneUtils._getCharacterCode(number.charAt(i));
			//console.info("parsing char " + number.charAt(i) + " code: " + ch);
			if (ch >= 0) {
				newState = stateTable.get(state)[ch];
				
				if (newState === -1 && stateTable.get(state)[dot] !== -1) {
					// check if this character can match the dot instead
					newState = stateTable.get(state)[dot];
					//console.log("char " + ch + " doesn't have a transition. Using dot to transition to state " + newState);
					prefix += '.';
				} else {
					prefix += ch;
				}
				
				if (newState < 0) {
					// reached a final state. First convert the state to a positive array index
					// in order to look up the name of the handler function name in the array
					state = newState;
					newState = -newState - 1;
					handlerMethod = enyo.g11n.PhoneUtils.states[newState];
					//console.info("reached final state " + newState + " handler method is " + handlerMethod + " and i is " + i);

					return (handlerMethod === "area") ? prefix : undefined;
				} else {
					//console.info("recognized digit " + ch + " continuing...");
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
		
		return undefined;
	},
	
	_matchPrefix: function _matchPrefix(prefix, table) {
		var i, matchedDot, matchesWithDots = [], entry;
		
		// console.log("_matchPrefix: matching " + prefix + " against table");
		if (table[prefix]) {
			return table[prefix];
		}
		for (entry in table) {
			if (entry && typeof(entry) === 'string') {
				i = 0;
				matchedDot = false;
				while (i < entry.length && (entry.charAt(i) === prefix.charAt(i) || entry.charAt(i) === '.')) {
					if (entry.charAt(i) === '.') {
						matchedDot = true;
					}
					i++;
				}
				if (i >= entry.length) {
					if (matchedDot) {
						matchesWithDots.push(entry);
					} else {
						return table[entry];
					}
				}
			}
		}
		
		// match entries with dots last, so sort the matches so that the entry with the 
		// most dots sorts last. The entry that ends up at the beginning of the list is
		// the best match because it has the fewest dots
		if (matchesWithDots.length > 0) {
			matchesWithDots.sort(function (left, right) {
				return (right < left) ? -1 : ((left < right) ? 1 : 0);
			});
			return table[matchesWithDots[0]];
		}
		
		return undefined;
	},
	
	//* @public
	/**
	 * Returns a the location of the given phone number, if known. 
	  
	 * number (String): A enyo.g11n.PhoneNumber instance containing a phone number to locate
	  
	 The returned object has 2 properties, each of which has an sn (short name) 
	 and an ln (long name) string. Additionally, the country code, if given,
	 includes the 2 letter ISO code for the recognized country.
	 
	     {
	          "country": {
	              "sn": "North America",
	              "ln": "North America and the Caribbean Islands",
	              "code": "us"
	          },
	          "area": {
	              "sn": "California",
	              "ln": "Central California: San Jose, Los Gatos, Milpitas, Sunnyvale, Cupertino, Gilroy"
	          }
	     }
	 
	 The location name is subject to the following rules:
	 
	 If the areaCode property is undefined or empty, or if the number specifies a 
	 country code for which we do not have information, then the area property may be 
	 missing from the returned object. In this case, only the country object will be returned.
	 
	 If there is no area code, but there is a mobile prefix, service code, or emergency 
	 code, then a fixed string indicating the type of number will be returned.
	 
	 The country object is filled out according to the countryCode property of the phone
	 number. 
	 
	 If the phone number does not have an explicit country code, the MCC will be used if
	 it is available. The country code can be gleaned directly from the MCC. If the MCC 
	 of the carrier to which the phone is currently connected is available, it should be 
	 passed in so that local phone numbers will look correct.
	 
	 If the country's dialling plan mandates a fixed length for phone numbers, and a 
	 particular number exceeds that length, then the area code will not be given on the
	 assumption that the number has problems in the first place and we cannot guess
	 correctly.
	 
	 The returned area property varies in specificity according
	 to the locale. In North America, the area is no finer than large parts of states
	 or provinces. In Germany and the UK, the area can be as fine as small towns.
	 
	 The strings returned from this function are already localized to the 
	 given locale, and thus are ready for display to the user.
	 
	 If the number passed in is invalid, an empty object is returned. If the location
	 information about the country where the phone number is located is not available,
	 then the area information will be missing and only the country will be returned.
	 */
	locate: function (number) {
		var ret = {}, 
			region, 
			countryCode, 
			rb, 
			areaInfo, 
			temp, 
			areaCode, 
			geoTable, 
			plan,
			tempNumber, 
			prefix, 
			statesTable,
			locale;
			
		if (number === undefined || typeof(number) !== 'object' || !(number instanceof enyo.g11n.PhoneNumber)) {
			return ret;
		}

		// console.log("GeoLocator.locate: looking for geo for number " + JSON.stringify(number));
		
		region = this.locale.region;
		
		if (number.countryCode !== undefined && this.idd) {
			countryCode = number.countryCode.replace(/[wWpPtT\+#\*]/g, '');	// fix for NOV-108200
			temp = this.idd[countryCode];
			locale = new enyo.g11n.PhoneLoc({countryCode: countryCode});
			if (locale.region !== this.locale.region) {
				plan = new enyo.g11n.NumPlan({locale: locale});
				geoTable = enyo.g11n.Utils.getNonLocaleFile({
					root: enyo.g11n.Utils._getEnyoRoot("../"),
					path: "phone/geo/data/area/" + locale.region + ".json",
					locale: locale
				});
			}
			ret.country = {
				sn: temp.sn,
				ln: temp.ln,
				code: locale.region
			};
		}
		
		if (!plan) {
			plan = this.plan;
			locale = this.locale;
			geoTable = this.geoTable;
		}

		// console.log("locale of the number is " + locale.toString());
		
		// localize before we send it back. Make sure to use the translation locale, not the
		// locale where we are currently located.
		rb = new enyo.g11n.Resources({
			root: enyo.g11n.Utils._getEnyoRoot("../") + "/phone/geo",
			locale: this.transLocale
		});
		
		prefix = number.areaCode || number.serviceCode;
		
		if (prefix !== undefined) {
			if (plan.extendedAreaCodes) {
				// for countries where the area code is very general and large, and you need a few initial
				// digits of the subscriber number in order find the actual area
				tempNumber = prefix + number.subscriberNumber;
				tempNumber = tempNumber.replace(/[wWpPtT\+#\*]/g, '');	// fix for NOV-108200
				if (locale.region === this.locale.region) {
					geoTable = this.extGeoTable;
					statesTable = this.extStatesTable;
				} else {
					geoTable = enyo.g11n.Utils.getNonLocaleFile({
						root: enyo.g11n.Utils._getEnyoRoot("../"),
						path: "phone/geo/data/extarea/" + locale.region + ".json",
						locale: locale
					}); 
					statesTable = new enyo.g11n.StatesData({
						root: enyo.g11n.Utils._getEnyoRoot("../"),
						path: "phone/geo/data/extstates",
						locale: locale
					});
				}
				
				if (geoTable && statesTable) {
					prefix = this._parseAreaAndSubscriber(tempNumber, statesTable);
					//console.log("tempNumber is " + tempNumber + " got prefix " + prefix);
				}

				if (!prefix) {
					// not a recognized prefix, so now try the general table
					geoTable = (locale.region === this.locale.region) ? this.geoTable : enyo.g11n.Utils.getNonLocaleFile({
						root: enyo.g11n.Utils._getEnyoRoot("../"),
						path: "phone/geo/data/extarea/" + locale.region + ".json",
						locale: locale
					}); 
					prefix = number.areaCode || number.serviceCode;
					//console.log("second try with area code found prefix " + prefix);
				}
					
				if ((!plan.fieldLengths || 
					  plan.fieldLengths.maxLocalLength === undefined ||
					  !number.subscriberNumber ||
					  number.subscriberNumber.length <= plan.fieldLengths.maxLocalLength)) {
					areaInfo = this._matchPrefix(prefix, geoTable);
					if (areaInfo && areaInfo.sn && areaInfo.ln) {
						//console.log("Found areaInfo " + JSON.stringify(areaInfo));
						ret.area = {
							sn: areaInfo.sn,
							ln: areaInfo.ln
						};
					}
				}
			} else if (!plan || 
						!plan.fieldLengths || 
						plan.fieldLengths.maxLocalLength === undefined || 
						!number.subscriberNumber ||
						number.subscriberNumber.length <= plan.fieldLengths.maxLocalLength) {
						
				// console.error("area code is: " + prefix);
				
				if (geoTable) {
					areaCode = prefix.replace(/[wWpPtT\+#\*]/g, '');	// fix for NOV-108200
					areaInfo = this._matchPrefix(areaCode, geoTable);
					// console.error("area info is: " + JSON.stringify(areaInfo));
					if (areaInfo && areaInfo.sn && areaInfo.ln) {
						ret.area = {
							sn: areaInfo.sn,
							ln: areaInfo.ln
						};
					} else if (number.serviceCode) {
						ret.area = {
							sn: rb.$L("Service Number"),
							ln: rb.$L("Service Number")
						};
					} else {
						// unknown area or service code, so put the country
						countryCode = enyo.g11n.PhoneUtils.mapRegiontoCC(locale.region);
						if (countryCode !== "0" && this.idd) {
							temp = this.idd[countryCode];
							if (temp && temp.sn) {
								ret.country = {
									sn: temp.sn,
									ln: temp.ln,
									code: region
								};
							}
						}
					}
				}
			} else {
				countryCode = enyo.g11n.PhoneUtils.mapRegiontoCC(locale.region);
				if (countryCode !== "0" && this.idd) {
					temp = this.idd[countryCode];
					if (temp && temp.sn) {
						ret.country = {
							sn: temp.sn,
							ln: temp.ln,
							code: region
						};
					}
				}
			}
		} else if (number.mobilePrefix) {
			ret.area = {
				sn: rb.$L("Mobile Number"),
				ln: rb.$L("Mobile Number")
			};
		} else if (number.emergency) {
			ret.area = {
				sn: rb.$L("Emergency Services Number"),
				ln: rb.$L("Emergency Services Number")
			};
		}		
		
		if (ret.area && ret.country === undefined) {
			// no explicit country, so put the default
			countryCode = enyo.g11n.PhoneUtils.mapRegiontoCC(region);
			if (countryCode !== "0" && this.idd) {
				temp = this.idd[countryCode];
				if (temp && temp.sn) {
					ret.country = {
						sn: temp.sn,
						ln: temp.ln,
						code: region
					};
				}
			}
		}
		
		if (rb) {
			if (ret.area) {
				if (ret.area.sn) {
					ret.area.sn = rb.$L(ret.area.sn);
				}
				if (ret.area.ln) {
					ret.area.ln = rb.$L(ret.area.ln);
				}
			}
			if (ret.country) {
				if (ret.country.sn) {
					ret.country.sn = rb.$L(ret.country.sn);
				}
				if (ret.country.ln) {
					ret.country.ln = rb.$L(ret.country.ln);
				}
			}
		}
		
		enyo.g11n.Utils.releaseAllJsonFiles();
		
		return ret;
	},
	
	/**
	 Returns a string that describes the ISO-3166-2 country code of the given phone
	 number. 
	 
	 * number (Object): An enyo.g11n.PhoneNumber instance
	  
	 If the phone number is a local phone number and does not contain
	 any country information, this routine will return the region for the current
	 formatter instance.
	 */
	country: function(number) {
		var countryCode, region;

		if (!number || !(number instanceof enyo.g11n.PhoneNumber)) {
			return undefined;
		}

		region = (number.countryCode && enyo.g11n.PhoneUtils.mapCCtoRegion(number.countryCode)) ||
			(number.locale && number.locale.region) || 
			this.locale.region || 
			enyo.g11n.phoneLocale().region;
		countryCode = number.countryCode || enyo.g11n.PhoneUtils.mapRegiontoCC(region);
		
		if (number.areaCode) {
			region = enyo.g11n.PhoneUtils.mapAreaToRegion(countryCode, number.areaCode);
		} else if (countryCode === "33" && number.serviceCode) {
			// french departments are in the service code, not the area code
			region = enyo.g11n.PhoneUtils.mapAreaToRegion(countryCode, number.serviceCode);
		}
		
		return region;
	}
};

