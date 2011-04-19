/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.AudioObjectView",
	kind: HeaderView,
	title: "Embedded Audio",
	description: "This is a subset of what you can do with direct audio object manipulation.",
	components: [
			{kind: "VFlexBox", components: [
				{name:"playButton", kind: "Button", caption: "Play", onclick: "play"},
				{kind: "Button", caption: "Stop", onclick: "stop"},
				{name:"loopButton", kind: "Button", caption: "Loop", onclick: "loop"}
			]},
			{name: "sound", kind: "Sound", src: "/media/internal/ringtones/Triangle (short).mp3", preload:true}
	],
	create: function() {
		this.inherited(arguments);
	},
	play: function() {
		this.$.sound.play();					
		this.$.playButton.setCaption('Play')
	},
	stop: function() {
		this.$.sound.audio.pause();
		if (this.$.playButton.getCaption() == "Play"){			
			this.$.playButton.setCaption('Resume')
		}
	},
	loop: function(inSender, inResponse) {
		if (this.$.loopButton.getCaption() == "Loop"){
			this.$.sound.audio.loop = true;			
			this.$.loopButton.setCaption('Turn off Looping')
		} else {
			this.$.sound.audio.loop = false;			
			this.$.loopButton.setCaption('Loop')
		}

	}
});