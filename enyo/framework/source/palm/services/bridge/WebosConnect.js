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
		// we cannot create the applet until window load
		windowLoaded: function() {
			enyo.WebosConnect.windowLoaded = true;
			if (enyo.WebosConnect.required) {
				enyo.WebosConnect.requireApplet();
			}
		},
		// render the applet, or prepare to do so on window load
		requireApplet: function() {
			if (enyo.WebosConnect.applet) {
				return true;
			} else if (enyo.WebosConnect.windowLoaded) {
				enyo.WebosConnect.renderApplet();
			} else {
				enyo.WebosConnect.required = true;
			}
		},
		// true if the applet is ready, otherwise start applet render and return false
		appletReady: function() {
			return (enyo.WebosConnect.requireApplet() && enyo.WebosConnect.applet.executeNovacomCommand);
		},
		// load the Java Applet that communicates with novacom
		renderApplet: function() {
			var jar = enyo.path.rewrite("$palm-services-bridge/webOSconnect_1_3.jar");
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
		this.flushId = Math.random();
		this.queue = [];
		this.inherited(arguments);
	},
	execute: function(inCommand, inDataCallback, inDisconnectCallback) {
		if (this.isReady()) {
			this.executeNovacomCommand(inCommand, inDataCallback, inDisconnectCallback);
		} else {
			this.defer([inCommand, inDataCallback, inDisconnectCallback]);
		}
	},
	defer: function(inArgs) {
		this.queue.push(inArgs);
		//this.log("deferring (queue length: " + this.queue.length + ")");
	},
	isReady: function() {
		if (enyo.WebosConnect.appletReady()) {
			return true;
		}
		// if the applet is not initialized yet, check again in 1000ms
		enyo.job(this.flushId, enyo.bind(this, "flush"), 1000);
	},
	flush: function() {
		//this.log("attempting a flush");
		if (this.isReady()) {
			this.log("successful");
			while (this.queue.length) {
				var args = this.queue.shift();
				this.executeNovacomCommand.apply(this, args);
			}
		}
	},
	executeNovacomCommand: function(inCommand, inDataCallback, inDisconnectCallback) {
		//this.log(inCommand);
		try {
			return enyo.WebosConnect.applet.executeNovacomCommand(enyo.WebosConnect.deviceId, inCommand, inDataCallback, inDisconnectCallback);
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
	window.addEventListener("load", enyo.WebosConnect.windowLoaded, false);
}
