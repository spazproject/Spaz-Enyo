/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
 * @name duration.js
 * @fileOverview date and time formatting routine for time durations rather than fixed dates
 * 
 * Copyright 2011 HP, Inc.  All rights reserved.
 */

/*globals console enyo*/

//* @public
/**
Create a new duration (time interval) formatter object.

* params (String/Object): parameters that control the output format

The params may contain the following properties:

* locale: locale to use to format the date. If not specified, the current format
locale of the device is used.
* style: style of duration to use. Valid styles are 'short', 'medium', 'long', 
and 'full'. The default is 'short' if not specified.

The styles form progressively longer strings. Examples of each style for US English:

* short: 2y 6m 2w 5d 14:21:56
* medium: 2 yr 6 mo 2 wk 5 dy 14:21:56
* long: 2 yrs 6 mos 2 wks 5 days 14 hrs 21 min 56 sec
* full: 2 years, 6 months, 2 weeks, 5 days, 14 hours, 21 minutes and 56 seconds

The format, the language of the words in the text, and the separator characters are 
correct for the given locale.

Returns a duration formatter object that can format time intervals according to the 
given parameters.
*/
enyo.g11n.DurationFmt = function(params) {
	if (typeof(params) === 'undefined') {
		this.locale = enyo.g11n.formatLocale();
		this.style = 'short';
	} else {
		if (!params.locale) {
			this.locale = enyo.g11n.formatLocale();
		} else if (typeof(params.locale) === 'string') {
			this.locale = new enyo.g11n.Locale(params.locale);
		} else {
			this.locale = params.locale;
		}
	
		if (params.style) {
			this.style = params.style;
			if (this.style !== 'short' && this.style !== 'medium' && this.style !== 'long' && this.style !== 'full') {
				this.style = 'short';
			}
		} else {
			this.style = 'short';
		}
	}
	
	this.rb = new enyo.g11n.Resources({
		root: enyo.g11n.Utils._getEnyoRoot() + "/base",
		locale: this.locale
	});
	
	if (this.style === "short") {
		this.parts = {
			years	: new enyo.g11n.Template(this.rb.$L({key: "yearsFormatShort", value: "##{num}y"})),
			months	: new enyo.g11n.Template(this.rb.$L({key: "monthsFormatShort", value: "##{num}m"})),
			weeks	: new enyo.g11n.Template(this.rb.$L({key: "weeksFormatShort", value: "##{num}w"})),
			days	: new enyo.g11n.Template(this.rb.$L({key: "daysFormatShort", value: "##{num}d"})),
			hours	: new enyo.g11n.Template(this.rb.$L({key: "hoursFormatShort", value: "##{num}"})),
			minutes	: new enyo.g11n.Template(this.rb.$L({key: "minutesFormatShort", value: "##{num}"})),
			seconds	: new enyo.g11n.Template(this.rb.$L({key: "secondsFormatShort", value: "##{num}"})),
			separator: this.rb.$L({key: "separatorShort", value: " "}),
			dateTimeSeparator: this.rb.$L({key: "dateTimeSeparatorShort", value: " "}),
			longTimeFormat: new enyo.g11n.Template(this.rb.$L({key: "longTimeFormatShort", value: "#{hours}:#{minutes}:#{seconds}"})),
			shortTimeFormat: new enyo.g11n.Template(this.rb.$L({key: "shortTimeFormatShort", value: "#{minutes}:#{seconds}"})),
			finalSeparator: "" // not used
		};
	} else if (this.style === "medium") {
		this.parts = {
			years	: new enyo.g11n.Template(this.rb.$L({key: "yearsFormatMedium", value: "##{num} yr"})),
			months	: new enyo.g11n.Template(this.rb.$L({key: "monthsFormatMedium", value: "##{num} mo"})),
			weeks	: new enyo.g11n.Template(this.rb.$L({key: "weeksFormatMedium", value: "##{num} wk"})),
			days	: new enyo.g11n.Template(this.rb.$L({key: "daysFormatMedium", value: "##{num} dy"})),
			hours	: new enyo.g11n.Template(this.rb.$L({key: "hoursFormatMedium", value: "##{num}"})),
			minutes	: new enyo.g11n.Template(this.rb.$L({key: "minutesFormatMedium", value: "##{num}"})),
			seconds	: new enyo.g11n.Template(this.rb.$L({key: "secondsFormatMedium", value: "##{num}"})),
			separator: this.rb.$L({key: "separatorMedium", value: " "}),
			dateTimeSeparator:  this.rb.$L( {key: "dateTimeSeparatorMedium", value: " "}),
			longTimeFormat: new enyo.g11n.Template(this.rb.$L({key: "longTimeFormatMedium", value: "#{hours}:#{minutes}:#{seconds}"})),
			shortTimeFormat: new enyo.g11n.Template(this.rb.$L({key: "shortTimeFormatMedium", value: "#{minutes}:#{seconds}"})),
			finalSeparator: "" // not used
		};
	} else if (this.style === "long") {
		this.parts = {
			years	: new enyo.g11n.Template(this.rb.$L({key: "yearsFormatLong", value: "1#1 yr|1>##{num} yrs"})),
			months	: new enyo.g11n.Template(this.rb.$L({key: "monthsFormatLong", value: "1#1 mon|1>##{num} mos"})),
			weeks	: new enyo.g11n.Template(this.rb.$L({key: "weeksFormatLong", value: "1#1 wk|1>##{num} wks"})),
			days	: new enyo.g11n.Template(this.rb.$L({key: "daysFormatLong", value: "1#1 day|1>##{num} dys"})),
			hours	: new enyo.g11n.Template(this.rb.$L({key: "hoursFormatLong", value: "0#|1#1 hr|1>##{num} hrs"})),
			minutes	: new enyo.g11n.Template(this.rb.$L({key: "minutesFormatLong", value: "0#|1#1 min|1>##{num} min"})),
			seconds	: new enyo.g11n.Template(this.rb.$L({key: "secondsFormatLong", value: "0#|1#1 sec|1>##{num} sec"})),
			separator: this.rb.$L({key: "separatorLong", value: " "}),
			dateTimeSeparator: this.rb.$L({key: "dateTimeSeparatorLong", value: " "}),
			longTimeFormat: "", // not used
			shortTimeFormat: "", // not used
			finalSeparator: "" // not used
		};
	} else if (this.style === "full") {
		this.parts = {
			years	: new enyo.g11n.Template(this.rb.$L({key: "yearsFormatFull", value: "1#1 year|1>##{num} years"})),
			months	: new enyo.g11n.Template(this.rb.$L({key: "monthsFormatFull", value: "1#1 month|1>##{num} months"})),
			weeks	: new enyo.g11n.Template(this.rb.$L({key: "weeksFormatFull", value: "1#1 week|1>##{num} weeks"})),
			days	: new enyo.g11n.Template(this.rb.$L({key: "daysFormatFull", value: "1#1 day|1>##{num} days"})),
			hours	: new enyo.g11n.Template(this.rb.$L({key: "hoursFormatFull", value: "0#|1#1 hour|1>##{num} hours"})),
			minutes	: new enyo.g11n.Template(this.rb.$L({key: "minutesFormatFull", value: "0#|1#1 minute|1>##{num} minutes"})),
			seconds	: new enyo.g11n.Template(this.rb.$L({key: "secondsFormatFull", value: "0#|1#1 second|1>##{num} seconds"})),
			separator: this.rb.$L({key: "separatorFull", value: ", "}),
			dateTimeSeparator: this.rb.$L({key: "dateTimeSeparatorFull", value: ", "}),
			longTimeFormat: "", // not used
			shortTimeFormat: "", // not used
			finalSeparator: this.rb.$L({key: "finalSeparatorFull", value: " and "})
		};
	}

	this.dateParts = ["years", "months", "weeks", "days"];
	this.timeParts = ["hours", "minutes", "seconds"];
};

//* @public
/**
Format a duration (time interval) according to the format set up in the 
constructor of this formatter instance.

* duration (Object): a javascript object containing fields to format as a string.

The duration object can contain any or all of these properties:

* years
* months
* weeks
* days
* hours
* minutes
* seconds

Each property should have an integer value, or should be left out completely.

If any property is left out of the duration object or has the value of 0, it will not be 
included in the formatted string output. The only exceptions are 0 minutes or 0 seconds 
in the short and medium formats. In those cases, double zeros are included to make the 
time correct.

Example: 14 hours even would be formatted in US English as

* short: 14:00:00
* medium: 14:00:00
* long: 14 hr
* full: 14 hours

If any of the properties contain a number that is too big for the field, this formatter
will NOT recalculate. It is up to the caller to make sure the elements are in the 
desired range. This formatter will also not truncate any propeties to approximate a time
interval. If an approximate time interval is desired, it is up to the caller to leave
off fields in the duration parameter.

This also means it is possible to format a duration with a relatively large number in 
any property without it being "wrapped" down to the normal range for that property when
formatted as a time of day or as a normal day of the year. 

Example: A process that took 174 hours and 23 seconds to complete would be formatted as

* short: 174:00:23
* medium: 174:00:23
* long: 174 hr 23 sec
* full: 174 hours and 23 seconds

The 174 hours is NOT brought down to the the normal daily range for hours of 0-24.

Returns a string with the date formatted according to the style and locale set up for 
this formatter instance. If the duration parameter is empty or undefined, an empty 
string is returned.
*/
enyo.g11n.DurationFmt.prototype.format = function(duration) {
	var dates = [],
		times = [],
		total,
		i,
		num,
		numStr;
	
	if (!duration || enyo.g11n.Char._objectIsEmpty(duration)) {
		return "";
	}
	
	for (i = 0; i < this.dateParts.length; i++) {
		// The unit's period should be set, but if not reset to zero.
		num = duration[this.dateParts[i]] || 0;
		if (num > 0) {
			numStr = this.parts[this.dateParts[i]].formatChoice(num, {num: num});
			if (numStr && numStr.length > 0) {
				if (dates.length > 0) {
					dates.push(this.parts.separator);
				}
				dates.push(numStr);
			}
		}
	}
	
	if (this.style === 'long' || this.style === 'full') {
		for (i = 0; i < this.timeParts.length; i++) {
			num = duration[this.timeParts[i]] || 0;
			if (num > 0) {
				numStr = this.parts[this.timeParts[i]].formatChoice(num, {num: num});
				if (numStr && numStr.length > 0) {
					if (times.length > 0) {
						times.push(this.parts.separator);
					}
					times.push(numStr);
				}
			}
		}
	} else {
		// short and medium time formats are a little special because you have to format parts (min, sec) that may 
		// be missing from the duration object
		var params = {},
			template = duration.hours ? this.parts.longTimeFormat : this.parts.shortTimeFormat; 
		
		for (i = 0; i < this.timeParts.length; i++) {
			num = duration[this.timeParts[i]] || 0;
			if (num < 10) {
				switch (this.timeParts[i]) {
				case 'minutes':
					if (duration.hours) {
						num = "0" + num;
					}
					break;
				case 'seconds':
					num = "0" + num;
					break;
				case 'hours':
					break;
				}
			}
			numStr = this.parts[this.timeParts[i]].formatChoice(num, {num: num});
			if (numStr && numStr.length > 0) {
				params[this.timeParts[i]] = numStr;
			}
		}
		times.push(template.evaluate(params));
	}

	// put it all together now
	total = dates;
	if (total.length > 0 && times.length > 0) {
		total.push(this.parts.dateTimeSeparator); // date separator separators the date and time parts of the string
	}
	for (i = 0; i < times.length; i++) {
		total.push(times[i]);
	}
	
	// if we are in the full style, then the last separator is a special one. (in English it's " and ")
	if (total.length > 2 && this.style === 'full') {
		total[total.length-2] = this.parts.finalSeparator;
	}
	
	return total.join("") || "";
};
