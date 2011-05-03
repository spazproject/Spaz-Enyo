/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
    name: "Main.CrossAppLaunch",
    kind: "VFlexBox",
    components:[
        { kind: "PageHeader", content: "Cross App Launch" },
        { style:"margin:30px;", components:[
        	{ kind: "HtmlContent", content: "Pressing the button below will launch & pass an argument to the CrossAppTarget application.<br />If the CrossAppTarget application is not found, you will see an error dialog.", style:"margin-bottom:30px;" },
        	{ kind: "RowGroup", caption: "Enter Text", components: [
		        { kind: "Input", hint: "Tap here to enter text", value: "Text to pass to CrossAppTarget", name: "inputField" },
				{ kind: "Button", caption: "Open CrossAppTarget App", onclick: "buttonClick" }
		    ]}
        ]},
        { 
			kind: "PalmService", 
			service: "palm://com.palm.applicationManager/", 
			method: "open", 
			name: "launchApplication", 
			onFailure: "toggleDialog"
		},
		{ name: "errorDialog", kind: "Dialog", components: [
			{ className: "enyo-item enyo-first", style: "padding: 12px", content: "CrossAppTarget Application Not Loaded"},
			{ className: "enyo-item enyo-last", style: "padding: 12px; font-size: 14px", content: "Please install the CrossAppTarget application and try again."},
			{ kind: "Button", caption: "OK", onclick: "toggleDialog"}
		]}
    ],
    buttonClick: function() {
    	this.$.launchApplication.call({
    		id: "com.palmdts.crossapptarget",
    		params: {
				userText: this.$.inputField.getValue()
			}
		});
    },
    toggleDialog: function() {
    	this.$.errorDialog.toggleOpen();
    }
});
