/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
/*
 * EVENT SECTION
 */

/*
 * Sends a mouseDown,Mouseup,and click event.
 * @param {Object} eventType Can be "mousedown", "mouseup", "mouseover", "mousemove", "mouseout"
 */
Tellurium.mouseTap = function(locator) {
   
   var details = {
   detail: 1,
   ctrlKey: false,
   altKey: false,
   shiftKey: false,
   metaKey: false,
   button: 0
   };
    
   Tellurium.mouseEvent(locator,"mousedown",details);
   Tellurium.mouseEvent(locator,"mouseup",details);
   Tellurium.mouseEvent(locator,"click",details);
};

/*
 * Sends a mouse event.
 * @param {Object} eventType Can be "mousedown", "mouseup", "mouseover", "mousemove", "mouseout"
 */
Tellurium.mouseEvent = function(locator, eventType, details) {
	
	var metrics = Tellurium.getMetrics(locator);                                           
        var element = Tellurium.getElement(locator);                                           
        var newEvent = document.createEvent("MouseEvents");                                    
        newEvent.initMouseEvent(eventType, true, true, window, details.detail,                 
                          metrics.left, metrics.top, metrics.left, metrics.top,                          
                          details.ctrlKey, details.altKey, details.shiftKey, details.metaKey,            
                          details.button, null);
	element.dispatchEvent(newEvent);
};


/*
 * Sends an event to an element with the given details.
 * If you are sending a key or mouse event, prefer using
 * the keyEvent() and mouseEvent() functions
 * 
 * @param {Object} locator
 * @param {Object} event
 * @param {Object} details
 */
Tellurium.fireEvent = function(locator, eventType, details) {
	var element = Tellurium.getElement(locator);
	var newEvent = document.createEvent("HTMLEvents");
	newEvent.initEvent(eventType, true, true);
	element.dispatchEvent(newEvent);
};

/*
 * Sends a key event.
 * @param {Object} eventType 'keydown' or 'keyup'
 * @param {Object} keyIdentifier See http://www.w3.org/TR/DOM-Level-3-Events/keyset.html
 */
Tellurium.keyEvent = function(locator, eventType, keyCode, keyIdentifier, shiftKey, metaKey, altKey, ctrlKey) {
	var element = Tellurium.getElement(locator);
	var newEvent = document.createEvent("HTMLEvents");
	newEvent.initEvent(eventType, true, true, window);
	// Extend stuff to make it look like a KeyEvent
	newEvent.keyCode = keyCode;
	newEvent.charCode = newEvent.keyCode;
    	newEvent.which = newEvent.keyCode;	            
    	newEvent.shiftKey = shiftKey || false;
	newEvent.metaKey = metaKey || false;
	newEvent.altKey = altKey || false;
	newEvent.ctrlKey = ctrlKey || false;
	newEvent.altGraphKey = false;
	newEvent.keyIdentifier = keyIdentifier;
	newEvent.keyLocation = 0;
	newEvent.detail = 0;
	newEvent.view = window;

	// Send newEvent
	element.dispatchEvent(newEvent);
};

/*
 * Sends a text event (append text!) to an element
 * @param {Object} locator
 * @param {Object} text
 */
Tellurium.textEvent = function(locator, text) {
	var element = Tellurium.getElement(locator);
	var newEvent = document.createEvent("TextEvent");
	newEvent.initTextEvent("textInput", true, true, null, text);
	element.dispatchEvent(newEvent);
};

/*
 * Send a simulated tap via PalmSystem
 */
Tellurium.simulatedTap = function(locator) {
	var x;
	var y;
	if(locator === "window") {
		x = window.innerWidth / 2;
		y = window.innerHeight / 2;		
	} else {
		var metrics = Tellurium.getMetrics(locator);
		x = Math.round(metrics.left + metrics.width / 2);
		y = Math.round(metrics.top + metrics.height / 2);
	}
	return Tellurium.simulatedTapXY(x, y);
};

/*
 * Simulate a tap event using a mouse up/down events 
 */
Tellurium.simulatedTapXY = function(x, y) {
	window.PalmSystem.simulateMouseClick(x, y, true);
	window.PalmSystem.simulateMouseClick(x, y, false);
	return true;
};

/*
 * Send a DOM mojo-tap event
 */
Tellurium.mojoTap = function(locator) {
	
};
