/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
//
// cards events
//

/*
 * Get The View Name Based on PaneId 
 */


Tellurium.getViewNameByPaneId = function(paneId) {
     
     var viewName = eval("Tellurium.enyo.windows.getActiveWindow().enyo.$."+paneId+".getViewName()");
     return viewName; 
};


/*
 * Handle resize events
 */

Tellurium.handleResize = function() {
	var params = { };
	params.type = "windowResize";
	params.width = window.innerWidth;
	params.height = window.innerHeight;
	Tellurium.notifyEvent(params);
};

// FIXME: experimental way of handing stageActivated to Tellurium.
Tellurium.defaultStageActivated = Mojo.stageActivated;
Mojo.stageActivated = function() {
	Tellurium.defaultStageActivated();
	var params = { };
	params.type = "windowActivate";
	params.stageId = Tellurium.stageId;
	Tellurium.notifyEvent(params);
	Tellurium.isActive = true;
};

// FIXME: experimental way of handing stageDeactivated to Tellurium.
Tellurium.defaultStageDeactivated = Mojo.stageDeactivated;
Mojo.stageDeactivated = function(evt) {
	Tellurium.defaultStageDeactivated();
	var params = {};
	params.type = "windowDeactivate";
	params.stageId = Tellurium.stageId;
	Tellurium.notifyEvent(params);
	Tellurium.isActive = false;
	Tellurium.inVerifyDialog = false;
	Tellurium.metaDown = false;
};

/*
 * Handle stage activate events
 */
/*
Tellurium.handleStageActivate = function(evt) {	
	var params = { };	
	params.event = "stageActivate";
	params.stageId = Tellurium.stageId;
	Tellurium.notifyEvent(params);
	Tellurium.isActive = true;
};
*/
/*
 * Handle stage deactivate events
 */
/*
Tellurium.handleStageDeactivate = function(evt) {
	var params = { };
	params.event = "stageDeactivate";
	params.stageId = Tellurium.stageId;
	Tellurium.notifyEvent(params);
	Tellurium.isActive = false;
	Tellurium.inVerifyDialog = false;
	Tellurium.metaDown = false;
};
*/

/*
 * Closes the window/stage
 */
Tellurium.closeStage = function() {
	console.log("ENYO EVENT : closeStage  ");	
	window.close();
};

/*
 * Maximize the window/stage
 */
Tellurium.activateStage = function() {
	Tellurium.enyo.windows.activateWindow(window);
};

/*
 * Minimize the window/stage
 */
Tellurium.deactivateStage = function() {
	Tellurium.enyo.windows.deactivateWindow(window);
};

/*
 * Returns true is the stage is active
 */
Tellurium.isStageActive = function() {
	return Tellurium.enyo.isCardActive;
};

/*
 * Try to figure out the stage offset (used for tap())
 */
Tellurium.getStageYOffset = function() {
	var offset = 0;
	switch(Tellurium.stageType) {
		case "card":
		case "childcard":
			offset = (screen.height !== window.innerHeight) ? 28 : 0; 
			break;
		case "dashboard":
			offset = (Tellurium.isActive) ? screen.height - window.innerHeight : screen.height - 28; 
			break;
		case "banneralert":
		case "activebanner":
			offset = screen.height - 28;
			break;
		case "popupalert":
			offset = screen.height - window.innerHeight;
			break;
	}	
	return offset;
};

/*
 * Send a back event to the stage controler
 */
Tellurium.back = function() {
	//var backEvent = Tellurium.Event.make('keydown', { keyCode: 27});
	//Mojo.Controller.stageController._boundKeyHandler(backEvent);
	//Tellurium.Event.make('keydown', { keyCode: 27});
	Tellurium.keyEvent(document, 'keydown', 27, 27, false, false, false, false);
};

/*
 * Returns the main document HTML source
 */
Tellurium.getHtmlSource = function() {
	//return Mojo.Controller.stageController.document.getElementsByTagName("html")[0].innerHTML;
	return Tellurium.getTopElement().getElementsByTagName("html")[0].innerHTML;
};

