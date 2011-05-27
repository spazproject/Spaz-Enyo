/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
 * @name datetime.js
 * @fileOverview date and time formatting routines
 * 
 * Copyright 2010 HP, Inc.  All rights reserved.
 */

/*globals console G11n enyo*/

//* @public
/**
Create a new date formatter object.

* params (String/Object): parameters that control the output format

If the params is passed as a string, then the string should specify the custom date
format to use. If the params are specified as an object, they may contain the 
following properties:

* locale: locale to use to format the date. If not specified, the locale used
will be the current locale of the device.
* date: format a date using the locale's standard format, and specify the length 
of the format to use. Valid values are 'short', 'medium', 'long', and 'full', or
specify a custom date format string directly. Default is "long" if this property 
is not specified.
* time: format a time using the locale's standard format, and specify the length 
of the format to use. Valid values are 'short', 'medium', 'long', and 'full', or
specify a custom time format string directly. Default is "long" if this property is not specified.
* format: format as a date and time string together, specifying the length of 
the format. Valid values are 'short', 'medium', 'long', and 'full', or specify a
custom date/time format string directly.
* dateComponents: format a date with only certain components in it using the 
locale's standard format for those components. Valid values are 'DM', 'MY', and 'DMY',
which mean "date and month", "month and year", and "date, month, and year" 
respectively. This can be combined with the date or format properties to specify the length of 
those components. Default if this property is not specified is 'DMY'. 
* timeComponents: format a time with certain additional components in it using the 
locale's standard format for those components. Valid values are 'A', 'Z', and 'AZ',
which mean "am/pm", "time zone", and "am/pm and time zone" respectively. The additional
components will appear before or after the time, as required by the locale. This can 
be combined with the time or format properties to specify the length of those components. Default 
if this property is not specified is no additional components.
* twelveHourFormat: if passed as true, use a 12-hour clock when formatting times.
* weekday: if passed as true, return the date formatted with the day of the week included
in the date format as well
* TZ: use the given time zone. If not specified, the current device time zone is used.
Otherwise, if false, use a 24-hour clock. 

The codes to use when specifying custom date or time formats are the following:

* yy: two-digit year
* yyyy: four-digit year
* MMMM: name of a the month spelled out in long format (eg. "July" or "August")
* MMM: name of the month in abbreviated form (eg. "Jul" or "Aug")
* MM: zero-padded 2-digit month
* M: 1- or 2-digit month, not padded
* dd: zero-padded 2-digit day of the month
* d: 1- or 2-digit day of the month, not padded
* zzz: time zone name
* a: am/pm notation for 12-hour formats
* KK: zero-padded hour of the day in the 12-hour clock, in the range 00 to 11
* K: hour of the day in the 12-hour clock, not padded, in the range 0 to 11
* hh: zero-padded hour of the day in the 12-hour clock, in the range 01 to 12
* h: hour of the day in the 12-hour clock, not padded, in the range 1 to 12
* HH: zero-padded hour of the day in the 24-hour clock, in the range 00 to 23
* H: hour of the day in the 24-hour clock, not padded, in the range 0 to 23
* kk: zero-padded hour of the day in the 24-hour clock, in the range 01 to 24
* k: hour of the day in the 24-hour clock, not padded, in the range 1 to 24
* EEEE: day of the week, spelled out fully (eg. Wednesday)
* EEE: day of the week, in 3-letter abbreviations (eg. Wed)
* EE: day of the week, in 2-letter abbreviations (eg. We)
* E: day of the week, in 1-letter abbreviations (eg. W)
* mm: zero-padded minute of the hour
* ss: zero-padded second of the minute

Please note that the current formatter only supports formatting dates in the Gregorian calendar.

Returns a date formatter object that formats dates according to the given parameters.
*/
enyo.g11n.DateFmt = function(params){
	var locale, dateFormat, timeFormat, finalFormat, self;
	self = this;
	
	self._normalizedComponents = {
			date: {
				'dm': 'DM',
				'md': 'DM',
				'my': 'MY',
				'ym': 'MY',
				'd':  'D',
				'dmy': '',
				'dym': '',
				'mdy': '',
				'myd': '',
				'ydm': '',
				'ymd': ''
			},
			time: {
				'az': 'AZ',
				'za': 'AZ',
				'a': 'A',
				'z': 'Z',
				'': ''
			},
			timeLength: {
				'short': 'small',
				'medium': 'small',
				'long': 'big',
				'full': 'big'
			}
		};

	//* @protected
	self._normalizeDateTimeFormatComponents = function(options) {
		var dateComponents = options.dateComponents;
		var timeComponents = options.timeComponents;
		var dateComp, timeComp, time;
		var timeLength = options.time;


		if (options.date && dateComponents) {
			
			dateComp = self._normalizedComponents.date[dateComponents];
			if (dateComp === undefined) {
				console.log("date component error: '" + dateComponents + "'");
				dateComp = '';
			}
		}

		if (timeLength && timeComponents !== undefined) {
			
			time = self._normalizedComponents.timeLength[timeLength];
			if (time === undefined) {
				console.log("time format error: " + timeLength);
				time = 'small';
			}
			timeComp = self._normalizedComponents.time[timeComponents];
			if (timeComp === undefined) {
				console.log("time component error: '" + timeComponents + "'");
			}
		}
		options.dateComponents = dateComp;
		options.timeComponents = timeComp;
		return options;
	};
	
	//* @protected
	self._finalDateTimeFormat = function(dateFormat, timeFormat, options) {
	
		var dateTimeFormat = self.dateTimeFormatHash.dateTimeFormat || self.defaultFormats.dateTimeFormat;
	    
		if (dateFormat && timeFormat) {
			return self._buildDateTimeFormat(dateTimeFormat, 'dateTime', {'TIME':timeFormat, 'DATE':dateFormat});
		} else {
			return timeFormat || dateFormat || "M/d/yy h:mm a";
		}
	};

	//* @protected
	self._buildDateTimeFormat = function(format, parserChunk, subFormats) {
		var i, tokenLen;
		var acc = [];
		var tokenized = self._getTokenizedFormat(format, parserChunk);
	
		var formatChunk;
		for (i = 0, tokenLen = tokenized.length; i < tokenLen && tokenized[i] !== undefined; ++i) {
			formatChunk = subFormats[tokenized[i]];
			if (formatChunk) {
				acc.push(formatChunk);
			} else {
				acc.push(tokenized[i]);
			}
		}
		return acc.join("");
	};
	
	//* @protected
	self._getDateFormat = function(dateLen, options) {
		var dateFormat = self._formatFetch(dateLen, options.dateComponents, "Date");
		if (dateLen !== 'full' && options.weekday) {	// The 'full' format already includes the weekday
			var weekdayFormat = self._formatFetch(options.weekday, '', 'Weekday');
			
			dateFormat = self._buildDateTimeFormat(
				self.dateTimeFormatHash.weekDateFormat || self.defaultFormats.weekDateFormat,
				'weekDate', {
					'WEEK': weekdayFormat,
					'DATE': dateFormat
				});
		}
		
		return dateFormat;
	};

	//* @protected
	self._getTimeFormat = function(dateLen, options) {
		var timeFormat = self._formatFetch(dateLen, '', self.twelveHourFormat ? "Time12" : "Time24");

		// We check against undefined elsewhere because the empty string is valid
		// information there; here, if there are no time components, we can skip
		// _buildDateTimeFormat(); _formatFetch() gives us all we need.
		if (options.timeComponents) {
			var timeParserChunk = 'time' + options.timeComponents;
			var timePartsFormat = timeParserChunk + 'Format';
			return self._buildDateTimeFormat(
				self.dateTimeFormatHash[timePartsFormat] || self.defaultFormats[timePartsFormat], 
				timeParserChunk, {
					'TIME': timeFormat,
					'AM': 'a',
					'ZONE': 'zzz'
				});
		}
		return timeFormat;
	};
	
	//* @protected
	self.ParserChunks = {
		full: "('[^']+'|y{2,4}|M{1,4}|d{1,2}|z{1,3}|a|h{1,2}|H{1,2}|k{1,2}|K{1,2}|E{1,4}|m{1,2}|s{1,2}|[^A-Za-z']+)?",
		dateTime: "(DATE|TIME|[^A-Za-z]+|'[^']+')?",
		weekDate: "(DATE|WEEK|[^A-Za-z]+|'[^']+')?",
		timeA: "(TIME|AM|[^A-Za-z]+|'[^']+')?",
		timeZ: "(TIME|ZONE|[^A-Za-z]+|'[^']+')?",
		timeAZ: "(TIME|AM|ZONE|[^A-Za-z]+|'[^']+')?"
	};

	//* @protected
	self._getTokenizedFormat = function(format, parserChunk) {
		var regexFragment = (parserChunk && self.ParserChunks[parserChunk]) || self.ParserChunks.full;
		var formatLength = format.length;
		var formatArray = [], tempStr, tempLength;
		var testRegex = new RegExp(regexFragment,"g");
		
		while(formatLength > 0){
			tempStr = (testRegex.exec(format))[0];
			tempLength = tempStr.length;
			if (tempLength === 0){
				return [];	//bad format string
			}
			formatArray.push(tempStr);
			formatLength -= tempLength;
		}
		return formatArray;
	};
	
	//* @protected
	self._formatFetch = function(formatLen, formatComponents, type, options) {
		switch (formatLen) {
			case 'short':
			case 'medium':
			case 'long':
			case 'full':
			case 'small':
			case 'big':
			case 'default':
				return self.dateTimeFormatHash[formatLen + (formatComponents || '') + type];
			default:
				//assume format was passed in if it's not a type
				return formatLen;
		}
	};
	
	//* @protected
	self._dayOffset = function(now, date) {
		var diff;
		date = self._roundToMidnight(date);
		now = self._roundToMidnight(now);
		diff = (now.getTime() - date.getTime()) / 864e5;

		return diff;
	};
	
	//* @protected
	self._roundToMidnight = function(date) {
		var numMs = date.getTime();
		var rounded = new Date();
		rounded.setTime(numMs);
		rounded.setHours(0);
		rounded.setMinutes(0);
		rounded.setSeconds(0);
		rounded.setMilliseconds(0);
		return rounded;
	};

    self.inputParams = params;
	//locale = params.locale;
	/*
	var tokLoc = locale.split("_");
	language = tokLoc[0];
	region = tokLoc[1];
	*/

	if (typeof(params) === 'undefined' || !params.locale) {
		locale = enyo.g11n.formatLocale();
	} else if (typeof(params.locale) === 'string') {
		locale = new enyo.g11n.Locale(params.locale);
	} else {
		locale = params.locale;
	}
	if (!locale.language) {
		locale.useDefaultLang();
	}
	this.locale = locale;
	
	if (typeof(params) === "string"){
		self.formatType = params;
	}else if (typeof(params) === 'undefined'){
		params = {"format": "short"};	
		self.formatType = params.format;
	}else {
		self.formatType = params.format;
	}
	
	if (!self.formatType && !params.time && !params.date) {
		if (!params) {
			params = {"format": 'short'};
		} else {
			params.format = 'short';
		}
		self.formatType = 'short';
	}
	
	self.dateTimeHash = enyo.g11n.Utils.getJsonFile({
		root: enyo.g11n.Utils._getEnyoRoot(),
		path: "base/datetime_data",
		locale: locale,
		type: "language"
	});
	
	if (!self.dateTimeHash){
		self.dateTimeHash = enyo.g11n.Utils.getJsonFile({
			root: enyo.g11n.Utils._getEnyoRoot(),
			path: "base/datetime_data",
			locale: new enyo.g11n.Locale("en_us")
		});
	}

	self.dateTimeFormatHash = enyo.g11n.Utils.getJsonFile({
		root: enyo.g11n.Utils._getEnyoRoot(),
		path: "base/formats",
		locale: locale,
		type: "region"
	});
	
	self.rb = new enyo.g11n.Resources({
		root: enyo.g11n.Utils._getEnyoRoot() + "/base",
		locale: locale
	});
	
	if(typeof(params) === 'undefined' || typeof(params.twelveHourFormat) === 'undefined'){
		if(typeof(PalmSystem) !== 'undefined'){
			self.twelveHourFormat = (PalmSystem.timeFormat === "HH12");
		}else{
			self.twelveHourFormat = self.dateTimeFormatHash.is12HourDefault;
		}
	}else{
		self.twelveHourFormat = params.twelveHourFormat;
	}

	if (self.formatType) {
		switch (self.formatType) {
		case "short":
		case "medium":
		case "long":
		case "full":
		case "default":
			self.partsLength = self.formatType;
			finalFormat = self._finalDateTimeFormat(self._getDateFormat(self.formatType, params),
													self._getTimeFormat(self.formatType, params),
													params);
			break;
		default:
			finalFormat = self.formatType;
		}
	} else {
		params = self._normalizeDateTimeFormatComponents(params);
		if (params.time) {
			timeFormat = self._getTimeFormat(params.time, params);
			self.partsLength = params.time;
		}
		if (params.date) {
			dateFormat = self._getDateFormat(params.date, params);
			self.partsLength = params.date;
		}
		finalFormat = self._finalDateTimeFormat(dateFormat, timeFormat, params);
	}
	self.tokenized = self._getTokenizedFormat(finalFormat);
	if (!self.partsLength) {
		self.partsLength = 'full'; 
	}
};

//* @public
/**
Return the format string that this formatter instance uses to format dates. 
*/
enyo.g11n.DateFmt.prototype.toString = function() {
	return this.tokenized.join("");
};

//* @public
/**
Return true if the current formatter uses a 12-hour clock to format times.
*/
enyo.g11n.DateFmt.prototype.isAmPm = function(){
	return this.twelveHourFormat;
};

//* @public
/**
Return true if the locale of this formatter uses a 12-hour clock to format times.
*/
enyo.g11n.DateFmt.prototype.isAmPmDefault = function(){
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
enyo.g11n.DateFmt.prototype.getFirstDayOfWeek = function(){
	return this.dateTimeHash.firstDayOfWeek;
};

//* @protected
enyo.g11n.DateFmt.prototype._format = function(date, parsedArray) {
    //var startTime = new Date();
	var self = this, hr, acc = [], dateTimeVerbosity, dateTimeType, dateTimeIdx, tz, i, length, dtHash, tokenized;
	dtHash = self.dateTimeHash;
	
	for(i=0, length = parsedArray.length;  i < length && parsedArray[i] !== undefined; i++) {
		switch(parsedArray[i]) {
			case 'yy':
				dateTimeVerbosity = '';
				acc.push((date.getFullYear() + "").substring(2));
				break;
			case 'yyyy':
				dateTimeVerbosity = '';
				acc.push(date.getFullYear());
				break;
			case 'MMMM':
				dateTimeVerbosity = 'long';
				dateTimeType = 'month';
				dateTimeIdx = date.getMonth();
				break;
			case 'MMM':
				dateTimeVerbosity = 'medium';
				dateTimeType = 'month';
				dateTimeIdx = date.getMonth();
				break;
			case 'MM':
				dateTimeVerbosity = 'short';
				dateTimeType = 'month';
				dateTimeIdx = date.getMonth();
				break;
			case 'M':
				dateTimeVerbosity = 'single';
				dateTimeType = 'month';
				dateTimeIdx = date.getMonth();
				break;
			case 'dd':
				dateTimeVerbosity = 'short';
				dateTimeType = 'date';
				dateTimeIdx = date.getDate()-1;
				break;
			case 'd':
				dateTimeVerbosity = 'single';
				dateTimeType = 'date';
				dateTimeIdx = date.getDate()-1;
				break;
				//XXX FIXME
			case 'zzz':
				dateTimeVerbosity = '';
				
				if (typeof(self.timezoneFmt) === 'undefined'){
					if (typeof(self.inputParams) === 'undefined' || 
					typeof(self.inputParams.TZ) === 'undefined'){
						self.timezoneFmt = new enyo.g11n.TzFmt();
					}else{
						self.timezoneFmt = new enyo.g11n.TzFmt(self.inputParams);
					}
				}
				tz = self.timezoneFmt.getCurrentTimeZone();
				acc.push(tz);
				break;
			
			case 'a':
				dateTimeVerbosity = '';
				if(date.getHours() > 11) {
					acc.push(dtHash.pm);
				} else {
					acc.push(dtHash.am);
				}
				break;
			case 'K':
				dateTimeVerbosity = '';
				acc.push(date.getHours() % 12);
				break;
			case 'KK':
				dateTimeVerbosity = '';
		
				hr = date.getHours() % 12;
				//fix ugliness?
				acc.push((hr < 10) ? "0"+(""+hr) : hr);
				break;
			case 'h':
				dateTimeVerbosity = '';
				hr = (date.getHours() % 12);
				acc.push(hr === 0 ? 12 : hr) ;
				break;
			case 'hh':
				dateTimeVerbosity = '';
				hr = (date.getHours() % 12);
				// fix ugliness?
				acc.push(hr === 0 ? 12 : (hr < 10 ? "0" + (""+hr) : hr )) ;
				break;
			case 'H':
				dateTimeVerbosity = '';
				acc.push(date.getHours());
				break;
			case 'HH':
				dateTimeVerbosity = '';
				hr = date.getHours();
				//fix ugliness?
				acc.push(hr < 10 ? "0" + (""+hr) : hr);
				break;
			case 'k':
				dateTimeVerbosity = '';
				hr = (date.getHours() % 12);
				acc.push(hr === 0 ? 12 : hr) ;
				break;
			case 'kk':
				dateTimeVerbosity = '';
				hr = (date.getHours() % 12);
				//fix ugliness?
				acc.push(hr === 0 ? 12 : (hr < 10 ? "0"+(""+hr) : hr)) ;
				break;

			case 'EEEE':
				dateTimeVerbosity = 'long';
				dateTimeType = 'day';
				dateTimeIdx = date.getDay();
				break;
			case 'EEE':
				dateTimeVerbosity = 'medium';
				dateTimeType = 'day';
				dateTimeIdx = date.getDay();
				break;
			case 'EE':
				dateTimeVerbosity = 'short';
				dateTimeType = 'day';
				dateTimeIdx = date.getDay();
				break;
			case 'E':
				dateTimeVerbosity = 'single';
				dateTimeType = 'day';
				dateTimeIdx = date.getDay();
				break;
			case 'mm':
			case 'm':
				//no single minute?
				dateTimeVerbosity = '';
				var mins = date.getMinutes();
				acc.push(mins < 10 ? "0" + (""+mins) : mins);
				break;
			case 'ss':
			case 's':
				//no single second?
				dateTimeVerbosity = '';
				var secs = date.getSeconds();
				acc.push(secs < 10 ? "0" + (""+secs) : secs);
				break;
			default:
				tokenized = /'([A-Za-z]+)'/.exec(parsedArray[i]);
				dateTimeVerbosity = '';
				if(tokenized) {
					acc.push(tokenized[1]);
				} else {
					acc.push(parsedArray[i]);
				}
		}

		if(dateTimeVerbosity) {
			acc.push(dtHash[dateTimeVerbosity][dateTimeType][dateTimeIdx]);
		}

	}
	//var endTime = new Date();
	//console.log("Time elapsed: " + (endTime.getTime() - startTime.getTime()));
	return acc.join("");
};

//* @public
/**
format(date): Format a date according to the format set up in the constructor of this formatter instance.
* date (Object): a standard javascript date instance to format as a string
 
Returns a string with the date formatted according to the format set up for this formatter instance
*/
enyo.g11n.DateFmt.prototype.format = function(date) {
    //var startTime = new Date();
	var self = this;
	if (typeof(date) !== "object" || self.tokenized === null){
		console.warn("DateFmt.format: no date to format or no format loaded");
		return undefined;
	}

	return this._format(date, self.tokenized);
};

//* @public
/**
Format a date as relative to another date.

* date (Object): the date/time object to format
* options (Object): specify options to the formatting

This method formats a date as being relative to another date. If the two dates
are close in time, the time distance between them is given rather than a 
formatted date. If the two dates are not close, then the date is formatted
as per the format set up for this formatter instance.

The options object can have the following properties:

* referenceDate: give the reference date for which the date to be formatted is
relative
* verbosity: if true, then format dates between a week old and a year old as
relative as well. Otherwise these are formatted regularly according to the 
format for the current formatter instance
 
The relative dates/times are as follows:

* today
* yesterday
* tomorrow
* for dates within the last week, give the day name
* for dates within the last month, give the number of weeks ago when verbosity=true, 
or the formatted date otherwise
* for dates within the last year, give the number of months ago when verbosity=true, 
or the formatted date otherwise
* for all other dates, format the date as per the format of the current formatter instance

When strings are returned as relative, the text in them is already localized to the current locale.

Returns a string with the relative date.
*/
enyo.g11n.DateFmt.prototype.formatRelativeDate = function(date, options) {
	var refDate, verbosity, template, offset, self = this;
	
	if (typeof(date) !== 'object'){
		return undefined;
	}
	
	if (typeof(options) === 'undefined'){
		verbosity = false;
		refDate = new Date();
	}else{
		if (typeof(options.referenceDate) !== 'undefined'){
			refDate = options.referenceDate;
		}else{
			refDate = new Date();
		}
		if (typeof(options.verbosity) !== 'undefined'){
			verbosity = options.verbosity;
		}else{
			verbosity = false;
		}
	}

	offset = self._dayOffset(refDate, date);
	switch (offset) {
		case 0:
			return self.dateTimeHash.relative.today;
		case 1:
			return self.dateTimeHash.relative.yesterday;
		case -1:
			return self.dateTimeHash.relative.tomorrow;
		default:
			if (offset < 7){
				return self.dateTimeHash.long.day[date.getDay()];
			}else if (offset < 30){
				if(verbosity){
					template = new enyo.g11n.Template(self.dateTimeHash.relative.thisMonth);
					var weeks = Math.floor(offset / 7);
					return template.formatChoice(weeks,{num: weeks});
				}else{
					return self.format(date);
				}
			}else if (offset < 365){
				if (verbosity){
					template = new enyo.g11n.Template(self.dateTimeHash.relative.thisYear);
					var months = Math.floor(offset / 30);
					return template.formatChoice(months, {num: months});
				}else{
					return self.format(date);
				}
				
			}
	}
};

/**
Format a pair of dates as a date range.

* dateStart (Object): the date at the start of the range
* dateEnd (Object): the date at the end of the range

This method formats a pair of dates as a date/time range from start to end using the settings of
the formatter object to guide the formatting. 

The format of the output string is determined as follows:

* If the dates are on the same calendar day, the format is a time range of the form 
(starttime_to_endtime, month+date)
* If the dates are on different calendar days, but are in the same calendar month, the
format is a date range of the form (month date_to_date, year)
* If the dates are on different calendar days and different calendar months, but the 
same calendar year, the format is to a date range of (month+date to month+date, year)
* If the dates are on in different consecutive calendar years, the format
is a date range of the form (month+date+year to month+date+year)
* If the dates are further apart than 2 years, the format is a date range of the form
(year to year)

The order of the month, date, and year components in the above formats and the text of 
the separators are locale-dependent. For example, if the start date is September 2, 2011, and 
the end date is September 5, 2011, the ranges would be:

* US English: "Sept 2-5, 2011"
* British English: "2-5 Sept, 2011"
* German: "2.-5. Sept, 2011"

The length of the month abbreviations are determined by the date length with which the current 
formatter object was constructed. If the end date preceeds the start date, the dates will 
be switched so that the earlier date will become the start date. The text in the returned string 
will be localized to the locale of the formatter instance.

Returns a string with the date/time range.
*/
enyo.g11n.DateFmt.prototype.formatRange = function(dateStart, dateEnd) {
	var temp, 
		timeFmt, 
		dateFmt, 
		name, 
		year, 
		templ,
		formatLength = this.partsLength,
		dtHash = this.dateTimeHash, 
		dtfHash = this.dateTimeFormatHash;
	
	if (!dateStart && !dateEnd) {
		return "";
	} else if (!dateStart || !dateEnd) {
		return this.format(dateStart || dateEnd);
	}
	
	// make sure they are in the right order
	if (dateEnd.getTime() < dateStart.getTime()) {
		temp = dateEnd;
		dateEnd = dateStart;
		dateStart = temp;
	}
	
	if (dateStart.getYear() === dateEnd.getYear()) {
		year = (formatLength === 'short' || formatLength === 'single') ? (dateStart.getFullYear() + "").substring(2) : dateStart.getFullYear();
		
		if (dateStart.getMonth() === dateEnd.getMonth()) {
			if (dateStart.getDate() === dateEnd.getDate()) {
				// format a time range on the same day
				name = "shortTime" + (this.twelveHourFormat ? "12" : "24");
				timeFmt = this._getTokenizedFormat(dtfHash[name]); 

				name = formatLength + "Date";
				dateFmt = this._getTokenizedFormat(dtfHash[name]);
				
				templ = new enyo.g11n.Template(this.rb.$L({key: "dateRangeWithinDay", value: "#{startTime}-#{endTime}, #{date}"}));
				return templ.evaluate({
					startTime: this._format(dateStart, timeFmt),
					endTime: this._format(dateEnd, timeFmt),
					date: this._format(dateStart, dateFmt)
				});
			} else {
				name = formatLength + "DDate";
				dateFmt = this._getTokenizedFormat(dtfHash[name]);
				
				templ = new enyo.g11n.Template(this.rb.$L({key: "dateRangeWithinMonth", value: "#{month} #{startDate}-#{endDate}, #{year}"}));
				return templ.evaluate({
					month: dtHash[formatLength].month[dateStart.getMonth()],
					startDate: this._format(dateStart, dateFmt),
					endDate: this._format(dateEnd, dateFmt),
					year: year
				});
			}
		} else {
			if (formatLength === 'full') {
				// there is no full DM format
				formatLength = "long";
			} else if (formatLength === 'single') {
				// nor short
				formatLength = "short";
			}
			name = formatLength + "DMDate";
			dateFmt = this._getTokenizedFormat(dtfHash[name]);
			
			templ = new enyo.g11n.Template(this.rb.$L({key: "dateRangeWithinYear", value: "#{start} - #{end}, #{year}"}));
			return templ.evaluate({
				start: this._format(dateStart, dateFmt),
				end: this._format(dateEnd, dateFmt),
				year: year
			});
		}
	} else if (dateEnd.getYear() - dateStart.getYear() < 2) {
		name = formatLength + "Date";
		dateFmt = this._getTokenizedFormat(dtfHash[name]);
		
		templ = new enyo.g11n.Template(this.rb.$L({key: "dateRangeWithinConsecutiveYears", value: "#{start} - #{end}"}));
		return templ.evaluate({
			start: this._format(dateStart, dateFmt),
			end: this._format(dateEnd, dateFmt)
		});
	} else {
		if (formatLength === 'full') {
			// there is no full MY format
			formatLength = "long";
		} else if (formatLength === 'single') {
			// nor short
			formatLength = "short";
		}
		name = formatLength + "MYDate";
		dateFmt = this._getTokenizedFormat(dtfHash[name]);
		
		templ = new enyo.g11n.Template(this.rb.$L({key: "dateRangeMultipleYears", value: "#{startMonthYear} - #{endMonthYear}"}));
		return templ.evaluate({
			startMonthYear: this._format(dateStart, dateFmt),
			endMonthYear: this._format(dateEnd, dateFmt)
		});
	}
};