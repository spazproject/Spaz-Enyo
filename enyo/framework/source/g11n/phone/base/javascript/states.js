/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*$
 * @name states.js
 * @fileOverview This file has the implementation of the StatesData object which gives information about the states in a finite state machine used to 
 * parse the phone numbers
 * 
 * Copyright (c) 2010-2011 HP, Inc.  All rights reserved.
 *
 */

/*globals console G11n Locale PhoneUtils enyo*/

//* @protected
/**
Return info about the FSM states for parsing numbers

It is up to the callers to release the json files.
*/
enyo.g11n.StatesData = function(params) {
	this.root = (params && params.root) || enyo.g11n.Utils._getEnyoRoot("../");
	this.path = (params && params.path) || "";
	this.locale = (params && params.locale) || enyo.g11n.phoneLocale();
	
	this.data = enyo.g11n.Utils.getNonLocaleFile({
		root: this.root,
		path: this.path + "/" + this.locale.region + ".json",
		locale: this.locale
	});
	
	if (!this.data) {
		this.data = enyo.g11n.Utils.getNonLocaleFile({
			root: this.root,
			path: this.path + "/unknown.json",
			locale: new enyo.g11n.Locale("unknown_unknown")
		});
	}
	
	return this;
};

enyo.g11n.StatesData.prototype = {
	get: function (state) {
		return (this.data && this.data[state]) || undefined;
	}
};
