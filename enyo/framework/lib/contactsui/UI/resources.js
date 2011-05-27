/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global enyo, $contactsui_path */

// this needs to come before any of the enyo kinds are defined so that the resources are available to
// localize the strings in the kind definitions
var crb = new enyo.g11n.Resources({
	root: $contactsui_path
});