/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, document, enyo, console, runningInBrowser, PersonList, MockPersonMap, crb */

enyo.kind({
	name: "com.palm.library.contacts.Utils",
	kind: enyo.Object,
	constructor: function () {
		this.inherited(arguments);
	},
	statics: {		
		// Static Functions
		formatBirthday: function (inBDayDateObj) {
			if (inBDayDateObj) {
				if (runningInBrowser) {
					return inBDayDateObj.getDisplayValue();
				} else {
					var birthDate = inBDayDateObj.getDateObject();
					if (birthDate && (birthDate.getFullYear() === 1900 || birthDate.getFullYear() === 0)) {
						return (new enyo.g11n.DateFmt({date: "medium", dateComponents: "dm"})).format(birthDate);
					} else if (birthDate) {
						return (new enyo.g11n.DateFmt({date: "medium"})).format(birthDate);
					}
				}
			}
		}
	}
});
