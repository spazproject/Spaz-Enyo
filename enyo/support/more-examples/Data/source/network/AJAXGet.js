/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "network.AJAXGet",
	kind: HeaderView,
	components: [
		{kind: "RowGroup", caption: "Enter Search Text", components: [
			{name: "searchText", kind: "Input", hint: "Enter text to search here"}
		]},
		{name: "parseButton", kind: "Button", caption: "Search Google", onclick: "search"},
		{name: "getGoogleResults", kind: "WebService",
				onSuccess: "gotResultsSuccess",
				onFailure: "gotResultsFailure"},
		{name: "list", kind: "VirtualList", flex: 1, onSetupRow: "listSetupRow", components: [
				{kind: "Item", layoutKind: "VFlexLayout", onclick: "launchBrowser", components: [
					{name: "itemTitle"},
					{name: "itemURL"}
				]}
		]},
		{name: "errorDialog", kind: "Dialog", components: [
			{name:"errorMessage", style: "padding: 12px", content: ""},
			{kind: "Button", caption: "Close", onclick: "closeDialog"}
		]},
		{
			name: "openBrowser", 
			kind: enyo.PalmService,
		    service: "palm://com.palm.applicationManager/",
		    method: "open",
		    onSuccess: "openSuccess",
		    onFailure: "openFailure",
		}
	],
	//Handles the search button by incorporating the search text into our web service URL, then initiating the request
	search: function() {		
		var searchTerm = this.$.searchText.getValue();
		
		if (searchTerm == ""){
			this.$.errorMessage.setContent('You need to enter some text to search for.')
			this.$.errorDialog.open();
		}
		// Use url to access the Google AJAX search API.
		var url = 'http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=' + encodeURIComponent(searchTerm);
		this.$.getGoogleResults.url = url;
		this.$.getGoogleResults.call();
	},
	//success & failure callbacks for our web service
	gotResultsSuccess: function(inSender, inResponse) {
		this.results = inResponse.responseData.results;
		this.$.list.refresh();
	},
	gotResultsFailure: function(inSender, inResponse) {
		this.$.errorMessage.setContent('Search Failed')
		this.$.errorDialog.open();
	},
	
	//close the error dialog
	closeDialog: function() {
		this.$.errorDialog.close();
	},
	//Our standard list setup functions
	create: function() {
		this.inherited(arguments);
		this.results = [];
	},
	listSetupRow: function(inSender, inRow) {
		var r = this.results[inRow];
		if (r) {
			this.$.itemTitle.setContent(r.title);
			this.$.itemURL.setContent(r.url);
			return true;
		}
	},
	//If the user taps an result in the list then launch the browser to the associated URL
	launchBrowser: function(inSender, inEvent, inRowIndex) {
		this.$.list.select(inRowIndex);  //shouldn't this do something??
		console.log(this.results[inRowIndex].url)
		this.$.openBrowser.call(
			{
		       id:     'com.palm.app.browser',
               params: {
	                     target: this.results[inRowIndex].url
                       }           
			});		
	},
	openSuccess: function(inSender, inResponse) {
	    console.log("success: " + enyo.json.to(inResponse));
	},
	openFailure: function(inSender, inResponse){
	    console.log("failure: " + enyo.json.to(inResponse));		
	}
});