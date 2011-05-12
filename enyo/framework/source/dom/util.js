/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @public

/**
	Populates a string template with data values.

	Returns a copy of _inText_, with macros defined by _inPattern_ replaced by
	named values in _inMap_.

	_inPattern_ may be omitted, in which case the default macro pattern is used. 
	The default pattern matches macros of the form

		{$name}

	Example:

		// returns "My name is Barney."
		enyo.macroize("My name is {$name}.", {name: "Barney"});

	Dot notation is supported, like so:

		var info = {
			product_0: {
				name: "Gizmo"
				weight: 3
			}
		}
		// returns "Each Gizmo weighs 3 pounds."
		enyo.macroize("Each {$product_0.name} weighs {$product_0.weight} pounds.", info);
*/
enyo.macroize = function(inText, inMap, inPattern) {
	var v, working, result = inText, pattern = inPattern || enyo.macroize.pattern;
	var fn = function(macro, name) {
		working = true;
		v = enyo.getObject(name, false, inMap);
		//v = inMap[name];
		return (v === undefined || v === null) ? "{$" + name + "}" : v;
	};
	var prevent = 0;
	do {
		working = false;
		result = result.replace(pattern, fn);
	// if iterating more than 100 times, we assume a recursion (we should throw probably)
	} while (working && (prevent++ < 100));
	return result;
};

//* @protected

// matches macros of form {$name}
enyo.macroize.pattern = /{\$([^{}]*)}/g;

enyo.easing = {
	cubicIn: function(n) {
		return Math.pow(n, 3);
	},
	cubicOut: function(n) {
		return Math.pow(n - 1, 3) + 1;
	},
	expoOut: function(n) {
		return (n == 1) ? 1 : (-1 * Math.pow(2, -10 * n) + 1);
	},
	quadInOut: function(n){
		n = n * 2;
		if(n < 1){ return Math.pow(n, 2) / 2; }
		return -1 * ((--n) * (n - 2) - 1) / 2;
	},
	linear: function(n) {
		return n;
	}
};

enyo.easedLerp = function(inT0, inDuration, inEasing) {
	var lerp = (new Date().getTime() - inT0) / inDuration;
	return lerp >= 1 ? 1 : inEasing(lerp);
};

//* @public

/**
	Takes a name/value mapping object and returns a string representing
	a URL-encoded version of that object.
	
	Example:

		{
			username: "foo",
			password: "bar"
		}
		
		"username=foo&password=bar"
*/
enyo.objectToQuery = function(/*Object*/ map) {
	var enc = encodeURIComponent;
	var pairs = [];
	var backstop = {};
	for (var name in map){
		var value = map[name];
		if (value != backstop[name]) {
			var assign = enc(name) + "=";
			if (enyo.isArray(value)) {
				for (var i=0; i < value.length; i++) {
					pairs.push(assign + enc(value[i]));
				}
			} else {
				pairs.push(assign + enc(value));
			}
		}
	}
	return pairs.join("&");
};

//* Generates a random integer greater than or equal to zero, but less than _inRange_.
enyo.irand = function(inRange) {
	return Math.floor(Math.random() * inRange);
};

/**
	Calls named method _inMethod_ (String) on _inObject_ with optional arguments _inArguments_ (Array), if the object and method exist.

		enyo.call(window.Worker, "doWork", [3, "foo"]);
*/
enyo.call = function(inObject, inMethod, inArguments) {
	if (inObject && inMethod) {
		var fn = inObject[inMethod];
		if (fn && fn.apply) {
			return fn.apply(inObject, inArguments || []);
		}
	}
};

/**
	Calls method _inMethod_ on _inScope_ asynchronously.  Uses
	_window.setTimeout_	with minimum delay, usually around 10ms.

	Additional arguments are passed directly to _inMethod_.
*/
enyo.asyncMethod = function(inScope, inMethod/*, inArgs*/) {
	return setTimeout(enyo.bind.apply(enyo, arguments), 1);
};

/**
	Calls method _inMethod_ on _inScope_ asynchronously.  Uses 
	_window.postMessage()_ if possible to get shortest possible delay.

	Additional arguments are passed directly to _inMethod_.
*/
enyo.nextTick = function(inScope, inMethod/*, inArgs*/) {
	return setTimeout(enyo.bind.apply(enyo, arguments), 1);
};

/* alternative implementation with lower latency if browser supports window.postMessage */
if (window.postMessage) {
	(function() {
		var methodQueue = [];

		function nextTick(inScope, inFn/*, inArgs*/) {
			methodQueue.push(enyo.bind.apply(enyo, arguments));
			window.postMessage("~~~enyo-nextTick~~~", "*");
		}
		
		function handleMessage(event) {
			if (event.source === window && event.data === "~~~enyo-nextTick~~~") {
				if (event.stopPropagation) { event.stopPropagation(); }
				(methodQueue.shift())();
			}
		}

		enyo.nextTick = nextTick;
		enyo.requiresWindow(function() {
				window.addEventListener('message', handleMessage, true);
			});
	})();
}

/**
	Invokes function _inJob_ after _inWait_ milliseconds have elapsed since the
	last time _inJobName_ was referenced.

	Jobs can be used to throttle behaviors. If some event can occur once or multiple
	times, but we want a response to occur only once every so many seconds, we can use a job.

		onscroll: function() {
			// updateThumb will be called but only when 1s has elapsed since the 
			// last onscroll
			enyo.job("updateThumb", enyo.bind(this, "updateThumb"), 1000);
		}
*/
enyo.job = function(inJobName, inJob, inWait) {
	enyo.job.stop(inJobName);
	enyo.job._jobs[inJobName] = setTimeout(function() {
		enyo.job.stop(inJobName);
		inJob();
	}, inWait);
};

/**
	Cancels the named job, if it has not already fired.
*/
enyo.job.stop = function(inJobName) {
	if (enyo.job._jobs[inJobName]) {
		clearTimeout(enyo.job._jobs[inJobName]);
		delete enyo.job._jobs[inJobName];
	}
};

// TODOC
(function(){
	// API is non-standard, so what enyo exposes may vary from 
	// web documentation for various browsers
	// in particular, requestAnimationFrame takes no arguments, and the callback receives no arguments
	// and we name the complement clearAnimationFrame (as opposed to cancelRequestAnimationFrame)
	var builtin = window.webkitRequestAnimationFrame;
	enyo.requestAnimationFrame = builtin ? enyo.bind(window, builtin) :
		function(inCallback) {
			return window.setTimeout(inCallback, Math.round(1000/60));
		};
	//
	var builtin = window.webkitCancelRequestAnimationFrame || window.clearTimeout;
	// API 
	enyo.cancelRequestAnimationFrame = enyo.bind(window, builtin);
})();

//* @public
/**
	Start a timer with the given name
*/
enyo.time = function(inName) {
	enyo.time.timers[inName] = new Date().getTime();
	enyo.time.lastTimer = inName;
};

/**
	Ends a timer with the given name and returns the number of milliseconds elapsed.
*/
enyo.timeEnd = function(inName) {
	var n = inName || enyo.time.lastTimer;
	var dt = enyo.time.timers[n] ? new Date().getTime() - enyo.time.timers[n] : 0;
	return (enyo.time.timed[n] = dt);
};

//* @protected
enyo.time.timers = {};
enyo.time.timed = {};

//* @protected
enyo.job._jobs = {};

//* @public
// string utils (needed so far)
enyo.string = {
	/** return string with white space at start and end removed */
	trim: function(inString) {
		return inString.replace(/^\s+|\s+$/g,"");
	},
	/** return string with leading and trailing quote characters removed, e.g. <code>"foo"</code> becomes <code>foo</code> */
	stripQuotes: function(inString) {
		var c0 = inString.charAt(0);
		if (c0 == '"' || c0 == "'") {
			inString = inString.substring(1);
		}
		var l = inString.length - 1, cl = inString.charAt(l);
		if (cl == '"' || cl == "'") {
			inString = inString.substr(0, l);
		}
		return inString;
	},
	/** return string where _inSearchText_ is case-insensitively matched and wrapped in a &lt;span&gt; tag with
		CSS class _inClassName_ */
	applyFilterHighlight: function(inText, inSearchText, inClassName) {	
		return inText.replace(new RegExp(inSearchText, "i"), '<span class="' + inClassName + '">$&</span>');
	},
	/** return string with ampersand, less-than, and greater-than characters replaced with HTML entities, 
		e.g. '<code>"This & That"</code>' becomes '&lt;code&gt;"This &amp;amp; That"&lt;/code&gt;' */
	escapeHtml: function(inHtml) {
		return inHtml ? inHtml.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;') : '';
	},
	/** return a text-only version of a string by using the DOM to write out HTML and read back plain text */
	removeHtml: function(inHtml) {
		if (!this.div) {
			this.div = document.createElement("div");
		}
		this.div.innerHTML = inHtml;
		return this.div.innerText;
	},
	/**
		Searches _inText_ for URLs (web and mailto) and emoticons (if supported), and returns a new string with those entities replaced by HTML links and images (respectively).
	
		Passing false for an  _inOptions_ field will prevent LunaSysMgr from HTML-izing that text type.

		Defaults:
		
			{
				phoneNumber: true,
				emailAddress: true,
				webLink: true,
				schemalessWebLink: true,
				emoticon: true
			}
	*/
	runTextIndexer: function(inText, inOptions) {
		if (inText === "") {
			return inText;
		}
		if (typeof PalmSystem !== "undefined" && PalmSystem.runTextIndexer) {
			return PalmSystem.runTextIndexer(inText, inOptions);
		}
		console.warn("enyo.string.runTextIndexer is not available on your system");
		return inText;
	},
	//* Encode a string to Base64
	toBase64: function(inText) { return window.btoa(inText); },
	//* Decode string from Base64. Throws exception on bad input.
	fromBase64: function(inText) { return window.atob(inText); }
};

if (!(window.btoa && window.atob)) {
	enyo.string.toBase64 = enyo.string.fromBase64 = function(inText) {
		console.error("Your browser does not support native base64 operations");
		return inText;
	};
}

/**
	Create an absolute url for use with XHR requests.

	**Note:** _inURL_ is assumed to be relative to _inWindow_.
*/
enyo.makeAbsoluteUrl =  function(inWindow, inUrl) {
	var absolute = new RegExp("^([a-z]+:/)?/");
	if (absolute.test(inUrl)) {
		return inUrl; // already absolute.
	} else {
		var parts = inWindow.location.href.split("/");
		parts.pop();
		parts.push(inUrl);
		return parts.join("/");
	}
};

//* @protected
enyo._$L = function(inText) {
	if (!this._enyoG11nResources) {
		this._enyoG11nResources = new enyo.g11n.Resources({root:"$enyo"});
	}
	return this._enyoG11nResources.$L(inText);
};

//* @protected
enyo.reloadG11nResources = function(){
	this._enyoG11nResources = new enyo.g11n.Resources({root:"$enyo"});
}

// return visible control dimensions unobscured by other content
enyo.getVisibleControlBounds = function(inControl) {
	var o = enyo.mixin(inControl.getBounds(), inControl.getOffset());
	var oh = o.top + o.height;
	var vh = enyo.getVisibleBounds().height;
	o.height -= Math.max(0, oh - vh);
	return o;
}

// return visible bounds of window unobscured by content like maybe a keyboard...
enyo.getVisibleBounds = function() {
	return {
		width: window.innerWidth,
		height: window.innerHeight
	};
}