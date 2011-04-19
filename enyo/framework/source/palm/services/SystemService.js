/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
A <a href="#enyo.PalmService">PalmService</a> that allows applications to access various system settings.

	{kind: "enyo.SystemService"}

*/
enyo.kind({
	name: "enyo.SystemService",
	kind: enyo.PalmService,
	service: enyo.palmServices.system
});