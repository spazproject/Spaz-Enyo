/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "App",
	kind: enyo.VFlexBox,
	components: [
		{kind: "enyo.PalmService", service: "palm://com.palm.keys/audio/", method: "status", subscribe: true, onSuccess: "status", onFailure: "fail"},
		{kind: "HFlexBox", components: [
			{kind: "Button", caption: "Connect Service", onclick: "go"},
			{kind: "Button", caption: "Cancel Service", onclick: "cancel"}
		]},
		{flex: 1, kind: "Scroller", style: "background-color: gray;", components: [
			{components: [
				{name: "console", style: "font-size: 10pt; background-color: white;"}
			]}
		]}
	],
	go: function() {
		var request = this.$.palmService.call();
		this.$.console.addContent("> " + request.json + "<br/>");
		this.$.console.addContent('<div style="background-color: lightgreen; padding: 4px;">Press Volume buttons on connected webOS device to see status changes.</div>');
	},
	cancel: function() {
		this.$.palmService.cancel();
		this.$.console.addContent("> cancelled<br/>");
	},
	status: function(inSender, inResponse) {
		this.$.console.addContent(enyo.json.stringify(inResponse) + "<br/>");
	},
	fail: function(inSender, inResponse) {
		this.$.console.addContent(enyo.json.stringify(inResponse) + "<br/>");
	}
});
