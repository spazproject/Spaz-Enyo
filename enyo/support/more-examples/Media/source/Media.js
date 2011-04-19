/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "Media",
	kind: enyo.VFlexBox,
	components: [
		{name: "mainPane", flex: 1, kind: "Pane", onclick: "paneClick", transitionKind: "enyo.transitions.Simple", components: [
			{kind:"VFlexBox", components: [
				{kind: "PageHeader", components: [
					{kind: "VFlexBox", flex: 1, components: [
						{content: "Media"},
						{content: "Demonstrates using the built in media applications and using the audio/video objects directly", style: "font-size: 14px"}
					]},
				]},
				{kind: "Button", caption: "Audio", onclick: "audioView"},
				{kind: "Button", caption: "Video", onclick: "videoView"},
			]},
			{name: "audioView", kind: "AudioView", onBack:"backHandler"},
			{name: "videoView", kind: "VideoView", onBack:"backHandler"},
		]}
	],
	create: function() {
		this.inherited(arguments);
	},
	audioView: function(){
		this.$.mainPane.selectViewByName("audioView");
	},	
	videoView: function(){
		this.$.mainPane.selectViewByName("videoView");
	},
	backHandler: function(inSender, e) {
		this.$.mainPane.back();
	}
});	