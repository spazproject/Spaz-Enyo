/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
// TELLURIUM LOADER

/*
 * Tellurium
 * 
 * Framework for automation testing. Allows javascript access to remote scripts
 * via service calls. Tellurium is a replacement for Selenium that understands
 * better applications using the Enyo framework.
 * 
 * See http://wiki.palm.com/display/~Nicolas+Pabion/Tellurium for more info.
 * 
 * (c) Palm, Inc.
 */

/*
 * Tellurium global object.
 */
var Tellurium = {};

/*
 * The (private) service used to communicate with tests 
 */
Tellurium.identifier = 'palm://com.palm.telluriumservice/';

/*
 * The nub version number.
 */
Tellurium.nubVersion = '2.1.8';

/*
 * The nub config
 */
Tellurium.config = { "enableUserEvents": false };

/*
 * The nub path on the device
 */
Tellurium.nubPath = '/usr/palm/frameworks/tellurium/';

/*
 * Initializes Tellurium given the application Mojo framework object.
 * Lightweight applications share their Mojo. This is called by the
 * mojo.js patch when a Stage loads.
 */
Tellurium.setup = function(inEnyo) {
	window.Tellurium = Tellurium;
	Tellurium.enyo = inEnyo;
	Tellurium.extend = Tellurium.enyo.mixin;
	Tellurium.isActive = true;
	Tellurium.topSceneName = "";
	Tellurium.metaDown = false;
	Tellurium.inVerifyDialog = false;
	// Delayed event notifications
	Tellurium.delayedEvents = [];
	Tellurium.serviceAvailable = true;
	// Load tellurium config
	var moreConfig = Tellurium.enyo.xhr.request({url: Tellurium.enyo.path.rewrite("$palm-tellurium/tellurium_config.json"), sync: true}).responseText || "{}";
	Tellurium.config = Tellurium.extend(Tellurium.config, enyo.json.parse(moreConfig));
	// Determine the stage type
	
	Tellurium.stageType = "card";
/*	if(window._mojoStageType) {
		Tellurium.stageType = window._mojoStageType; 
	} else if(Mojo.Controller.stageController && Mojo.Controller.stageController.stageType) {
		Tellurium.stageType = Mojo.Controller.stageController.stageType;
	} else if(window.innerWidth === 0) {
		Tellurium.stageType = "noWindow";
	}
	*/
	
	// Services
	Tellurium.subscribeToCommands();
		
	// Handle events!
	window.addEventListener('unload', Tellurium.cleanup, false);
	window.addEventListener('resize', Tellurium.handleResize, false);

	// NOTE: scene related, no longer makes sense
	//document.addEventListener(Tellurium.Event.activate, Tellurium.handleActivate, true);
	//document.addEventListener(Tellurium.Event.deactivate, Tellurium.handleDeactivate, true);

	// FIXME: card related; could make sense, how should we do this?
	//document.addEventListener(Tellurium.Event.stageActivate, Tellurium.handleStageActivate, true);
	//document.addEventListener(Tellurium.Event.stageDeactivate, Tellurium.handleStageDeactivate, true);
	

	// Load user event
	if(Tellurium.config.enableUserEvents) {
		Tellurium.events.setup();
	}
};

/*
 * Called when the window is being closed. Sends a notification to the
 * Tellurium service that this stage is closing.
 */
Tellurium.cleanup = function() {
	console.log("enyo_tellurium [cleanup]");
	// Remove event listeners
	window.removeEventListener('unload', Tellurium.cleanup, false);	
	window.removeEventListener('resize', Tellurium.handleResize, false);
	
	//document.removeEventListener(Tellurium.Event.activate, Tellurium.handleActivate, true);
	//document.removeEventListener(Tellurium.Event.deactivate, Tellurium.handleDeactivate, true);
	
	//document.removeEventListener(Tellurium.Event.stageActivate, Tellurium.handleStageActivate, true);
	//document.removeEventListener(Tellurium.Event.stageDeactivate, Tellurium.handleStageDeactivate, true);

	// Cancel the subscription
	if (Tellurium.subscribeRequest) {
		Tellurium.subscribeRequest.destroy();
	}
	
	if(Tellurium.notifyRequest) {
		Tellurium.notifyRequest.destroy();
	}
	
	if(Tellurium.replyReq) {
		Tellurium.replyReq.destroy();
	}
};
