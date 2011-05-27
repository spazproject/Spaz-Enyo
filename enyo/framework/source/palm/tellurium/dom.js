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
Tellurium.createOffset = function(x,y) {
  var offset=[x,y];
  offset.left=x;
  offset.top=y;
  return offset;
};

/*
 * Retrieve the value of an element property using document.querySelector(selector) to locate the first element that matches the selector.
 *
 * @param {Object} selector
 * @param {Object} propertyname
*/
Tellurium.queryElementValue = function(selector,propertyname) {
  var propertyvalue = eval("document.querySelector(selector)."+propertyname);
  return propertyvalue;
};

/*
 * Retrieve the innerHTML of an element using document.querySelector(selector) to locate the first element that matches the selector.
 *
 * @param {Object} selector
*/
Tellurium.queryElement = function(selector) {
  var element = document.querySelector(selector);
  return element.innerHTML;
};

/*
 * Set the innerHTML value of an element using document.querySelector(selector) to locate the first element that matches the selector.
 *
 * @param {Object} selector
 * @param {Object} value
*/
Tellurium.setValue = function(selector,value) {
   var element = document.querySelector(selector);
   element.innerHTML = value;
   return true;
};

/*
 * Set the value to  an element using document.querySelector(selector) to locate the first element that matches the selector.
 *
 * @param {Object} selector
 * @param {Object} propertyname
 * @param {Object} value
 */
Tellurium.setElementValue = function(selector,propertyname,value) {
  eval("document.querySelector(selector)."+propertyname+"='"+value+"'");
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

Tellurium.viewportOffset = function(elementObjectOrLocator) {
	var targetEl = (typeof elementObjectOrLocator == "string") ? Tellurium.getElement(elementObjectOrLocator) : elementObjectOrLocator;
	if (!targetEl) throw { message: "Tellurium.viewportOffset: Invalid element/locator parameter." };
	var currentEl = targetEl;
	var top = 0, left = 0;
	var fixedParent;
	var ownerDocument = targetEl.ownerDocument;
	// pass1 - add up offsetTop & offsetLeft of positioned ancestors to the root of the DOM
	while (currentEl) {
		top += currentEl.offsetTop;
		left += currentEl.offsetLeft;
		// include border widths, but not on the targetEl itself
		if (currentEl !== targetEl) {
			top += currentEl.clientTop;
			left += currentEl.clientLeft;
		}
		// done if element is fixed position, which is always relative to the viewport
		if (currentEl.style.position && currentEl.style.position === 'fixed') {
			fixedParent = currentEl;
			break;
		}
		currentEl = currentEl.offsetParent;
	}
	// pass2 - adjust for enyo-scroller containers
	var scrollTop, scrollLeft;
	currentEl = targetEl;
	while (currentEl && currentEl !== ownerDocument) {
		try {
		  if (currentEl.className && Tellurium.isWordInString(currentEl.className, "enyo-scroller")) {
			scrollTop = eval("Tellurium.enyo.windows.getActiveWindow().enyo.$."+currentEl.id+".getScrollTop()");
			scrollLeft = eval("Tellurium.enyo.windows.getActiveWindow().enyo.$."+currentEl.id+".getScrollLeft()");
			top -= scrollTop;
			left -= scrollLeft;
		  }
		}
		catch (scrollerException) { }
		if (currentEl === fixedParent) break;
		currentEl = currentEl.parentNode;
	}
	return Tellurium.createOffset(left, top);
};

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
 * Returns true if the element is present and the element and all its ancestors are not hidden
 * 
 * @param {Object} locator of an element
 */
Tellurium.isElementVisible = function(locator) {
	var element = Tellurium.getElement(locator);
	if (!element) return false;
	if (element.style.display === 'none') return false;
	var ancestorsXPath = Tellurium.getElementXPath(element, false) + "/ancestor::*";
	var ancestorNodes = document.evaluate(ancestorsXPath, document, null, XPathResult.ANY_TYPE, null);
	while(element = ancestorNodes.iterateNext()) {
		if (element.style.display === 'none') return false;
	}
	return true;
};

/*
 * Try to make the element visible on the screen.
 * @param {Object} locator
 */
Tellurium.revealElement = function(locator) {
	var scrollerElementId = Tellurium.findScrollerAncestorId(locator);
	if (scrollerElementId === "") return false;
	var locatorElement = Tellurium.getElement(locator);
	var evalText = "Tellurium.enyo.windows.getActiveWindow().enyo.$."+scrollerElementId+".scrollTo("+locatorElement.offsetTop+",0)";
	eval(evalText);
};

/*
 * Search for a DOM ancestor that is a scroller (class="enyo-scroller"); return the 'id' property of the scroller element; return "" if not found
 * @param {Object} locator
 */
Tellurium.findScrollerAncestorId = function(locator) {
	// validate locator element
	var locatorElement = Tellurium.getElement(locator);
	if (!locatorElement) return "";
	if (locatorElement.style.display === 'none') return "";
	if (locatorElement.offsetTop == undefined || locatorElement.offsetTop == null) return "";
	// look for an ancestor scroller container
	var foundScroller = false;
	var ancestorElement = null;
	var ancestorsXPath = Tellurium.getElementXPath(locatorElement, false) + "/ancestor::*";
	var ancestorNodes = document.evaluate(ancestorsXPath, document, null, XPathResult.ANY_TYPE, null);
	while (ancestorElement = ancestorNodes.iterateNext()) {
		if (ancestorElement.style.display === 'none') return ""; // if the ancestor is hidden then so is the locatorElement
		if (ancestorElement.className == undefined || ancestorElement.className == null) return "";
		if (!Tellurium.isWordInString(ancestorElement.className, "enyo-scroller")) continue;
		foundScroller = true;
		break;
	}
	if (!foundScroller) return "";
	if (!ancestorElement.id) return "";
	return ancestorElement.id;
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

/*
 * Search for a word in a string (words are separated by spaces; search is case sensitive).
 * @param {Object} inputString
 * @param {Object} targetWord
 */
Tellurium.isWordInString = function(inputString, targetWord) {
	var words = inputString.split(" ");
	for (var i = 0; i < words.length; i++) {
		if (words[i] === targetWord) return true;
	}
	return false;
};
