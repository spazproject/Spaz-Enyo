/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
 * @name timezone.js
 * @fileOverview This file handles the implementation of the Timezone formatter object
 * 
 * Copyright 2011 HP, Inc.  All rights reserved.
 */

/*globals console G11n enyo */

//* @protected
enyo.g11n._TZ = enyo.g11n._TZ || {};

//* @public
/**
Create a new timezone format instance 

The params argument is a string that is a timezone id specifier. The specifier has the following format:

Zone name (see man tzfile), daylight savings supported, offset from UTC.

*/
enyo.g11n.TzFmt = function (params) {
	// get the system timezone info and set the current timezone name
	// will use PalmSystem.TZ when it becomes available in Dartfish
	this.setTZ();
	
	// if timezone is passed in as a parameter, we try to honor the specified timezone
	if ((params !== undefined) && (params.TZ !== undefined)) {
//		console.log("==============> call with TZ " + params.TZ + "<==============");
		this.setCurrentTimeZone(params.TZ);
	}
	
	enyo.g11n.Utils.releaseAllJsonFiles();
	return this;
};

enyo.g11n.TzFmt.prototype = {
	//* @public
	/**
	 Return the time zone as a string.
	*/
	toString: function () {
    	if (this.TZ !== undefined) {
    		return this.TZ;
    	} else {
    		return this._TZ;
    	}
	},

	/**
	 This set of functions caches the current timezone name (e.g. "PST").
	 The subscribe: false (default) since timezone most likely does not
	 change frequently. 
	 
	 This is for use by DateFmt() in globalization framework,
	 which needs the current timezone for the 'zzz' specifier.
	 */
	setTZ: function() {
		var d = new Date().toString();
		var s = d.indexOf("(");
		var e = d.indexOf(")");
		var z = d.slice(s + 1, e);
		if (z !== undefined) {
			this.setCurrentTimeZone(z);
		} else {
			this.setDefaultTimeZone();
		}
//		console.log("**********> enyo.g11n.date: (setTZ) this.TZ=" + this.TZ);
	},
	
	/**
	 Returns the current timezone of the device. The timezone is updated whenever the user
	 changes it, if set manually, or by the network, if set automatic.
	 Returns the name of timezone. 
	 */
	getCurrentTimeZone: function() {
		if (this.TZ !== undefined) {
			return this.TZ;
		} else if (this._TZ !== undefined) {
			return this._TZ;
		} else {
			return ("unknown");
		}
	},
	
	//* @protected
	// _TZ should always be set (default is PST)
	// TZ is the real timezone info gotten from the system
	setCurrentTimeZone: function(timeZone) {
		this._TZ = timeZone;
		this.TZ = timeZone;
	},
	
	setDefaultTimeZone: function () {
		// console.log("enyo.g11n.date.timezone: Setting up default timezone to PST.");
        var m = (new Date()).toString().match(/\(([A-Z]+)\)/);
        this._TZ = (m && m[1]) || 'PST';
	}
};