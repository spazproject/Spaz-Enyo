/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
/*
 * LOCATOR SECTION (greatly inspired by Selenium)
 */

Tellurium.getTopElement = function() {
	return document;
}

/*
 * Retrieves an element given a locator.
 * This is a simplified version of Selenium locator strategy functions.
 * TODO: Allow implicit rules (eg if starts with '//' use xpath...)
 * 
 * Supported locator strategies:
 *  - id=    "Search using id atribute"
 *  - name=  "Search using name attribute"
 *  - dom=   "Search by evaluating the dom path"
 *  - xpath= "Search using xpath"
 *  - css=   "Search using CSS locator"
 *  - class= "Search by class name"
 * @param {Object} locator
 */
Tellurium.getElement = function(locator) {
	var locatorType = 'css';
	var locatorString = locator;
	//var topScene = scene || Tellurium._getTopScene().sceneElement;
	var topScene = Tellurium.getTopElement();
	
	// Quicky
	if(locator === "document") { return document; }
	if(locator === "window") { return window; }
	// Another quick but hack to allow passing an element directly
	if(typeof(locator) !== "string") { return locator; }
	
	// If there is a locator prefix, use the specified strategy
    var result = locator.match(/^([A-Za-z]+)=(.+)/);
    if (result) {
        locatorType = result[1].toLowerCase();
        locatorString = result[2];
    }
	
	// Simply upper case the first letter of the locator 
	locatorType = locatorType.substr(0,1).toUpperCase() + locatorType.substr(1);
	// Call the function (ignore exceptions as they are caught by handleCommands)
	return Tellurium["getElementBy" + locatorType].call(this, locatorString, topScene);
};

/*
 * Retrieves an element given its id attribute.
 * 
 * @param {Object} locator
 */
Tellurium.getElementById = function(locator, parent) {
	var element = parent.querySelector("#" + locator);	
	return element;
};

/*
 * Retrieves an element given its name attribute.
 * 
 * @param {Object} locator
 */
Tellurium.getElementByName = function(locator, parent) {
	var element = parent.querySelector("[name=\"" + locator + "\"");	
	return element;
};

/*
 * Retrieves an element given a dom expression.
 * 
 * @param {Object} locator
 */
Tellurium.getElementByDom = function(locator) {
	return eval(locator);
};

/*
 * Retrieves an element given its xpath.
 * 
 * @param {Object} locator
 */
Tellurium.getElementByXpath = function(locator, parent) {
	var result = document.evaluate(locator, parent, null, XPathResult.ANY_TYPE, null);
	return result.iterateNext();
};

/*
 * Retrieves an element given its CSS locator.
 * 
 * @param {Object} locator
 */
Tellurium.getElementByCss = function(locator, parent) {
	var element = parent.querySelector(locator);	
	return element;
};

/*
 * Retrieves an element given its class name.
 * 
 * @param {Object} locator
 */
Tellurium.getElementByClass = function(locator, parent) {
	var element = parent.querySelector("[class~=\"" + locator + "]\"");	
	return element;
};

/*
 * Check is an xpath has a unique result
 */
Tellurium._isXPathUnique = function(xpath, top) {
	var count = 0;
	var result = document.evaluate(xpath, top, null, XPathResult.ANY_TYPE, null);
	while(result.iterateNext()) {
		count++;
	}
	return (count === 1) ? true : false;
};

/*
 * Returns the element index from its siblings if not unique
 */
Tellurium.getElementIndex = function(element) {
	var siblings = element.parentNode.childNodes;
	var similarSiblings = 0;
    var index = 0;
    
	for(var i = 0; i < siblings.length; i++) {
		var sibling = siblings[i];
		if(sibling.nodeName === element.nodeName) { similarSiblings++; }
		if(sibling === element) { index = similarSiblings; }
	}
	
	return (similarSiblings > 1) ? index : 0;
};

/*
 * Returns the xpath value for the given element
 */
Tellurium.getElementXPath = function(element, useChildText) {
	var xpath = "";
	var useIndex = false;
	var topScene = Tellurium.getTopElement();
	// Attributes to ignore (id is handled separatly)
	var attributesToIgnore = [ "id", "style", "x-mojo-tap-highlight", "width", "height" ];
	useChildText = (useChildText === undefined) ? true : useChildText;
	
	for(;;) {
		var index = 0;
		var conditions = [];
		if(element.nodeName === "#document") { return xpath; }
		if(element.nodeName !== "#text") {
			// Check the node id
			if (element.id && !element.id.match("palm_anon")) {
				conditions.push("@id='" + element.id + "'");
				// If the ID is unique, go for it!
				var idXpath = "//" + element.nodeName.toLowerCase() + "[@id='" + element.id +"']" + xpath;
				if(Tellurium._isXPathUnique(idXpath, topScene)) {
					//console.error("*** XPATH IS UNIQUE(ID): " + idXpath);
					return idXpath;
				}
			}
			
			// Get attributes			
			for(var i = 0; i < element.attributes.length; i++) {
				var name = element.attributes[i].name;
				var value = element.attributes[i].value;
				if(attributesToIgnore.indexOf(name) === -1 && name.indexOf("x-palm-") !== 0 && value.indexOf("palm_anon_") !== 0) {				
					conditions.push("contains(@" + name + ",'" + value + "')");
				}
			}
			
			// Get child text if available
			if (useChildText && element.childNodes.length === 1 && element.childNodes[0].nodeName === "#text") {
				var text = element.childNodes[0].textContent.trim(); 
				if(text.length > 0 ) {
					conditions.push("contains(child::text(),'" + text + "')");
				}
			}
			
			// Get the element position
			index = Tellurium.getElementIndex(element);
			if(useIndex && (index !== 0)) {				
				conditions.push((conditions.length > 0) ? "position()=" + index : "" + index);				
			}

			// Create a temp xpath
			var tmpXpath = element.nodeName.toLowerCase();
			if(conditions.length > 0) {
				tmpXpath += "[";
				for(var j = 0; j < conditions.length - 1; j++) {
					tmpXpath += conditions[j] + " and ";
				}
				tmpXpath += conditions[conditions.length - 1] + "]";
			}
			
			// Check if xpath is unique for the top scene
			if(Tellurium._isXPathUnique("//" + tmpXpath + xpath, topScene)) {
				//console.error("*** XPATH IS UNIQUE: //" + tmpXpath + xpath);
				//return "//" + tmpXpath + xpath; // NP: Return only on id or root
			}
			// Use the position if there are no other conditions
			if((conditions.length === 0) && (index !== 0)) {
				tmpXpath += "[" + index + "]";
			}			
			
			// Otherwise keep xpath and move up to the parent
			xpath = "/" + tmpXpath + xpath;
			//console.error("*** XPATH MOVING UP: " + xpath);
		}
		
		element = element.parentNode;
		if(!element || (element === topScene)) {
			break;
		}
	}
	
	console.error("XPATH IS NOT UNIQUE: /" + xpath);
	return "/" + xpath;
};

/*
 * Highlight an element with a red border and a background color.
 */
Tellurium.highlightElement = function(locator, color) {
	// Remove any old div
	if(Tellurium.highlight) {
		var element = Tellurium.getElement(Tellurium.highlight.locator);
		if(element) {
			element.style.background = Tellurium.highlight.oldBackground;
			element.style.border = Tellurium.highlight.oldBorder;
		} 
		Tellurium.highlight = undefined;
	}
	// Empty locator will simply clear old highlight
	if(typeof(locator) === "string" && locator.length === 0) {
		return;
	}
	// Only work on proper locator
	if(locator) {
		var element = Tellurium.getElement(locator);
		var color = color || '#FF3';
		// Save old values
		Tellurium.highlight = {
			locator: locator,
			oldBackground: element.style.background,
			oldBorder: element.style.border
		};
		// Set highlight
		element.style.backgroundColor = color;
		element.style.border = '2px solid red';
		element.style.backgroundImage = 'none';
	}
};