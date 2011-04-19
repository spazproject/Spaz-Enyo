/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
enyo.Object implements the property publishing system for Components.
Published properties are declared by providing a _published_ property within a call to
_enyo.kind_. Getter and setter methods are automatically generated for
properties declared in this manner.

	enyo.kind({
		name: "MyObject",
		kind: enyo.Object,

		// declare 'published' properties
		published: {
			myValue: 3
		},

		// these methods will be automatically generated:
		//	getMyValue: function() ...
		//	setMyValue: function(inValue) ...

		// optional method that is fired whenever setMyValue is called
		myValueChanged: function(inOldValue) {
			this.delta = this.myValue - inOldValue;
		}
	});

In the above example, _myValue_ becomes a regular property on the MyObject
prototype (with a default value of 3), and the getter and setter methods are generated
as noted in the comments.

	myobj = new MyObject();
	var x = myobj.getMyValue(); // x gets 3

You may choose to declare a _changed_ method to observe set calls on a property. 
The _myValueChanged_ method in the example above is called whenever _setMyValue_ is called.

	myobj.setMyValue(7); // myValue becomes 7; myValueChanged side-effect sets delta to 4

_Changed_ methods are called whenever setters are invoked, whether the actual value has changed
or not.

You may also implement a propertyChanged method. propertyChanged will be called whenever any
setter is called.

	propertyChanged: function(inName, inValue, inOldValue) {
		// property inName was set to inValue (formerly had inOldValue)
	}

Note that published properties are stored as regular properties on the object prototype, so it's possible
to query or set their values directly (but changed methods are not called if you set a property directly).

	var x = myobj.myValue;

enyo.Object also provides some utility functions for all of its subkinds.
*/
enyo.kind({
	name: "enyo.Object",
	//* @protected
	constructor: function() {
		enyo._objectCount++;
	},
	destroyObject: function(inName) {
		if (this[inName] && this[inName].destroy) {
			this[inName].destroy();
		}
		this[inName] = null;
	},
	getProperty: function(n) {
		return this[n];
	},
	setProperty: function(n, v) {
		var old = this.getProperty(n);
		this[n] = v;
		if (this.propertyChanged) {
			this.propertyChanged(n, v, old);
		}
		n += "Changed";
		if (this[n]) {
			this[n](old); 
		}
	},
	// abstract
	//propertyChanged: function(n, v, old) {
	//},
	__console: function(inMethod, inArgs) {
		if (window.console) {
			if (console.firebug) {
				// let firebug be fancy
				console[inMethod].apply(console, inArgs);
			} else {
				// let others be plain
				console.log(inArgs.join(" "));
			}
		}
	},
	_console: function(inMethod, inArgs) {
		var a$ = [];
		for (var i=0, l=inArgs.length, a; (a=inArgs[i]) || i<l; i++) {
			if (String(a) == "[object Object]") {
				a = enyo.json.stringify(a);
			}
			a$.push(a);
		}
		this.__console(inMethod, [inArgs.callee.caller.nom + ": "].concat(a$));
		//this.__console(inMethod, [inArgs.callee.caller.nom + ": "].concat(enyo.cloneArray(inArgs)));
	},
	//* @public
	/**
		Sends a log message to the console, prepended with the name of the kind and method from which log was invoked. Multiple arguments are coerced to String and joined with spaces.

			enyo.kind({
				name: "MyObject",
				kind: enyo.Object,
				hello: function() {
					this.log("says", "hi");
					// shows in the console: MyObject.hello: says hi
				}
			});
	*/
	log: function() {
		this._console("log", arguments);
	},
	//** Same as _log_, except uses the console's warn method (if it exists).
	warn: function() {
		this._console("warn", arguments);
	},
	//** Same as _log_, except uses the console's error method (if it exists).
	error: function() {
		this._console("error", arguments);
	}
});

//* @protected

enyo._objectCount = 0;

enyo.Object.subclass = function(ctor, props) {
	this.publish(ctor, props);
};

enyo.Object.publish = function(ctor, props) {
	var pp = props.published;
	if (pp) {
		var cp = ctor.prototype;
		for (var n in pp) {
			enyo.Object.addGetterSetter(n, pp[n], cp);
		}
	}
};

enyo.Object.addGetterSetter = function(inName, inValue, inProto) {
	var priv_n = inName;
	inProto[priv_n] = inValue;
	//
	var cap_n = inName.slice(0, 1).toUpperCase() + inName.slice(1);
	var get_n = "get" + cap_n;
	if (!inProto[get_n]) {
		inProto[get_n] = function() { 
			return this.getProperty(priv_n); 
		};
	}
	//
	var set_n = "set" + cap_n;
	if (!inProto[set_n]) {
		inProto[set_n] = function(v) { 
			this.setProperty(priv_n, v); 
		};
	}
};
