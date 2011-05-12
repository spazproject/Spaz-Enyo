/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
 * @name fmts.js
 * @fileOverview basic handling of the format info files
 * 
 * Copyright 2010 HP, Inc.  All rights reserved.
 */

/*globals EnvironmentUtils PalmSystem MojoLoader console G11n enyo*/

//* @public
/**
Create an instance of a formats information object.

* params: currently, the only parameter that is used is "locale". Leave this argument undefined to 
cause this instance to use the current device formats locale.
 
Return an instance of a formats information object. This instance has various pieces of information 
about the given locale. 
*/
enyo.g11n.Fmts = function Fmts(params){
	 var locale;
	 if (typeof(params) === 'undefined' || !params.locale) {
		 this.locale = enyo.g11n.formatLocale();
	 } else if (typeof(params.locale) === 'string') {
		 this.locale = new enyo.g11n.Locale(params.locale);
	 } else {
		 this.locale = params.locale;
	 }
	
	 this.dateTimeFormatHash = enyo.g11n.Utils.getJsonFile({
		 root: enyo.g11n.Utils._getEnyoRoot(),
		 path: "base/formats",
		 locale: this.locale,
		 type: "region"
	 });
	 
	 this.dateTimeHash = enyo.g11n.Utils.getJsonFile({
		 root: enyo.g11n.Utils._getEnyoRoot(),
		 path: "base/datetime_data",
		 locale: this.locale
	 });
	 
	 if (!this.dateTimeHash) {
		 this.dateTimeHash = enyo.g11n.Utils.getJsonFile({
			 root: enyo.g11n.Utils._getEnyoRoot(),
			 path: "base/datetime_data",
			 locale: enyo.g11n.currentLocale()
		 });
	 }

	 if (!this.dateTimeHash) {
		 this.dateTimeHash = enyo.g11n.Utils.getJsonFile({
			 root: enyo.g11n.Utils._getEnyoRoot(),
			 path: "base/datetime_data",
			 locale: new enyo.g11n.Locale('en_us')	// should always exist
		 });
	 }
};

//* @public
/**
Tell whether or not the user is currently using a 12-hour or 24-hour clock on this device.

Returns true if 12-hour, and false for 24-hour.
*/
enyo.g11n.Fmts.prototype.isAmPm = function(){
	if (typeof(this.twelveHourFormat) === 'undefined') {
		if(enyo.g11n.getPlatform() === "device") {
			this.twelveHourFormat = (PalmSystem.timeFormat === "HH12");
		} else {
			this.twelveHourFormat = this.dateTimeFormatHash.is12HourDefault;
		}
	}
	
	return this.twelveHourFormat;
};

//* @public
/**
Return true if this locale uses a 12-hour clock to format times,
or false for a 24-hour clock.
*/
enyo.g11n.Fmts.prototype.isAmPmDefault = function(){
	return this.dateTimeFormatHash.is12HourDefault;
};

//* @public
/**
Return the day of the week that represents the first day of the week in the
current locale. The numbers represent the days of the week as such:

* 0 - Sunday
* 1 - Monday
* 2 - Tuesday
* etc.
 
*/
enyo.g11n.Fmts.prototype.getFirstDayOfWeek = function(){
	return this.dateTimeFormatHash.firstDayOfWeek;
};

//* @public
/**
Returns the order of the fields in a formatted date for the current locale. This
function returns an array of strings in the correct order. The strings it returns
are one of:

* month
* day
* year

*/
enyo.g11n.Fmts.prototype.getDateFieldOrder = function(){
	if (!this.dateTimeFormatHash){
		console.warn("Failed to load date time format hash");
		return "mdy";
	}

	return this.dateTimeFormatHash.dateFieldOrder;
};

//* @public
/**
Returns the order of the fields in a formatted time for the current locale. This
function returns an array of strings in the correct order. The strings it returns
are one of:

* minute
* hour
* ampm

The last string represents where the AM or PM marker should go for 12-hour clocks.

*/
enyo.g11n.Fmts.prototype.getTimeFieldOrder = function(){

	if (!this.dateTimeFormatHash){
		console.warn("Failed to load date time format hash");
		return "hma";
	}
	
	return this.dateTimeFormatHash.timeFieldOrder;
};

//* @public
/**
Returns the medium-sized abbreviation for the month names in this locale. In most locales, this
is the 3-letter abbreviations of the month names.
*/
enyo.g11n.Fmts.prototype.getMonthFields = function(){
	if (this.dateTimeHash){
		return this.dateTimeHash.medium.month;
	}else{
		return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	}
};

/**
Returns the string for AM in the current locale, or the default AM if it cannot be found.
*/
enyo.g11n.Fmts.prototype.getAmCaption = function(){
	if (this.dateTimeHash){
		return this.dateTimeHash.am;
	}else{
		console.error("Failed to load dateTimeHash.");
		return "AM";
	}
};

/**
Returns the string for PM in the current locale, or the default PM if it cannot be found.
*/
enyo.g11n.Fmts.prototype.getPmCaption = function(){
	if (this.dateTimeHash){
		return this.dateTimeHash.pm;
	}else{
		console.error("Failed to load dateTimeHash.");
		return "PM";
	}
};

/**
Returns the measurement system for the current locale. The possible values are "uscustomary",
"imperial", and "metric". The default is "metric" if not otherwise specified in the formats 
config file.
*/
enyo.g11n.Fmts.prototype.getMeasurementSystem = function(){
	return (this.dateTimeFormatHash && this.dateTimeFormatHash.measurementSystem) || "metric";
};

/**
Returns the default paper size for printers in the current locale. The possible values 
are "letter" (ie. 8½" x 11") or "A4" (210mm × 297mm). The default is "A4" if not otherwise
specified in the formats config file.
*/
enyo.g11n.Fmts.prototype.getDefaultPaperSize = function(){
	return (this.dateTimeFormatHash && this.dateTimeFormatHash.defaultPaperSize) || "A4";
};

/**
Returns the default photo size for printers in the current locale. The possible values 
are "10X15CM" (ie. 10 by 15 cm), "4x6" (4 x 6 inches), or "L" (roughly 9 × 13 cm). The 
default is "10X15CM" if not otherwise specified in the formats config file.
*/
enyo.g11n.Fmts.prototype.getDefaultPhotoSize = function(){
	return (this.dateTimeFormatHash && this.dateTimeFormatHash.defaultPhotoSize) || "10X15CM";
};

/**
Returns the zone ID of the default time zone for the locale. For many locales, there are multiple
time zones. This function returns the one that either is the most important or contains the 
largest population. If the current formats object is for an unknown locale, the default time
zone is GMT (Europe/London).
*/
enyo.g11n.Fmts.prototype.getDefaultTimeZone = function(){
	return (this.dateTimeFormatHash && this.dateTimeFormatHash.defaultTimeZone) || "Europe/London";
};
