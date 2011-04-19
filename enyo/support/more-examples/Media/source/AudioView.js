/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.AudioView",
	kind: "VFlexBox",
	events: {
		onBack: ""
	},
	components: [
		{name: "audioPane", flex: 1, kind: "Pane", onclick: "paneClick", transitionKind: "enyo.transitions.Simple", components: [
			{
				kind: HeaderView,
				onBack:'backHandler',
				title: "Audio",
				description: "You can use the built in audio app to play audio files or embed them yourself in a view.",
			 	components: [
					{kind: "HtmlContent", content: "NOTE: The emulator does not support audio playback."},
					{kind: "Button", caption: "Open Audio App", onclick: "open"},
					{kind: "Button", caption: "Launch Audio App", onclick: "launch"},
					{kind: "Button", caption: "Audio Object", onclick: "object"}
				]},
			{kind: "AudioObjectView",onBack:'backHandler'},
			{
				name: "audioApp", 
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
	open: function(inSender) {
		this.$.audioApp.call(
			{
				target : "/media/internal/ringtones/Flurry.mp3"
			},
			{
		    	method: "open"
			});
	},	
	launch: function(){
		this.$.audioApp.call(
			{
				id : 'com.palm.app.streamingmusicplayer',
				params: {
					target : '/media/internal/ringtones/Guitar.mp3'
				}
			},
			{
			   	method: "launch"
			});
	},	
	object: function(){
		this.$.audioPane.next()
	},
	openSuccess: function(inSender, inResponse) {
	    console.log("success: " + enyo.json.to(inResponse));
	},
	openFailure: function(inSender, inResponse){
	    console.log("failure: " + enyo.json.to(inResponse));		
	},
	backHandler: function(inSender, e) {
		if (inSender.kind == "AudioObjectView"){
			this.$.audioPane.back();
		} else
		{
			this.doBack();
		}
	}
});