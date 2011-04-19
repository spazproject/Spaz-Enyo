/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
(function(){
	enyo.requiresWindow = function(inFunction) {
		if (enyo.isBuiltin && windowTimeTasks) {
			windowTimeTasks.push(inFunction);
		} else {
			inFunction();
		}
	};

	var windowTimeTasks = [];

	enyo.hasWindow = function() {
		for (var i=0, h; h=windowTimeTasks[i]; i++) {
			h();
		}
		windowTimeTasks = null;
	};
})();
