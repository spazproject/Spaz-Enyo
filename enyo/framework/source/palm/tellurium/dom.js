/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
/*
 * DOM API
 */

/**
 * get the property of the DOM matching the xpath  *
 * @param {Object} locator
*/
Tellurium.getDomProperty = function(xpath,property) {
  var item;
  var nodes = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
  while(item = nodes.iterateNext()) {
    return item[property];
  }
  return -1;
};


/**
 * Tap the dom Element,  which match the xpath 
 * @param {Object} locator
*/

Tellurium.clickDom = function(xpath) {                              
  var item;                                                                        
  var nodes = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
  item = nodes.iterateNext();
  if(item==null)                                                                  
   {    console.log("Invalid xpath");                                                                          
        return false;                                                             
   } 
  var locator;
  var metrics;
  var details = {                                                                              
       detail: 1,                                                                                   
       ctrlKey: false,                                                                              
       altKey: false,                                        
       shiftKey: false,                                                                             
       metaKey: false,                                                  
       button: 0                                                        
       };  
  var newEvent = document.createEvent("MouseEvents");
  //item = nodes.iterateNext();                                              
  locator = item["id"];
  metrics = Tellurium.getMetrics("#"+locator);
  newEvent.initMouseEvent("click", true, true, window, details.detail,                  
                          metrics.left, metrics.top, metrics.left, metrics.top,                 
                          details.ctrlKey, details.altKey, details.shiftKey, details.metaKey,
                          details.button, null);                                             
  item.dispatchEvent(newEvent);   
  return true;                                                                       
};

/* Create Offset 
*/
function createOffset(x,y){
var offset=[x,y];offset.left=x;offset.top=y;return offset
}

/*
 * Retrieves an value of element given its name attribute.
 *
 * @param {Object} locator
 * @param {Object} element
*/

Tellurium.queryElementValue = function(locator,arg) {
  var element = eval("document.querySelector(locator)."+arg);
  return element;
};

/*
 * Retrieves an element given its name attribute.
 *
 * @param {Object} locator
*/
Tellurium.queryElement = function(locator) {
  var element = document.querySelector(locator);
  return element.innerHTML;
};

/*
 * Set the value to  an element .
 *
 * @param {Object} locator
*/
Tellurium.setValue = function(locator,value) {
   var element = document.querySelector(locator);
   element.innerHTML = value;
   return true;
};

/*
 * Set the value to  an element .
 * @param {Object} locator
 */

  Tellurium.setElementValue = function(locator,arg,value) {
  var element = eval("document.querySelector(locator)."+arg);
  element = value;
  return true;
};


// Utility function copied from Mojo2
Tellurium.getDimensions = function(inElement) {
	if (inElement.style.display != 'none') {
		return {
			width: inElement.offsetWidth,
			height: inElement.offsetHeight
		};
	}

	var els = inElement.style;
	var orig = {
		visibility: els.visibility,
		position: els.position,
		display: els.display
	};

	els.visibility = "hidden";
	els.position = "absolute";
	els.display = "block";

	var dims = {
		width: inElement.clientWidth,
		height: inElement.clientHeight
	};

	Tellurium.enyo.mixin(els, orig);

	return dims;
};

// Utility function copied from Mojo2
Tellurium.viewportOffset = function(el) {
	var currentEl = el;
	var top = 0, left = 0;
	var fixedParent;
	var ownerDocument = el.ownerDocument;

	// Add up offsetTop & offsetLeft of positioned ancestors to the root of the DOM.
	while (currentEl) {
		top += currentEl.offsetTop;
		left += currentEl.offsetLeft;
		// Don't forget to include border widths, but not on the el itself.
		if (currentEl !== el) {
			top += currentEl.clientTop;
			left += currentEl.clientLeft;
		}

		// If we have a fixed position ancestor, then we're done -- fixed position is always relative to the viewport.
		if (currentEl.style.position === 'fixed') {
			fixedParent = currentEl;
			break;
		}
		currentEl = currentEl.offsetParent;
	}

	// Make a second pass to add up the scrollLeft & scrollTop of our ancestors.
	// Don't forget to stop in the case where we had a fixed position ancestor.
	currentEl = el;
	while (currentEl && currentEl !== ownerDocument) {
		left -= currentEl.scrollLeft;
		top -= currentEl.scrollTop;
		if (currentEl === fixedParent) {
			break;
		}

		currentEl = currentEl.parentNode;
	}
	return createOffset(left, top);
}



/*
 * Runs a custom javascript.
 * 
 * @param {Object} script
 */
Tellurium.runScript = function(script) {
	var result = eval(script);
	return result || true;
};

/*
 * Sets the focus on an element.
 * 
 * @param {Object} locator
 */
Tellurium.focus = function(locator) {
	var element = Tellurium.getElement(locator);
	element.focus();
};

/*
 * Removes the focus on an element.
 * 
 * @param {Object} locator
 */
Tellurium.blur = function(locator) {
	var element = Tellurium.getElement(locator);
	element.blur();
};

/*
 * Get an element property value.
 * 
 * @param {Object} locator
 */
Tellurium.getProperty = function(locator, property) {
	var element = Tellurium.getElement(locator);
	return element[property];
};

/*
 * Set an element property value.
 * 
 * @param {Object} locator
 */
Tellurium.setProperty = function(locator, property, value) {
	var element = Tellurium.getElement(locator);
	element[property] = value;
};

/*
 * Gets an element style property.
 *  
 * @param {Object} locator
 * @param {Object} property
 */
Tellurium.getStyleProperty = function(locator, property) {
	var element = Tellurium.getElement(locator);
	var style = window.getComputedStyle(element, null);	
	return style[property];
};

/*
 * Sets an element style property.
 *  
 * @param {Object} locator
 * @param {Object} property
 */
Tellurium.setStyleProperty = function(locator, property, value) {
	var element = Tellurium.getElement(locator);
	element.style[property] = value;
};

/*
 * Returns true if an element is present.
 * 
 * @param {Object} locator
 */
Tellurium.isElementPresent = function(locator) {
	var element = Tellurium.getElement(locator);
	return (element) ? true : false;
};

/*
 * Returns true if an element is visible.
 * 
 * @param {Object} locator
 */
Tellurium.isElementVisible = function(locator) {
	var element = Tellurium.getElement(locator);
	return element.style.display != 'none';
};

/*
 * Try to make the element visible on the screen
 * @param {Object} locator
 */
 // FIXME: tbd when Enyo supports this api.
Tellurium.revealElement = function(locator) {
	var element = Tellurium.getElement(locator);
	//Tellurium._getTopScene().revealElement(element);
};

/*
 * Returns the width of an element
 * @param {Object} locator
 */
Tellurium.getWidth = function(locator) {
	var element = Tellurium.getElement(locator);
	return Tellurium.getDimensions(element).width;
};

/*
 * Returns the height of an element
 * @param {Object} locator
 */
Tellurium.getHeight = function(locator) {
	var element = Tellurium.getElement(locator);
	return Tellurium.getDimensions(element).height;
};

/*
 * Returns the top position of an element.
 * @param {Object} locator
 */
Tellurium.getViewportOffsetTop = function(locator) {
	var element = Tellurium.getElement(locator);
	return Tellurium.viewportOffset(element).top;
};

/*
 * Returns the left position of an element.
 * @param {Object} locator
 */
Tellurium.getViewportOffsetLeft = function(locator) {
	var element = Tellurium.getElement(locator);
	return Tellurium.viewportOffset(element).left;
};

/*
 * Returns an elements position and dimensions.
 * @param {Object} locator
 */
Tellurium.getMetrics = function(locator) {
	var element = Tellurium.getElement(locator);
	var offset = Tellurium.viewportOffset(element);
	var dimensions = Tellurium.getDimensions(element);
	var metrics = {
		width: dimensions.width,
		height: dimensions.height,
		left: offset.left,
		top: offset.top
	};	
	return metrics;
};
Tellurium.getDayViewEventMetrics = function(eventSubject) {
    // Find an event's dimensions using its subject:
    var bounds = Tellurium.calendarDayViewInspector.getBySubject({bounds: eventSubject});
    if (!bounds) {
           console.error ("\n\n\tNo event was found with subject [ %s ].\n\n", eventSubject);
           return;
    }
    var metrics = {
           width: bounds.width,
           height: bounds.height,
           left: bounds.left,
           top: bounds.top
     };
      return metrics;
 };
