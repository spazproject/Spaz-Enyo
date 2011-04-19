/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// Builtin preamble.

// copy globals to this builtin environment
Array = global.Array;
String = global.String;
Boolean = global.Boolean;
Number = global.Number;
undefined = global.undefined;
Math = global.Math;
Date = global.Date;
isNaN = global.isNaN;
SyntaxError = global.SyntaxError;

// Pacify code that attempts to references window, document, etc.
window = this;
//
nop = function() {};
document = {
	addEventListener: nop,
	querySelector: nop,
	write: nop
};

// allows checks of window.enyo to pass
window.enyo = enyo = {}; 

// map a globally accessible location (enyoBuiltin) to enyo in this scope
global.enyoBuiltin = enyo;

// flag our origin
enyo.isBuiltin = true;

// any initial calls to depends will fail (silently with this code); should be done in/after setupBuiltin
enyo.args = {};
enyo.depends = function() {};

// allow access to PalmSystem while setting up
window.PalmSystem = PalmSystem = global.PalmSystem || true;

// map of properties to copy from a window object to this scope
windowMap = {
	properties: [
		"document",
		"location",
		"eval",
		"PalmSystem",
		"PalmServiceBridge",
		"console",
		"PhoneGap",
		"XMLHttpRequest",
		"encodeURIComponent",
		"Image"
	],
	methods: [
		"setTimeout",
		"clearTimeout",
		"setInterval",
		"clearInterval",
		"parseInt"
	]
};

// copy properties from a window object to this environment
mapToWindow = function(inWindow) {
	window = inWindow;
	for (var i=0, d; d=windowMap.properties[i]; i++) {
		this[d] = inWindow[d];
	}
	for (i=0; d=windowMap.methods[i]; i++) {
		this[d] = enyo.hitch(inWindow, d);
	}
}

// builtin bootstrapper which needs to be called from client code.
enyo.setup = function(inWindow) {
	// copy properties from a window object to this environment
	mapToWindow(inWindow);
	enyo.global = inWindow;
	enyo.path.paths.enyo = enyo.enyoPath;
	// shallow copy window-based enyo into the builtin enyo
	for (var n in window.enyo) {
		enyo[n] = window.enyo[n]
	}
	// promote builtin enyo to window
	window.enyo = enyo;
	// perform startup tasks that have been deferred until a window is available
	enyo.hasWindow();
}

// enyo code must use this method to set prototypes (assigning to fn.prototype will fail)
enyo.setPrototype = function(ctor, proto) {
	%FunctionSetPrototype(ctor, proto);
};
