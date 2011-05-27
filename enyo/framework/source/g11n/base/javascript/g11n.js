/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
 * @name g11n.js
 * @fileOverview g11n namespace
 * 
 * Copyright 2010 HP, Inc.  All rights reserved.
 */

/*globals G11n:true console window root PalmSystem MojoLoader enyo */

//* @protected

if(!this.enyo){
	this.enyo = {};
	var empty = {};
	enyo.mixin = function(target, source) {
		target = target || {};
		if (source) {
			var name, s;
			for (name in source) {
				// the "empty" conditional avoids copying properties in "source"
				// inherited from Object.prototype.  For example, if target has a custom
				// toString() method, don't overwrite it with the toString() method
				// that source inherited from Object.prototype
				s = source[name];
				if (empty[name] !== s) {
					target[name] = s;
				}
			}
		}
		return target; 
	};
}

enyo.g11n = function () {
};

enyo.g11n._init = function _init(){
	if (!enyo.g11n._initialized){
		
		if  (typeof(window) !== 'undefined' && typeof(PalmSystem) === 'undefined'){
			enyo.g11n._platform = "browser";
			enyo.g11n._enyoAvailable = true;
		} else if (typeof(window) !== 'undefined' && typeof(PalmSystem) !== 'undefined'){
			enyo.g11n._platform = "device";
			enyo.g11n._enyoAvailable = true;
		} else{
			enyo.g11n._platform = "node";
			enyo.g11n._enyoAvailable = false;
		}
		
		if (enyo.g11n._platform === "device") {
			// we are running in the context of an application
			enyo.g11n._locale = new enyo.g11n.Locale(PalmSystem.locale);
			// add the underscore because the system prefs only have the region part of the locale, not the language
			enyo.g11n._formatLocale = new enyo.g11n.Locale(enyo.g11n._locale.getLanguage() + "_" + PalmSystem.localeRegion);
			enyo.g11n._phoneLocale = new enyo.g11n.Locale(enyo.g11n._locale.getLanguage() + "_" + PalmSystem.phoneRegion) || enyo.g11n._formatLocale;
		} else if (enyo.g11n._platform === "node") {
			// we are running in the context of a mojo service
			var MojoService = MojoLoader.require({"name":"mojoservice", "version":"1.0"}).mojoservice;
			if (MojoService.locale === undefined || MojoService.region === undefined) {
				console.warn('Locale._init: MojoService returned no locale. Defaulting to en_us. Do you have the "globalized":true flag set in your services.json?');
			} else {
				enyo.g11n._locale = new enyo.g11n.Locale(MojoService.locale);
				enyo.g11n._formatLocale = new enyo.g11n.Locale(enyo.g11n._locale.getLanguage() + "_" + MojoService.region);
				enyo.g11n._phoneRegion = new enyo.g11n.Locale(enyo.g11n._locale.getLanguage() + "_" + MojoService.phoneRegion) || enyo.g11n._formatLocale;
			}
		} else {
			/* device === 'browser' */
			/* Old browsers might not have a navigator object */
			if (navigator) {
				/* Everyone uses navigator.language, except for IE which uses navigator.userLanguage. Of course they do. */
				var locale = (navigator.language || navigator.userLanguage).replace(/-/g,'_').toLowerCase();
				enyo.g11n._locale = new enyo.g11n.Locale(locale);
				enyo.g11n._formatLocale = enyo.g11n._locale;
				enyo.g11n._phoneLocale = enyo.g11n._locale;
			}
		}

		if (enyo.g11n._locale === undefined) {
			// we don't know where we're running, so just use US English as the default -- should not happen
			console.warn("enyo.g11n._init: could not find current locale, so using default of en_us.");
			enyo.g11n._locale = new enyo.g11n.Locale("en_us");
		}
		
		if (enyo.g11n._formatLocale === undefined) {
			console.warn("enyo.g11n._init: could not find current formats locale, so using default of us.");
			enyo.g11n._formatLocale = new enyo.g11n.Locale("en_us");
		} 

		if (enyo.g11n._phoneLocale === undefined) {
			console.warn("enyo.g11n._init: could not find current phone locale, so defaulting to the same thing as the formats locale.");
			enyo.g11n._phoneLocale = enyo.g11n._formatLocale;
		}
		
		if (enyo.g11n._sourceLocale === undefined){
			enyo.g11n._sourceLocale = new enyo.g11n.Locale("en_us");
		}
		
		enyo.g11n._initialized = true;
	}
	
};

enyo.g11n.getPlatform = function getPlatform(){
	if (!enyo.g11n._platform){
		enyo.g11n._init();
	}
	return enyo.g11n._platform;
};

enyo.g11n.isEnyoAvailable = function isEnyoAvailable(){
	if (!enyo.g11n._enyoAvailable){
		enyo.g11n._init();
	}
	return enyo.g11n._enyoAvailable;
};

//* @public
/**
Return a enyo.g11n.Locale instance containing the current device locale for the user interface. 
*/
enyo.g11n.currentLocale = function currentLocale(){
	if (!enyo.g11n._locale){
		enyo.g11n._init();
	}
	return enyo.g11n._locale;
};

/**
Return an enyo.g11n.Locale instance containing the current device locale used while formatting the following items:

* dates and times
* numbers, percentage, and currency
* names
* addresses

*/
enyo.g11n.formatLocale = function formatLocale(){
	if (!enyo.g11n._formatLocale){
		enyo.g11n._init();
	}
	return enyo.g11n._formatLocale;
};

/**
Return an enyo.g11n.Locale instance containing the current device phone locale. The phone locale acts like a "home" locale
for parsing and formatting phone numbers that do not have an explicit country code in them. The phone number of this device 
should be issued by a carrier in this locale. 
*/
enyo.g11n.phoneLocale = function phoneLocale(){
	if (!enyo.g11n._phoneLocale){
		enyo.g11n._init();
	}
	return enyo.g11n._phoneLocale;
};

//* @protected
enyo.g11n.sourceLocale = function sourceLocale(){
	if (!enyo.g11n._sourceLocale){
		enyo.g11n._init();
	}
	return enyo.g11n._sourceLocale;
};

//* @public
/**
Set the framework's idea of the various current locales
 
The params object can contain one or more of the following properties:
  
* *uiLocale* - locale specifier for the UI locale
* *formatLocale* - locale specifier for the format locale
* *phoneLocale* - locale specifier for the phone locale
 
Each property should be set to a string that is the specifier for that locale.
*/
enyo.g11n.setLocale = function setLocale(params) {
	if (params) {
		enyo.g11n._init();
		if (params.uiLocale) {
			enyo.g11n._locale = new enyo.g11n.Locale(params.uiLocale);
		}
		if (params.formatLocale) {
			enyo.g11n._formatLocale = new enyo.g11n.Locale(params.formatLocale);
		}
		if (params.phoneLocale) {
			enyo.g11n._phoneLocale = new enyo.g11n.Locale(params.phoneLocale);
		}
		if (params.sourceLocale) {
			enyo.g11n._sourceLocale = new enyo.g11n.Locale(params.sourceLocale);
		}
		if (enyo.g11n._enyoAvailable){
			enyo.reloadG11nResources();
		}
		
	}
};
