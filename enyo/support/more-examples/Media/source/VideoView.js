/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.VideoView",
	kind: "VFlexBox",
	events: {
		onBack: ""
	},
	components: [
		{name: "videoPane", flex: 1, kind: "Pane", onclick: "paneClick", transitionKind: "enyo.transitions.Simple", components: [
			{
				kind: HeaderView,
				title: "Video",
				onBack:'backHandler',
				description: "You can use the built in video app to display videos or embed them yourself in a view.",
				components: [
					{kind: "HtmlContent", content: "The emulator does not support video playback.  Also there is not a video app included with the emulator currently so the video app will not launch."},
					{kind: "Button", caption: "Launch Video App", onclick: "launch"},
					{kind: "Button", caption: "Video Object", onclick: "object"}
			]},
			{kind: "VideoObjectView",onBack:'backHandler'},
			{
				name: "videoApp", 
				kind: enyo.PalmService,
			    service: "palm://com.palm.applicationManager/",
			    onSuccess: "openSuccess",
			    onFailure: "openFailure",
			}
		]}
	],
	create: function() {
		this.inherited(arguments);
	},	
	launch: function(){
		this.$.videoApp.call(
			{
				id : 'com.palm.app.photos',
				params: {
					target : 'http://cdn.kaltura.org/apis/html5lib/kplayer-examples/media/bbb_trailer_iphone270P.m4v'
				}
			},
			{
			   	method: "launch"
			});
	},	
	object: function(){
		//set the orientation for landscape
		var orientation = "left";
        enyo.setAllowedOrientation(orientation);
		this.$.videoPane.next()
	},
	openSuccess: function(inSender, inResponse) {
	    console.log("success: " + enyo.json.to(inResponse));
	},
	openFailure: function(inSender, inResponse){
	    console.log("failure: " + enyo.json.to(inResponse));		
	},
	backHandler: function(inSender, e) {
		if (inSender.kind == "VideoObjectView"){
			 //allow free orientation
			 enyo.setAllowedOrientation("free");
			this.$.videoPane.back();
		} else
		{
			this.doBack();
		}
	}
});