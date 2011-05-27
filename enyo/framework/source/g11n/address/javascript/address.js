/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
@name address.js
@fileOverview address parsing routines

Copyright 2010 HP, Inc.  All rights reserved.
 */

/*globals console G11n RegExp enyo */

//* @public
/**
Create a new Address instance and parse a physical address.

* address (String): free-form address to parse, or a javascript object
containing the fields
* params (Object): parameters to the parser.

locale to use to parse the address. If not specified, 
this function will use the current locale

This function parses a physical address written in a free-form string. 
It returns an object with a number of properties from the list below 
that it may have extracted from that address.

The following is a list of properties that the algorithm will return:

* streetAddress: The street address, including house numbers and all
* locality: the locality of this address (usually a city or town) 
* region: the region where the locality is located. In the US, this
corresponds to states
* postalCode: country-specific code for expediting mail. In the US, 
this is the zip code 
* country: the country of the address 

For any individual property, if the address does not contain that
property, it is left out.

When an address cannot be parsed properly, the entire address will be placed
into the streetAddress property.

Returns an object with the various properties listed above.
*/
enyo.g11n.Address = function (freeformAddress, params) {
	var addressInfo,
		address,
		i, 
		countryName,
		translated,
		countries,
		localizedCountries,
		start, 
		locale,
		localeRegion,
		fieldNumber,
		match,
		fields,
		field,
		latinChars = 0,
		asianChars = 0,
		startAt,
		infoFields,
		pattern,
		matchFunction;
	
	if (!freeformAddress) {
		return undefined;
	}
	
	if (!params || !params.locale) {
		this.locale = enyo.g11n.formatLocale(); // can't do anything unless we know the locale
	} else if (typeof(params.locale) === 'string') {
		this.locale = new enyo.g11n.Locale(params.locale);
	} else {
		this.locale = params.locale;
	}
	
	// initialize from an already parsed object
	if (typeof(freeformAddress) === 'object') {
		this.streetAddress = freeformAddress.streetAddress;
		this.locality = freeformAddress.locality;
		this.region = freeformAddress.region;
		this.postalCode = freeformAddress.postalCode;
		this.country = freeformAddress.country;
		if (freeformAddress.countryCode) {
			this.countryCode = freeformAddress.countryCode;
		}
		if (freeformAddress.format) {
			this.format = freeformAddress.format;
		}
		return this;
	}

	locale = this.locale;
	
	countries = enyo.g11n.Utils.getNonLocaleFile({
		root: enyo.g11n.Utils._getEnyoRoot(),
		path: "address/data/name2reg.json"
	});
	
	//console.log("Loading in resources for locale " + locale.toString());
	localizedCountries = new enyo.g11n.Resources({
		locale: locale,
		root: enyo.g11n.Utils._getEnyoRoot() + "/address"
	});
	
	localeRegion = new enyo.g11n.Locale("_" + locale.region);
	addressInfo = enyo.g11n.Utils.getJsonFile({
		root: enyo.g11n.Utils._getEnyoRoot(),
		path: "address/data",
		locale: localeRegion
	});

	// console.log("Loading in locale " + locale.toString() + " and addressInfo is " + addressInfo);
	
	// clean it up first
	address = freeformAddress.replace(/[ \t\r]+/g, " ").trim();
	address = address.replace(/[\s\n]+$/, "");
	address = address.replace(/^[\s\n]+/, "");
	//console.log("\n\n-------------\nAddress is '" + address + "'");
	
	// for locales that support both latin and asian character addresses, 
	// decide if we are parsing an asian or latin script address
	if (addressInfo && addressInfo.multiformat) {
		for (i = 0; i < address.length; i++) {
			if (enyo.g11n.Char.isIdeo(address.charAt(i))) {
				asianChars++;
			} else if (enyo.g11n.Char.isLetter(address.charAt(i))) {
				latinChars++;
			}
		}
		
		this.format = (asianChars >= latinChars) ? "asian" : "latin";
		startAt = addressInfo.startAt[this.format];
		// console.log("multiformat locale: format is now " + this.format);
	} else {
		startAt = (addressInfo && addressInfo.startAt) || "end";
	}
	this.compare = (startAt === "end") ? this.endsWith : this.startsWith;
	
	// first break the free form string down into possible fields. These may
	// or may not be fields, but if there is a field separator char there, it
	// will probably help us
	for (countryName in countries) {
		if (countryName) {
			translated = localizedCountries.$L(countryName);
			start = this.compare(address, translated);
			if (start !== -1) {
				this.country = address.substring(start, start+translated.length);
				this.countryCode = countries[countryName];
				address = address.substring(0,start) + address.substring(start+translated.length);
				address = address.trim();
				if (this.countryCode !== locale.region) {
					locale = new enyo.g11n.Locale("_" + this.countryCode);
					// console.log("Address: found country name " + this.country + ". Switching to locale " + this.countryCode + " to parse the rest of the address:" + address);
	
					addressInfo = enyo.g11n.Utils.getJsonFile({
						root: enyo.g11n.Utils._getEnyoRoot(),
						path: "address/data",
						locale: locale
					});
					//console.log("Loading in locale " + locale.toString() + " and addressInfo is " + addressInfo);
					
					if (addressInfo && addressInfo.multiformat) {
						for (i = 0; i < address.length; i++) {
							if (enyo.g11n.Char.isIdeo(address.charAt(i))) {
								asianChars++;
							} else if (enyo.g11n.Char.isLetter(address.charAt(i))) {
								latinChars++;
							}
						}
						
						this.format = (asianChars >= latinChars) ? "asian" : "latin";
						//console.log("multiformat locale: format is now " + this.format);
					}
				//} else {
					//console.log("Same locale. Continuing parsing in " + this.countryCode);
				}
				break;
			}
		}
	}
	
	if (!this.countryCode) {
		this.countryCode = this.locale.region;
	}

	if (!addressInfo) {
		addressInfo = enyo.g11n.Utils.getJsonFile({
			root: enyo.g11n.Utils._getEnyoRoot(),
			path: "address/data",
			locale: new enyo.g11n.Locale("unknown_unknown")
		});
		
		//console.log("Loading in locale unknown and addressInfo is " + addressInfo);
	}
	
	fields = address.split(/[,，\n]/img);
	//console.log("fields is: " + JSON.stringify(fields));
	
	if (addressInfo.multiformat) {
		startAt = addressInfo.startAt[this.format];
		infoFields = addressInfo.fields[this.format];
	} else {
		startAt = addressInfo.startAt;
		infoFields = addressInfo.fields;
	}
	this.compare = (startAt === "end") ? this.endsWith : this.startsWith;
	
	for (i = 0; i < infoFields.length && fields.length > 0; i++) {
		field = infoFields[i];
		this.removeEmptyLines(fields);
		//console.log("Searching for field " + field.name);
		if (field.pattern) {
			if (typeof(field.pattern) === 'string') {
				pattern = new RegExp(field.pattern, "img");
				matchFunction = this.matchRegExp;
			} else {
				pattern = field.pattern;
				matchFunction = this.matchPattern;
			}
				
			switch (field.line) {
			case 'startAtFirst':
				for (fieldNumber = 0; fieldNumber < fields.length; fieldNumber++) {
					match = matchFunction(this, fields[fieldNumber], pattern, field.matchGroup, startAt);
					if (match) {
						break;
					}
				}
				break;
			case 'startAtLast':
				for (fieldNumber = fields.length-1; fieldNumber >= 0; fieldNumber--) {
					match = matchFunction(this, fields[fieldNumber], pattern, field.matchGroup, startAt);
					if (match) {
						break;
					}
				}
				break;
			case 'first':
				fieldNumber = 0;
				match = matchFunction(this, fields[fieldNumber], pattern, field.matchGroup, startAt);
				break;
			case 'last':
			default:
				fieldNumber = fields.length - 1;
				match = matchFunction(this, fields[fieldNumber], pattern, field.matchGroup, startAt);
				break;
			}
			if (match) {
				// console.log("found match: " + JSON.stringify(match));
				fields[fieldNumber] = match.line;
				this[field.name] = match.match;
			}
		} else {
			// if nothing is given, default to taking the whole field
			this[field.name] = fields.splice(fieldNumber,1)[0].trim();
			//console.log("typeof(this[fieldName]) is " + typeof(this[fieldName]) + " and value is " + JSON.stringify(this[fieldName]));
		}
	}
		
	// all the left overs go in the street address field
	this.removeEmptyLines(fields);
	if (fields.length > 0) {
		//console.log("fields is " + JSON.stringify(fields) + " and splicing to get streetAddress");
		var joinString = (this.format && this.format === "asian") ? "" : ", ";
		this.streetAddress = fields.join(joinString).trim();
	}
	
	//console.log("final result is " + JSON.stringify(this));
};

//* @protected
enyo.g11n.Address.prototype = {
	endsWith: function (subject, query) {
		var start = subject.length-query.length,
			i,
			pat;
		//console.log("endsWith: checking " + query + " against " + subject);
		for (i = 0; i < query.length; i++) {
			if (subject.charAt(start+i).toLowerCase() !== query.charAt(i).toLowerCase()) {
				return -1;
			}
		}
		if (start > 0) {
			pat = /\s/;
			if (!pat.test(subject.charAt(start-1))) {
				// make sure if we are not at the beginning of the string, that the match is 
				// not the end of some other word
				return -1;
			}
		}
		return start;
	},
	
	startsWith: function (subject, query) {
		var i;
		// console.log("startsWith: checking " + query + " against " + subject);
		for (i = 0; i < query.length; i++) {
			if (subject.charAt(i).toLowerCase() !== query.charAt(i).toLowerCase()) {
				return -1;
			}
		}
		return 0;
	},
	
	removeEmptyLines: function (arr) {
		var i = 0;
		
		while (i < arr.length) {
			if (!arr[i] || arr[i].length === 0) {
				arr.splice(i,1);
			} else {
				arr[i] = arr[i].trim();
				i++;
			}
		}
	},
	
	matchRegExp: function(address, line, expression, matchGroup, startAt) {
		var start,
			lastMatch,
			match,
			j,
			ret = {},
			last;
		
		//console.log("searching for regexp " + expression.source + " in line " + line);
		
		match = expression.exec(line);
		if (startAt === 'end') {
			while (match !== null && match.length > 0) {
				//console.log("found matches " + JSON.stringify(match));
				lastMatch = match;
				match = expression.exec();
			}
			match = lastMatch;
		}
		
		if (match && match !== null) {
			//console.log("found matches " + JSON.stringify(match));
			matchGroup = matchGroup || 0;
			if (match[matchGroup] !== undefined) {
				ret.match = match[matchGroup].trim();
				last = line.lastIndexOf(match[matchGroup]);
				ret.line = line.slice(0,last);
				if (address.format !== "asian") {
					ret.line += " ";
				}
				ret.line += line.slice(last+match[matchGroup].length);
				ret.line = ret.line.trim();
				//console.log("found match " + ret.match + " from matchgroup " + matchGroup + " and rest of line is " + ret.line);
				return ret;
			}
		//} else {
			//console.log("no match");
		}
		
		return undefined;
	},
	
	matchPattern: function(address, line, pattern, matchGroup) {
		var regexp,
			start,
			match,
			j,
			ret = {},
			last;
		
		//console.log("searching in line " + line);
		
		// search an array of possible fixed strings
		//console.log("Using fixed set of strings.");
		for (j = 0; j < pattern.length; j++) {
			start = address.compare(line, pattern[j]); 
			if (start !== -1) {
				ret.match = line.substring(start, start+pattern[j].length);
				ret.line = line.substring(0,start).trim();
				//console.log("found match " + ret.match + " and rest of line is " + ret.line);
				return ret;
			}
		}
		
		return undefined;
	}
};