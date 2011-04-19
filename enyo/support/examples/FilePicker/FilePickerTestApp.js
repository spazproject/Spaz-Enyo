/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "FilePickerTestApp",
	kind: enyo.VFlexBox,
	components: [
		{kind: "PageHeader", content: "This is an app which uses the FilePicker to select a file."},
		{kind: "Button", caption: "Show FilePicker", onclick: "showFilePicker"},
		
		{flex:1, name: "selectedFiles"},
		
		{name:'filePicker', kind: "FilePicker", fileType:["image"], allowMultiSelect:false, onPickFile: "handleResult"},
		
		//To select Audio and Documents
		//{name:'filePicker', kind: "FilePicker", fileType:["audio", "document"], allowMultiSelect:true, onPickFile: "handleResult"}
		
		//To Select Ringtons
		//curretRingtonePath is an optional except for Sounds and Alerts.
		//{name:'filePicker', kind: "FilePicker", fileType:["ringtone"], currentRingtonePath:"/media/internal/ringtones/Pre.mp3", onPickFile: "handleResult"}
	],
	
	showFilePicker: function(inSender, inEvent) {
		this.$.filePicker.pickFile();
	},
	
	handleResult: function(inSender, msg) {
		this.$.selectedFiles.setContent("Selected Files : "+enyo.json.stringify(msg));
	}
	
});