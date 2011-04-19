/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
 * Gateway to the webOS API.
 * 
 * The following methods are available in the applet.
 * 
 * getDefaultDeviceId()
 *  Return the default device UID.
 * 	@return UID of the default device
 * 
 * executeNovacomCommand(deviceId, command, onDataFunc, onDisconnectFunc)
 * 	Execute the given novacom run command.
 * 	@param deviceId Device to connect to; use default device if null
 * 	@param command The command to be executed (e.g. /bin/ls)
 * 	@param onDataFunc Name of the JavaScript callback function to call when data is received
 * 	@param onDisconnectFunc Name of the JavaScript callback function to call when the connection returns
 * 	@return an interface to the connection, available methods are connected() and disconnect()
 * 
 * putFile(deviceId, src, dest)
 * 	Put a file onto the device's file system.
 *  @param deviceId Device to connect to; use default device if null
 *  @param src URL of the file to be uploaded (e.g. file:///Users/foo/wallpaper.jpg)
 *  @param dest The path of the file you want to write (e.g. /media/internal/wallpaper.jpg)
 *  
 * getFile(deviceId, src, dest)
 *  Get a file from the device's file system.
 *  @param deviceId Device to connect to; use default device if null
 *  @param src The path of the file you want to read (e.g. /media/internal/wallpaper.jpg)
 *  @param dest the path of the file you want to write (e.g. /Users/foo/wallpaper.jpg)
 */
enyo.kind({
	name: "enyo.WebosConnect",
	kind: enyo.Component,
	statics: {
		// device id to connect to (null == default)
		deviceId: null,
		// load the Java Applet that communicates with novacom
		renderApplet: function() {
			var jar = enyo.path.rewrite("$webos/webOSconnect_1_3.jar");
			//
			var applet = document.createElement("applet");
			applet.setAttribute("id", "webosconnect");
			applet.setAttribute("code", "com.palm.webos.connect.DeviceConnection");
			applet.setAttribute("archive", jar);
			applet.setAttribute("mayscript", "true");
			applet.style.visibility = "hidden";
			document.body.appendChild(applet);
			//
			return enyo.WebosConnect.applet = applet;
		}
	},
	create: function() {
		this.queue = [];
		this.inherited(arguments);
	},
	execute: function(inCommand, inDataCallback, inDisconnectCallback) {
		if (this.isReady()) {
			this._execute(inCommand, inDataCallback, inDisconnectCallback);
		} else {
			this.defer([inCommand, inDataCallback, inDisconnectCallback]);
		}
	},
	isReady: function() {
		if (enyo.WebosConnect.applet && enyo.WebosConnect.applet.executeNovacomCommand) {
			return true;
		}
		this.log("waiting for applet ready");
		/*
		if (!enyo.WebosConnect.applet) {
			this.log("rendering applet");
			enyo.WebosConnect.renderApplet();
		} else {
			if (Boolean(enyo.WebosConnect.applet.executeNovacomCommand)) {
				return true;
			}
			this.log("waiting for applet ready");
		}
		*/
		this.log("starting flush job");
		enyo.job("flush", enyo.bind(this, "flush"), 5000);
	},
	defer: function(inArgs) {
		this.log("deferring command");
		this.queue.push(inArgs);
	},
	flush: function() {
		this.log("attempting a flush");
		if (this.isReady()) {
			this.log("flushing");
			while (this.queue.length) {
				var args = this.queue.shift();
				this._execute.apply(this, args);
			}
		}
	},
	_execute: function(inCommand, inDataCallback, inDisconnectCallback) {
		this.log("executing", inCommand);
		try {
			var a = enyo.WebosConnect.applet;
			return a.executeNovacomCommand.apply(a, [enyo.WebosConnect.deviceId, inCommand, inDataCallback, inDisconnectCallback]);
		} catch(x) {
			console.warn("WebosConnect.execute: service bridge threw an exception: ", x);
			// synthesize PalmCall-style error response from exception
			var fn = inDataCallback;
			if (fn && window[fn]) {
				window[fn]('{"returnValue": false, "errorText": "' + x + '"}\n');
			}
			return null;
		}
	},
	putFile: function(inSrc, inDst) {
		enyo.WebosConnect.applet.putFile(enyo.WebosConnect.deviceId, inSrc, inDst);
	},
	getFile: function(inSrc, inDst) {
		this.log(enyo.WebosConnect.applet.getFile, enyo.WebosConnect.deviceId, inSrc, inDst);
		enyo.WebosConnect.applet.getFile(enyo.WebosConnect.deviceId, inSrc, inDst);
	}
});

if (!window.PalmSystem) {
	// FIXME: service tunnel will not be available until after 'onload'
	window.addEventListener("load", enyo.WebosConnect.renderApplet, false);
}
