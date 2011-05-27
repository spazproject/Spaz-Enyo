/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "MessageBox",
	kind: "ModalDialog",
	className: "enyo-popup enyo-modaldialog print-dialog",
	published: {
		message: ""
 	},
	components: [
		{kind: "HFlexBox", pack: 'center', align: 'center', components: [
			{name: "icon", kind: "Image", src: enyo.path.rewrite("$enyo-lib/printdialog/images/warning.png")},
			{name: "message", content: "", flex: 1, className: "messagebox-message"}
		]},
		{height: "20px"},
		{kind: "VFlexBox", pack: 'justify', align: 'center', components: [
			{kind: "Button", caption: "Close", onclick: "clickClose"}
		]}
	],
	
	//* @protected
	componentsReady: function() {
 		this.inherited(arguments);
 		this.messageChanged();
 	},
	messageChanged: function() {
		this.$.message.setContent(this.message);
	},
 	clickClose: function() {
 		this.close();
 	},
 	
 	//* @public
 	showMessage: function(inMessage) {
		// Make sure all components are created
		this.validateComponents();
		
		if (inMessage) {
			this.setMessage(inMessage);
		}
 		this.openAtCenter();
 	}
});
