/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected
/*
 * WIDGET SECTION
 */

// MENU WIDGET

/*
 * Turn on/off a menu.
 * @param {Object} menu
 * @param {Object} visible
*/
Tellurium.toggleMenu = function(menu) {
  return eval("Tellurium.enyo.windows.getActiveWindow().enyo.$."+menu+".toggleOpen()");
};

/*
*  turn on a menu.
*  @param {Object} menu
*  @param {Object} visible
*/

Tellurium.menuShow = function(menu) {
    return eval("Tellurium.enyo.windows.getActiveWindow().enyo.$."+menu+".show()");
    };

/*
*  turn on a menu.
*  @param {Object} menu
*  @param {Object} visible
*/

Tellurium.menuHide = function(menu) {
    return eval("Tellurium.enyo.windows.getActiveWindow().enyo.$."+menu+".hide()");
    };

/*
 * Checks if a mewnu is visible
 * @param {Object} menu
 */
Tellurium.isMenuVisible = function(menu) {
	var topScene = Tellurium._getTopScene();
	if(menu === "appMenu") {
		return topScene._menu.assistant.appMenuPopup ? true : false;
	} else {
		return topScene.getMenuVisible(Tellurium.mojo.Menu[menu]) ? true : false;
	}
};

/*
 * Turn on/off a menu.
 * @param {Object} menu
 * @param {Object} visible
 */
Tellurium.toggleMenuVisible = function(menu) {
	var topScene = Tellurium._getTopScene();
	if(menu === "appMenu") {
		topScene._menu.assistant.toggleAppMenu();
	} else {
		topScene.toggleMenuVisible(Tellurium.mojo.Menu[menu]);
	}
};

/*
 * Returns a list/array of commands available for the given menu.
 * Works in the current scene context. 
 * @param {Object} menu
 */
Tellurium.getMenuCommands = function(menu) {
	var commands = [];
	var items = [];
	var topScene = Tellurium._getTopScene();
	// Get the items for each menu
	if(menu === "appMenu") {
		// App menu is a little special as it is built at popup time
		// So we need to get the items from the popup (when it's up of course)
		if(Tellurium.isMenuVisible(menu)) {
			var elems = Tellurium.cloneArray(topScene._menu.assistant.appMenuPopup.querySelectorAll("[x-mojo-menu-cmd]"));
			elems.forEach(function(elem) {
				var cmd = elem.getAttribute('x-mojo-menu-cmd');
				if(cmd !== "") {
					commands.push(cmd);
				}
			});
			return commands;
		}
	} else if(menu === "viewMenu") {
		items = Tellurium.cloneArray(topScene._menu.assistant.viewModel.items);
	} else if(menu === "commandMenu") {
		items = Tellurium.cloneArray(topScene._menu.assistant.commandModel.items);
	}
	// Extract the commands from the items (recursive)
	var getCommands = function(items) {
		items.forEach(function(item) {
			if(item.items) {
				getCommands(item.items);
			} else if(item.command) {
				commands.push(item.command);
			}
		});
	};
	getCommands(items);
	
	return commands;
};

/*
 * Send a menu command event to the current stage.
 * The command is a string, usually one of the list
 * returned by getMenuCommand
 * FIXME: WE SHOULD TRY HARDER (I MEAN USING TAP EVENT)
 *  -> Get Menu div
 *  -> Go thru all children, check for _mojoMenuItemModel that matches the command
 *  -> Send a tap event to that element
 * 
 * @param {Object} command
 */
Tellurium.sendMenuCommand = function(command) {
	var event = Tellurium.Event.make(Tellurium.Event.command, {command: command});
	Mojo.Controller.stageController.sendEventToCommanders(event);
};

// LIST WIDGET



/*
 * gets index of the element from the list
 * @param {Object} locator
 * @param {Object} element
*/
Tellurium.getIndexFromList = function(locator,value) {                                       
  var element = document.querySelectorAll(locator);                                          
  var temp;                                                                                  
  for (var i=0;i<element.length;i++) {                                                           
    temp = element[i].innerHTML;                                                             
    if (temp.indexOf(value) != -1) {                                                         
        return i+1;                                                                          
    }                                                                                        
  }                                                                                          
  return -1;                                                                                 
};   


/*
 * Returns an array of elements from the list.
 * 
 * @param {Object} locator
 * @param {Object} start
 * @param {Object} length
 */
Tellurium.getListItems = function(locator, start, length) {
	var element = Tellurium.getElement(locator);
	if(element.getAttribute('x-mojo-element') === "FilterList" || element.getAttribute('x-mojo-element') === "IndexedFilterList") {
		element = element.mojo.getList();
	}
	// Check for old style
	if(element.getAttribute('x-mojo-element') === "IndexedList") {
		return element.mojo.getItems(start, length);
	} else if(element.getAttribute('x-mojo-element') === "List") {
		// Do something for the new list - tap in the data source?
		throw { message: "Not yet implemented!" };
	} else {
		throw { message: "Not a list!" };
	}
};

/*
 * Returns the length of the list
 * @param {Object} locator
 */
Tellurium.getListLength = function(locator) {
	var element = Tellurium.getElement(locator);
	if(element.getAttribute('x-mojo-element') === "FilterList" || element.getAttribute('x-mojo-element') === "IndexedFilterList") {
		element = element.mojo.getList();
	}
	// Check for old style
	if(element.getAttribute('x-mojo-element') === "IndexedList") {
		return element.mojo.getLength();
	} else if(element.getAttribute('x-mojo-element') === "List") {
		// Do something for the new list - tap in the data source?
		throw { message: "Not yet implemented!" };
	} else {
		throw { message: "Not a list!" };
	}
};

/*
 * Count the number of nodes using the xpath expression *
 * @param {Object} xpath
 */
Tellurium.getNodeCount = function(xpath) {
 	var item;
 	var count = 0;
 	var nodes = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
 	while(item = nodes.iterateNext()) {
  		count++;
 	}
 return count;
};

/*
 * Moves the list so that the item at the given index is visible.
 * 
 * @param {Object} locator
 */                                                

  Tellurium.revealListItem = function(locator) {    
      var revealItemsPosition = 200;   
      var metrics = Tellurium.getMetrics(locator);
      var scroller = Tellurium._getTopScene().getSceneScroller();
      scroller.mojo.scrollTo(undefined,scroller.mojo.getState().top-(-metrics.top + revealItemsPosition));
  };   
                            
/*
 * Moves the list so that the item at the given index is visible.
 * 
 * @param {Object} locator
 */                                                

  Tellurium.getListItemJsonObject = function(locator) {   
      var list=Tellurium.getElement("xpath=//div[contains(@x-mojo-element,'List')]");
      var element  =Tellurium.getElement(locator);
      return list.mojo.getModelFromNode(element);
  };
   
/*
 * Returns the metrics for a list item.
 * @param {Object} locator
 * @param {Object} index
 */
Tellurium.getListItemMetrics = function(locator, index) {
	var element = Tellurium.getElement(locator);
	if(element.getAttribute('x-mojo-element') === "FilterList" || element.getAttribute('x-mojo-element') === "IndexedFilterList") {
		element = element.mojo.getList();
	}
	// Check for old style
	if(element.getAttribute('x-mojo-element') === "IndexedList") {
		element = element.mojo.getNodeByIndex(index);
	} else if(element.getAttribute('x-mojo-element') === "List") {
		// Do something for the new list - tap in the data source?
		throw { message: "Not yet implemented!" };
	} else {
		throw { message: "Not a list!" };
	}	
	return Tellurium.getMetrics(element);
};

// TEXTFIELD WIDGET

Tellurium.textFieldGetValue = function(locator) {
	var element = Tellurium.getElement(locator);
	return element.mojo.getValue();
};

Tellurium.textFieldSetValue = function(locator, value) {
	var element = Tellurium.getElement(locator);
	if(element.mojo.setValue) {
		element.mojo.setValue(value);
	} else {
		element.mojo.setText(value);
	}
};

Tellurium.textFieldGetCursorPosition = function(locator) {
	var element = Tellurium.getElement(locator);
	return element.mojo.getCursorPosition();
};

Tellurium.textFieldSetCursorPosition = function(locator, start, end) {
	var element = Tellurium.getElement(locator);
	element.mojo.setCursorPosition(start, end);
};

//SCROLLER WIDGET

Tellurium.getScrollerPositionMetrics = function(scrollerLocator) {
	var scrollerTe = Tellurium.getElement(scrollerLocator);
	if (!scrollerTe) throw { message : "Tellurium.getScrollerPositionMetrics - scroller element not found (" + scrollerLocator + ")" };
	if (!scrollerTe.id) throw { message : "Tellurium.getScrollerPositionMetrics - scroller element found, but has no associated 'id' property (" + scrollerLocator + ")" };
	var metrics = {
		left: eval("Tellurium.enyo.windows.getActiveWindow().enyo.$."+scrollerTe.id+".getScrollLeft()"),
		top: eval("Tellurium.enyo.windows.getActiveWindow().enyo.$."+scrollerTe.id+".getScrollTop()")
	};
	return metrics;
};

Tellurium.scrollToBottom = function(scrollerLocator) {
	var scrollerTe = Tellurium.getElement(scrollerLocator);
	if (!scrollerTe) throw { message : "Tellurium.scrollToBottom - scroller element not found (" + scrollerLocator + ")" };
	if (!scrollerTe.id) throw { message : "Tellurium.scrollToBottom - scroller element found, but has no associated 'id' property." };
	var evalText = "Tellurium.enyo.windows.getActiveWindow().enyo.$."+scrollerTe.id+".scrollToBottom()";
	eval(evalText);
};

Tellurium.scrollToTop = function(scrollerLocator) {
	var scrollerTe = Tellurium.getElement(scrollerLocator);
	if (!scrollerTe) throw { message : "Tellurium.scrollToTop - scroller element not found (" + scrollerLocator + ")" };
	if (!scrollerTe.id) throw { message : "Tellurium.scrollToTop - scroller element found, but has no associated 'id' property." };
	var evalText = "Tellurium.enyo.windows.getActiveWindow().enyo.$."+scrollerTe.id+".scrollTo(0,0)";
	eval(evalText);
};

Tellurium.scrollToElement = function(scrollerLocator, elementLocator) {
	var scrollerTe = Tellurium.getElement(scrollerLocator);
	if (!scrollerTe) throw { message : "Tellurium.scrollToElement - scroller element not found (" + scrollerLocator + ")" };
	if (!scrollerTe.id) throw { message : "Tellurium.scrollToElement - scroller element found, but has no associated 'id' property." };
	var elementTe = Tellurium.getElement(elementLocator);
	if (!elementTe) throw { message : "Tellurium.scrollToElement - element not found (" + elementLocator + ")" };
	if (elementTe.offsetTop == undefined || elementTe.offsetTop == null)  throw { message : "Unable to determine the top location of elementLocator." };
	var evalText = "Tellurium.enyo.windows.getActiveWindow().enyo.$."+scrollerTe.id+".scrollTo("+elementTe.offsetTop+",0)";
	eval(evalText);
};

Tellurium.scrollToViewable = function(scrollerLocator, x, y) {
	var scrollerTe = Tellurium.getElement(scrollerLocator);
	if (!scrollerTe) throw { message : "Tellurium.scrollToElement - scroller element not found (" + scrollerLocator + ")" };
	if (!scrollerTe.id) throw { message : "Tellurium.scrollToElement - scroller element found, but has no associated 'id' property." };
	var evalText = "Tellurium.enyo.windows.getActiveWindow().enyo.$."+scrollerTe.id+".scrollTo("+y+","+x+")";
	eval(evalText);
};
