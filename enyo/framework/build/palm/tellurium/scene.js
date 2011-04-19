/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
// NOTE: Enyo does not have scenes; the following scene related functions do not apply
// This code is here only for reference and is not loaded as part of the tellurium package.
//
/*
 * Returns the top scene for the current controller (internal function)
 */
Tellurium._getTopScene = function() {
	if(Mojo.Controller.stageController) {
		return Mojo.Controller.stageController.topScene();
	} else {
		return null;
	}
};

/*
 * Returns the top/current scene's name
 */
Tellurium.getTopSceneName = function() {
	var topScene = Tellurium._getTopScene();
	if(topScene && topScene.sceneName) {
		return topScene.sceneName;
	} else {
		return "";
	}
};

/*
 * Returns true is the top scene is active
 */
Tellurium.isTopSceneActive = function() {
	var topScene = Tellurium._getTopScene();
	if(topScene && topScene.isActive()) {
		return true;
	} else {
		return false;
	}
};

/*
 * Handle scene activate events
 */
Tellurium.handleActivate = function(evt) {
	Tellurium.topSceneName = Tellurium.getTopSceneName();
	var params = {};
	params.event = "sceneActivate";
	params.scene = Tellurium.topSceneName;
	params.active = Tellurium.isTopSceneActive();
	Tellurium.notifyEvent(params);
};



/*
 * Handle scene deactivate events
 */
Tellurium.handleDeactivate = function(evt) {
	Tellurium.inVerifyDialog = false;
	Tellurium.metaDown = false;
	if (Tellurium.isTopSceneActive()) {
		var params = {};
		params.event = "sceneDeactivate";
		params.scene = Tellurium.topSceneName;
		Tellurium.notifyEvent(params);
	}
};

/*
 * Returns the top scene HTML source
 */
Tellurium.getSceneHtmlSource = function() {
	return Tellurium._getTopScene().sceneElement.innerHTML;
};