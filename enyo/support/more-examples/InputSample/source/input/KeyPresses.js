/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "input.KeyPresses",
	kind: HeaderView,
	components: [
		{ kind: "PageHeader", content: "KeyPresses", style: "font-size: 16px", disabled: true},
		{ kind: "RowGroup", caption: "Press some keys!", components:[
			{ kind: "Input", hint: "type something here", name: "txtInput",
				components: [
        			{kind: "Button", caption: "Clear Log", onclick: "clearLog", onmousedown: "dontFocus"}
        		]
			}
		]},
		{name: "txtResults"}
	],
	dontFocus: function (inSender, inEvent) {
		// Prevent button from taking focus away from input field
		inEvent.preventDefault();
	},
	alertMe: function(eventType, code) {
		var resultText = eventType +": " + code + ", Character: " + String.fromCharCode(code) + "<br />";
		if (eventType == "KeyUp") resultText += "<br />";
		this.$.txtResults.addContent( resultText );
	},
	clearLog: function() {
		this.$.txtResults.setContent("");
		this.$.txtInput.setValue("");
		this.$.txtInput.forceFocus();
	},
	keydownHandler: function(inSender, e) {
		this.alertMe("KeyDown", e.keyCode);
	},
	keypressHandler: function(inSender, e) {
		this.alertMe("KeyPress", e.keyCode);
	},
	keyupHandler: function(inSender, e) {
		this.alertMe("KeyUp", e.keyCode);
	}
});