/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
 * @name format.js
 * @fileOverview address formatting routines
 * 
 * Copyright 2010 HP, Inc.  All rights reserved.
 */

/*globals console G11n Template Locale enyo*/

//* @public
/**
Create a new formatter object to format physical addresses in a particular way.

The params object may contain the following properties, both of which are optional:

* *locale* - the locale to use to format this address. If not specified, it uses the
formats locale of the device.
* *style* - the style of this address. The default style for each country usually includes
all valid fields for that country.

Returns a formatter instance that can format multiple addresses.
*/
enyo.g11n.AddressFmt = function(params) {
	var formatInfo, format;
	
	if (!params || !params.locale) {
		this.locale = enyo.g11n.formatLocale(); // can't do anything unless we know the locale
	} else if (typeof(params.locale) === 'string') {
		this.locale = new enyo.g11n.Locale(params.locale);
	} else {
		this.locale = params.locale;
	}
	
	// console.log("Creating formatter for region: " + this.locale.region);
	this.styleName = (params && params.style) || 'default';
	
	formatInfo = enyo.g11n.Utils.getJsonFile({
		root: enyo.g11n.Utils._getEnyoRoot(),
		path: "address/data",
		locale: new enyo.g11n.Locale("_" + this.locale.region)
	});

	this.style = formatInfo && formatInfo.formats && formatInfo.formats[this.styleName];
	
	// use generic default -- should not happen, but just in case...
	this.style = this.style || formatInfo.formats["default"] || "#{streetAddress}\n#{locality} #{region} #{postalCode}\n#{country}";
	
	enyo.g11n.Utils.releaseAllJsonFiles();
	
	return this;
};

/**
This function formats a physical address (enyo.g11n.Address instance) for display. 
Whitespace is trimmed from the beginning and end of final resulting string, and 
multiple consecutive whitespace characters in the middle of the string are 
compressed down to 1 space character.

If the Address instance is for a locale that is different than the locale for this
formatter, then a hybrid address is produced. The country name is located in the
correct spot for the current formatter's locale, but the rest of the fields are
formatted according to the default style of the locale of the actual address.

Example: a mailing address in China, but formatted for the US might produce the words
"People's Republic of China" in English at the last line of the address, and the 
Chinese-style address will appear in the first line of the address. In the US, the
country is on the last line, but in China the country is usually on the first line.

Returns a String containing the formatted address.
*/
enyo.g11n.AddressFmt.prototype.format = function (address) {
	var ret, template, other, format;
	
	if (!address) {
		return "";
	}
	// console.log("formatting address: " + JSON.stringify(address));
	if (address.countryCode && address.countryCode !== this.locale.region) {
		// we are formatting an address that is sent from this country to another country,
		// so only the country should be in this locale, and the rest should be in the other
		// locale
		// console.log("formatting for another locale. Loading in its settings: " + address.countryCode);
		other = new enyo.g11n.AddressFmt({
			locale: new enyo.g11n.Locale("_" + address.countryCode), 
			style: this.styleName
		});
		return other.format(address);
	}
	
	format = address.format ? this.style[address.format] : this.style;
	// console.log("Using format: " + format);
	template = new enyo.g11n.Template(format);
	ret = template.evaluate(address);
	ret = ret.replace(/[ \t]+/g, ' ');
	return ret.replace(/\n+/g, '\n').trim();
};
