/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.json = {
	//* @public
	/**
		Returns a JSON string for a given object, using native stringify
		routine if it's available.
		<i>inValue</i> is the Object to be converted to JSON.
		<i>inReplacer</i> is the optional value inclusion array or replacement function.
		<i>inSpace</i> is the optional number or string to use for pretty-printing whitespace.
	*/
	stringify: function(inValue, inReplacer, inSpace) {
		throw "This browser does not support the native JSON API.";
	},
	/**
		Returns a JavaScript object for a given JSON string, using native stringify
		routine if it's available.
		<i>inJson</i> is the JSON string to be converted to a JavaScript object.
	*/
	parse: function(inJson) {
		throw "This browser does not support the native JSON API.";
	}
};

if (window.JSON) {
	enyo.json.stringify = JSON.stringify;
	enyo.json.parse = JSON.parse;
};
