AppUI = {
	addFunction: function(inName, inFunction, inScope){
		AppUI[inName] = enyo.bind(inScope || this, inFunction); //create the function with proper scope
		AppUI[inName + "Handler"] = function(){ //create "Handler" version of function that ignores the first "inSender" argument;
			AppUI[inName](arguments[1] || null, arguments[2] || null, arguments[3] || null);
		}
	}
};
	//setup the namespace. These are global references to component-owned functions, so they are set up in the components.
	/* 
	syntax:
		functionName
			(argument1, argument2, argument3)
			- what the function does
			- where it is setup

	available functions:

		refresh
			() 
			- refresh all columns 
			- source/javascript/Sidebar.js 
		viewUser
			(inUsername, inService, inAccountId)
			- show the userView
			- source/javascript/Spaz.js
		viewEntry
			(inEntry)
			- show entryView
			- source/javascript/Spaz.js
		reply
			(inEntry)
			- show composePopup in reply to inEntry
			- source/javascript/Spaz.js
		search
			(inQuery, inAccountId)
			- create search column 
			- source/javascript/Container.js

	*/