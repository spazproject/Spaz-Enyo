/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.WebOsPalmServiceBridge",
	kind: enyo.Component,
	components: [
		{kind: "WebosConnect"}
	],
	events: {
		onData: ""
	},
	statics: {
		// device id to connect to (null == default)
		deviceId: null,
		// application id sent to luna-send for determining permissions
		spoofId: "com.palm.configurator"
	},
	create: function() {
		this.inherited(arguments);
		this.createCallbacks();
	},
	destroy: function() {
		if (this.connection) {
			this.log("disconnected a connection: ", this.connection);
			this.connection.disconnect();
		}
		this.destroyCallbacks();
		delete this.connection;
	},
	cancel: function() {
		this.destroy();
	},
	createCallbacks: function() {
		this.gotDataFnName = this.id + "_gotData";
		window[this.gotDataFnName] = enyo.bind(this, "gotData");
		this.disconnectFnName = this.id + "_gotDisconnect";
		window[this.disconnectFnName] = enyo.bind(this, "gotDisconnect");
	},
	destroyCallbacks: function() {
		delete window[this.gotDataFnName];
		delete window[this.disconnectFnName];
	},
	call: function(inUrl, inJson) {
		this.log(inUrl);
		//console.log(enyo.json.parse(inJson));
		// make the json safe for luna-send
		var json = inJson.replace(/ /g, "\\ ");
		var command = "/usr/bin/luna-send";
		command += " -a " + enyo.WebOsPalmServiceBridge.spoofId;
		command += " -i";
		command += " " + inUrl;
		command += " " + json;
		command += "\n";
		return this.execute(command);
	},
	execute: function(inCommand) {
		this.data = '';
		this.connection = this.$.webosConnect.execute(inCommand, this.gotDataFnName, this.disconnectFnName);
		return this.connection;
	},
	gotData: function(inResponse) {
		var r = String(inResponse);
		this.data += r;
		if (r.charCodeAt(r.length-1) == 10) {
			var data = this.data;
			this.data = '';
			// make sure we return to the plugin right away, we can do this work
			// from the idle stack
			enyo.asyncMethod(this, "doData", data);
		}
	},
	gotDisconnect: function() {
	}
});

enyo.kind({
	name: "enyo.PalmService.WebosRequest",
	// originally we extended enyo.PalmService.Request
	// DbService.Request exposes watch handling, this could cause a problem 
	// if there is a non-db Service that returns a 'fired: true' response, but
	// we are living dangerously at the moment.
	kind: enyo.DbService.Request,
	createBridge: function() {
		this.bridge = new enyo.WebOsPalmServiceBridge({owner: this, onData: "webosData"});
	},
	webosData: function(inSender, inResponse) {
		this.receive(inResponse);
	}
});

if (!window.PalmSystem && !enyo.args.nobridge) {
	enyo.PalmService.prototype.requestKind = "PalmService.WebosRequest";
	enyo.DbService.prototype.requestKind = "PalmService.WebosRequest";
}