/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "parse.XML",
	kind: HeaderView,
	components: [
		{name: "parseButton", kind: "Button", caption: "Parse XML", onclick: "parseXML"},
		{name: "postResponse", kind: "HtmlContent"},
		{name: "getGoogleResults", kind: "WebService",
				onSuccess: "gotResultsSuccess",
				onFailure: "gotResultsFailure"},
		{name: "errorDialog", kind: "Dialog", components: [
			{name:"errorMessage", style: "padding: 12px", content: ""},
			{kind: "Button", caption: "Close", onclick: "closeDialog"}
		]},
	],
	
	//Handles the search button by incorporating the search text into our web service URL, then initiating the request
	parseXML: function() {		
	
		this.items = [];
		this.path = "/artist/opml-feeds/opml-feed";
		this.url = 'http://feeds.rhapsody.com/u2/data.xml';
		this.$.getGoogleResults.url = this.url;
		this.$.getGoogleResults.call();
	},
	//success & failure callbacks for our web service
	gotResultsSuccess: function(inSender, inResponse) {
	//	this.results = inResponse.responseData.results;
	//	this.$.list.refresh();

//		this.$.postResponse.setContent(inResponse);
		
		// Use responseText, not responseXML!! try: reponseJSON 
		var xmlstring = inResponse;//transport.responseText;	

		// Convert the string to an XML object
		var xmlobject = (new DOMParser()).parseFromString(xmlstring, "text/xml");

		// Use xpath to parse xml object
		var nodes = document.evaluate(this.path, xmlobject, null, XPathResult.ANY_TYPE, null);

		var result = nodes.iterateNext();
		var i = 0;
		while (result)
		{
		  	// TODO: add list or partial here
		  	console.log("******* song name: " + result.attributes[0].nodeValue);
			this.items[i] = result.attributes[0].nodeValue;
			i++;
			result=nodes.iterateNext();
		}


		this.$.postResponse.setContent(this.items);
	},
	gotResultsFailure: function(inSender, inResponse) {
		this.$.errorMessage.setContent('Error')
		this.$.errorDialog.open();
	
		this.$.postResponse.setContent(inResponse);
	},
	//close the error dialog
	closeDialog: function() {
		this.$.errorDialog.close();
	},
});