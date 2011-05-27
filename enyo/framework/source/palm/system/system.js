/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
enyo.fittingClassName = "enyo-fit";

enyo.fetchConfigFile = function(inFile) {
	if (inFile) {
		var root = enyo.windows.getRootWindow();
		inFile = enyo.makeAbsoluteUrl(root, enyo.path.rewrite(inFile));
		if (window.PalmSystem) {
			return palmGetResource(inFile, "const json");
		} else {
			if (root.enyo) {
				var xhr = root.enyo.xhr.request({url: inFile, sync: true});
				if (xhr.status != 404 && xhr.status != -1100 && xhr.responseText !== "") { // Mac Safari seems to return -1100 for missing files
					try {
						return enyo.json.parse(xhr.responseText);
					} catch(e) {
						enyo.warn("Could not parse", inFile, e);
					}
				}
			}
		}
	}
};

enyo.logTimers = function(inMessage) {
	var m = inMessage ? " (" + inMessage + ")" : "";
	console.log("*** Timers " + m + " ***");
	var timed = enyo.time.timed;
	for (var i in timed) {
		console.log(i + ": " + timed[i] + "ms");
	}
	//console.log("chartData:" + enyo.json.stringify(enyo.time.timed));
	console.log("***************");
};

//* @public
/**
	Sets the allowed orientation.
	
	inOrientation is one of 'up', 'down', 'left', 'right', or 'free'
*/
enyo.setAllowedOrientation = function(inOrientation) {
	enyo._allowedOrientation = inOrientation;
	if (window.PalmSystem) {
		PalmSystem.setWindowOrientation(inOrientation);
	}
};

/**
	Returns the actual orientation of the window.  One of 'up', 'down', 'left' or 'right'.
*/
enyo.getWindowOrientation = function() {
	if (window.PalmSystem) {
		return PalmSystem.screenOrientation;
	}
};

enyo.sendOrientationChange = function() {
	var o = enyo.getWindowOrientation();
	if (o != enyo.lastWindowOrientation) {
		enyo.dispatch({type: "windowRotated", orientation: o});
	}
	enyo.lastWindowOrientation = o;
};

/**
	On device, sets the full-screen mode of the window. If true, the system UI around the application is removed and you have
	access to the full display.  Call with false to return to normal mode.
*/
enyo.setFullScreen = function(inMode) {
	if (window.PalmSystem) {
		window.PalmSystem.enableFullScreenMode(inMode);
	}
};

/**
     Called by framework to tell webOS system that the UI is ready to display.  This causes the transition from card with fading
	 application icon to card with application user interface.  Developers will usually not need to call this directly.\
 */	 
enyo.ready = function() {
	if (window.PalmSystem) {
		// FIXME: calling stageReady on a slight delay appears to
		// fix apps starting with a blank screen. Hypothesis: we need to 
		// yield the thread between dom changes and stageReady.
		// Need to ask webkit team what's up with this.
		setTimeout(function() {
			PalmSystem.stageReady();
		}, 1);
		//
		enyo.setAllowedOrientation(enyo._allowedOrientation ? enyo._allowedOrientation : "free");
	}
};

/**
 Return a string with the current application ID, e.g. "com.example.app.myapplication"
 */
enyo.fetchAppId = function() {
	if (window.PalmSystem) {
		// PalmSystem.identifier: <appid> <processid>
		return PalmSystem.identifier.split(" ")[0];
	}
};

/**
 Return a string with the URL that is the root path of the application.
 */
enyo.fetchAppRootPath = function() {
	var r = enyo.windows.getRootWindow();
	var doc = r.document;
	var match = doc.baseURI.match(new RegExp(".*:\/\/[^#]*\/"));
	if (match) {
		return match[0];
	}
};

/**
 Return the contents of the application's appinfo.json as a read-only JS object
 */
enyo.fetchAppInfo = function() {
	return enyo.fetchConfigFile("appinfo.json");
};

/**
 Return the contents of the application's framework_config.json as a read-only JS object
 */

enyo.fetchFrameworkConfig = function() {
	return enyo.fetchConfigFile("framework_config.json");
};

/**
 Return the contents of the framework's framework_config.json as a read-only JS object
 */

enyo.fetchRootFrameworkConfig = function () {
	return enyo.fetchConfigFile("$enyo/../framework_config.json");
};

/**
 Return the contents of the system's device information as a JS object.  
 When running on a desktop browser, this will return undefined.
 
 This returned object has these properties:
 
 <table>
 <tr><td>bluetoothAvailable</td><td>Boolean</td><td>True if bluetooth is available on device</td></tr>
 <tr><td>carrierName</td><td>String</td><td>Name of carrier</td></tr>
 <tr><td>coreNaviButton</td><td>Boolean</td><td>True if physical core navi button available on device</td></tr>
 <tr><td>keyboardAvailable</td><td>Boolean</td><td>True if physical keyboard available on device</td></tr>
 <tr><td>keyboardSlider</td><td>Boolean</td><td>True if keyboard slider available on device</td></tr>
 <tr><td>keyboardType</td><td>String</td><td>Keyboard type, one of 'QWERTY', 'AZERTY', AZERTY_FR', 'QWERTZ', QWERTZ_DE'</td></tr>
 <tr><td>maximumCardWidth</td><td>Integer</td><td>Maximum card width in pixels</td></tr> 
 <tr><td>maximumCardHeight</td><td>Integer</td><td>Maximum card height in pixels</td></tr>  
 <tr><td>minimumCardWidth</td><td>Integer</td><td>Minimum card width in pixels</td></tr> 
 <tr><td>minimumCardHeight</td><td>Integer</td><td>Minimum card height in pixels</td></tr> 
 <tr><td>modelName</td><td>String</td><td>Model name of device in UTF-8 format</td></tr>
 <tr><td>modelNameAscii</td><td>String</td><td>Model name of device in ASCII format</td></tr>
 <tr><td>platformVersion</td><td>String</td><td>Full OS version string in the form "Major.Minor.Dot.Sub"</td></tr>
 <tr><td>platformVersionDot</td><td>Integer</td><td>Subset of OS version string: Dot version number</td></tr>
 <tr><td>platformVersionMajor</td><td>Integer</td><td>Subset of OS version string: Major version number</td></tr>
 <tr><td>platformVersionMinor</td><td>Integer</td><td>Subset of OS version string: Minor version number</td></tr>
 <tr><td>screenWidth</td><td>Integer</td><td>Width in pixels</td></tr> 
 <tr><td>screenHeight</td><td>Integer</td><td>Height in pixels</td></tr>  
 <tr><td>serialNumber</td><td>String</td><td>Device serial number</td></tr>
 <tr><td>wifiAvailable</td><td>Boolean</td><td>True if WiFi available on device</td></tr>
 </table>
 */
enyo.fetchDeviceInfo = function() {
	if (window.PalmSystem) {
		return JSON.parse(PalmSystem.deviceInfo);
	}
	return undefined;
};	

enyo.requiresWindow(function(){
	// trigger platform ready on load
	window.addEventListener("load", enyo.ready, false);
	// setup orientation change event
	window.addEventListener("resize", enyo.sendOrientationChange, false);
});
