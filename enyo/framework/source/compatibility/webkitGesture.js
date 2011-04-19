/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
//* @protected

// add iPhone OS-specific gesture feature
enyo.dispatcher.features.push(
	function(e) {
		//console.log("iphoneGesture processing ", e.type);
		if (enyo.iphoneGesture[e.type]) {
			enyo.iphoneGesture[e.type](e);
		}
	}
);

enyo.iphoneGesture = {
	_send: function(inType, inTouch) {
		//console.log("iphoneGesture._send:", inType);
		//console.log(inTouch.target.tagName);
		var synth = {
			type: inType,
			preventDefault: enyo.nop
		};
		enyo.mixin(synth, inTouch);
		enyo.dispatch(synth);
	},
	touchstart: function(e) {
		this._send("mousedown", e.changedTouches[0]);
		e.preventDefault();
	},
	touchmove: function(e) {
		this._send("mousemove", e.changedTouches[0]);
	},
	touchend: function(e) {
		this._send("mouseup", e.changedTouches[0]);
		this._send("click", e.changedTouches[0]); 
	},
	connect: function() {
		document.ontouchstart = enyo.dispatch; 
		document.ontouchmove = enyo.dispatch; 
		document.ontouchend = enyo.dispatch;
	}
};

enyo.iphoneGesture.connect();