/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
Menu item for Help.  Should be used by application wishes to initiate help content.
It is meant to go inside an <a href="#enyo.AppMenu">AppMenu</a>.

	{kind: "AppMenu", components: [
		{kind: "EditMenu"},
		{kind: "HelpMenu", target: "http://help.palm.com/phone/index.html"}
	]}
*/
enyo.kind({
	name: "enyo.HelpMenu",
	kind: enyo.AppMenuItem,
	caption: enyo._$L("Help"),
	published: {
		target: ""
	},
	helpAppId: "com.palm.app.help",
	components: [
		{name: "launchHelp", kind: "PalmService", service: "palm://com.palm.applicationManager/", method: "open"}
	],
	itemClick: function() {
		this.inherited(arguments);
		this.$.launchHelp.call({id: this.helpAppId, params: {target: this.target}});
	}
});
