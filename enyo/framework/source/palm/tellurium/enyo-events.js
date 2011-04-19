/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
// setup Tellurium notification for enyo dom and custom events
Tellurium.events = {
	setup: function() {
		this.dom.setup();
		this.enyo.setup();
	}
}

// dom events
Tellurium.events.dom = {
	// valid types are those handled by enyo.dispatcher
	// type values must map to a handler named: <make + cap(type) + Payload>
	types: {
		keyup: "key",
		keydown: "key",
		keypress: "key",
		mouseup: "mouse", 
		mousedown: "mouse",
		mousehold: "mouse",
		mouserelease: "mouse",
		click: "mouse",
		flick: "flick",
		dragStart: "drag"
		// enyo does not support these events
		//tap
		//hold
		//holdEnd
		//dragEnd
		//listTap
		//listDelete
	},
	setup: function() {
		// Dispatcher feature for telling Tellurium about DOM events.
		enyo.dispatcher.features.push(function(e) {
			var type = Tellurium.events.dom.types[e.type];
			if (type) {
				Tellurium.events.dom.handle(type, e);
			}
		});
	},
	handle: function(inType, inEvent) {
		var method = "make" + enyo.cap(inType) + "Payload";
		var fn = this[method];
		if (fn) {
			var payload = fn.call(this, inEvent);
			// always include the dispatch target id, if available.
			payload.id = inEvent.dispatchTarget && inEvent.dispatchTarget.id;
			Tellurium.notifyEvent(payload);
		}
	},
	// Process details
	mixinPayloadDetails: function(inPayload, inEvent, inDetails) {
		for (var i in inDetails) {
			inPayload[i] = inEvent[i];
		}
		return inPayload;
	},
	// Key payload
	keyDetails: {
		type: true,
		keyCode: true,
		keyIdentifier: true,
		ctrlKey: true,
		altKey: true,
		shiftKey: true,
		metaKey: true
	},
	makeKeyPayload: function(inEvent) {
		var payload = {};
		if (inEvent.target & inEvent.target.getStyle) {
				payload.lineFeed = (inEvent.target.getStyle("-webkit-user-modify") == "read-write");
		}
		return this.mixinPayloadDetails(payload, inEvent, this.keyDetails);
	},
	// Mouse payload
	mouseDetails: {
		type: true,
		detail: true,
		screenX: true,
		screenY: true,
		pageX: true,
		pageY: true,
		clientX: true,
		clientY: true,
		ctrlKey: true,
		altKey: true,
		shiftKey: true,
		metaKey: true,
		button: true
	},
	makeMousePayload: function(inEvent) {
		return this.mixinPayloadDetails({}, inEvent, this.mouseDetails);
	},
	makeFlickPayload: function(inEvent) {
	payload = {velocity: inEvent.velocity};
	return this.mixinPayloadDetails(payload, inEvent, this.mouseDetails);
	},
	makeDragPayload: function(inEvent) {
		var payload = enyo.clone(inEvent);
		delete payload.target;
		return payload;
	}
}

// enyo events
Tellurium.events.enyo = {
	types: {
		onSelectView: enyo.Pane
	},
	setup: function() {
		for (var i in this.types) {
			this.setupHandler(this.types[i].prototype, i);
		}
	},
	// wrap event handler so it can be sent to Tellurium.
	setupHandler: function(inPrototype, inName) {
		var kind = inName.slice(2);
		var payloadHandler = "make" + kind + "Payload";
		fn = this[payloadHandler];
		var m = "do" + enyo.cap(kind);
		var o = inPrototype[m];
		if (fn) {
			this.wrapEvent(inPrototype, m, o, inName, fn);
		}
	},
	wrapEvent: function(inPrototype, inMethod, inOriginal, inName, inPayloadHandler) {
		inPrototype[inMethod] = function() {
			var payload = inPayloadHandler.apply(this, arguments);
			// always include event name
			payload.type = inName;
			Tellurium.notifyEvent(payload);
			return inOriginal.apply(this, arguments);
		}
	},
	makeSelectViewPayload: function(inView, inLastView) {
		return {pane: this.id, view: inView.id, lastView: inLastView && inLastView.id};
	}
}