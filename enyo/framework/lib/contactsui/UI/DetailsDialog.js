/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, document, enyo, console, $L, crb */

enyo.kind({
	name		: "com.palm.library.contactsui.detailsDialog",
	kind		: "ModalDialog",
	layoutKind	: "VFlexLayout",
	scrim		: true,
	//height		: "500px",
	caption		: crb.$L("Contact Detail"),

	events:
	{	
		onEdit: "",
		onAddToExisting: "",
		onAddToNew: "",
		onDone: "",
		onDoneCreatingPersonObjects: "",
		onRenderPersonComplete: "",
		onCancelClicked: ""
	},

	published:
	{
	},

	components: [
		{kind: "Control", height: "300px", layoutKind: "VFlexLayout", className: "", components: [
			{name: "detailsWrapper", flex: 1, kind: "VFlexBox", components: []}
		]},
		{kind: "Control", layoutKind: "HFlexLayout", components: [
			{kind: "Button", name: "contactsDialogBack", flex: 1, caption: crb.$L("Back"), onclick: "backClicked", showing: false}, //multi-scene button
			{kind: "Button", name: "contactsDialogCancel", flex: 1, caption: crb.$L("Close"), onclick: "cancelClicked"}
		]}
	], //VFlexBox container for personListWidget did not work out; add components dynamically to component list in create() only!

	componentsReady: function () {
		this.inherited(arguments);
		this.$.detailsWrapper.createComponent({kind: "com.palm.library.contactsui.detailsInDialog", 
			name: "detailsInDialog", 
			//width: "320px", 
			//height: "100%",
			flex: 1,
			showButtonsHideBar: true,
			owner: this,
			onEdit: "doEdit",
			onAddToExisting: "doAddToExisting",
			onAddToNew: "doAddToNew",
			onDone: "doDone",
			onDoneCreatingPersonObjects: "doDoneCreatingPersonObjects",
			onRenderPersonComplete: "doRenderPersonComplete"
		});
	},
	
	open: function () {
		this.inherited(arguments);
	},	
	cancelClicked: function () {
		this.doCancelClicked();
	},
	setPersonId: function (personId) {
		this.$.detailsInDialog.setPersonId(personId);
	},
	setContact: function (rawContact) {
		this.$.detailsInDialog.setContact(rawContact);
	}
	
});		
