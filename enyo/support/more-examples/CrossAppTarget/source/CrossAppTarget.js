/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
    name: "Main.CrossAppTarget",
    kind: "VFlexBox",
    components:[
        { kind: "PageHeader", content: "Cross App Target" },
        { style:"margin:30px;", components:[
        	{ kind: "RowGroup", caption: "Text captured from Cross-App Launch", components: [
		        { kind: "Input", hint: "", value: "", name: "outputField", disabled: true }
		    ]}
        ]}
    ],
    // called when app is opened or reopened
    windowParamsChangeHandler: function() {
    	// capture any parameters associated with this app instance
    	var params = enyo.windowParams;
    	this.$.outputField.setValue(params.userText);
    }
});
