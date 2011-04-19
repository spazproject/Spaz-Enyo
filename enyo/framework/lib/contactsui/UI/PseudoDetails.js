/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, enyo, console, $L */

/* 
 * How to use this component.
 * ==========================
 * 
 * First, you must add the contactsui library to your depends file, like so:

enyo.depends(
	"$enyo-lib/contactsui/"
);

 * 
 * Add the PseudoDetails kind to your components:
 *
	components: [
		{name: "PseudoDetails", kind: "com.palm.library.contactsui.pseudoDetails", flex: 1,
        onEdit: "edit", onAddToExisting: "addToExisting", onAddToNew: "addToNew", onDone: "done", showDone: false}
	],

 * The events that can be specified are:
 *   onEdit: Called when the user clicks the "Edit" button
 *   onAddToExisting: Called when the user chooses the "Add to existing contact" button
 *   onAddToNew: Called when the user chooses the "Add to new contact" button
 *   onDone: Called when the user taps the "done" button
 * 
 * Additionally, "showDone" can be set to false if you do not want the "Done" command menu button displayed
 * 
 * There are two ways to populate the details:
 * 1) by supplying a personId.  The details will be populated by looking up the persons details in the database.
 * 2) by supplying a contact object.  Use this if the contact is not in the database.
 *
 * The corresponding sample functions are below:
 *
	showPseudoDetailsPerson: function (personId) {
		this.$.PseudoDetails.setPersonId(personId);
	},
	showPseudoDetailsContactObject: function () {

		var firstname = "Glen",
			lastname	= "Quagmire",
			email = "glen.quagmire@palm.com",
			contact		= this.$.PseudoDetails.createContactDisplay(),
			contactName	= contact.getName();

		contactName.setGivenName(firstname);
		contactName.setFamilyName(lastname);
		contact.getEmails().add(new ContactsLib.EmailAddress({value: email}));

		this.$.PseudoDetails.setContact(contact);
	},

 *
 * If you would like it to display in a popup, here is some sample code:
 *
		{name: "contactDetailsPopup", kind: enyo.Popup, scrim: true, components: [
			{name: "contactDetails", kind: "com.palm.library.contactsui.pseudoDetails", width:"375px", height:"400px"}
		]},


*/
enyo.kind({
	name: "com.palm.library.contactsui.pseudoDetails",
	kind: "VFlexBox",
	className: "enyo-bg",
	person: null,
	showDone: true,
	published: {
		personId: null,
		contact: null
	},
	events: {
		onEdit: "",
		onAddToExisting: "",
		onAddToNew: "",
		onDone: ""
	},
	components: [
		{ kind: "PalmService", service: "palm://com.palm.applicationManager/", components: [
			{name: "launchApp", method: "launch"},
			{name: "openApp", method: "open"},
			{name: "getDefaultMapApp", method: "listAllHandlersForUrl"}
		]},

		{name: "AllDetails", kind: "Scroller", showing: false, flex: 1, components: [
			{kind: "Control", className: "details-header", onclick: "photoClick", onmousedown: "photoMousedown", onmouseup: "photoMouseup", components: [
				{name: "photo", className: "details-header-photo", components: [
					{name: "photoImage", kind: "Image", src: ""},
					{name: "linkCounter", className: "details-header-link"}
				]},
				{kind: "Control", className: "details-header-title", components: [
					{name: "title"},
					{name: "nickname", className: "details-header-nickname"},
					{name: "desc", className: "details-header-desc"}
				]}
			]},
			{name: "linkPanel", kind: "enyo.Drawer", open: false},
			{name: "emailGroup", kind: "com.palm.library.contactsui.FieldGroup", onFieldClick: "emailFieldClick"},
			{name: "phoneGroup", kind: "com.palm.library.contactsui.FieldGroup", onFieldClick: "phoneFieldClick"},
			{name: "imGroup", kind: "com.palm.library.contactsui.FieldGroup", onFieldClick: "imFieldClick"},
			{name: "addressGroup", kind: "com.palm.library.contactsui.FieldGroup", onGetFieldValue: "getAddressFieldValue", onFieldClick: "addressFieldClick"},
			{name: "urlGroup", kind: "com.palm.library.contactsui.FieldGroup", onFieldClick: "urlFieldClick"},
			{name: "notesGroup", kind: "com.palm.library.contactsui.FieldGroup", onGetFieldValue: "getNotesFieldValue", onGetFieldType: "getNotesFieldType"},
			{name: "moreDetailsGroup", kind: "com.palm.library.contactsui.FieldGroup", propertyName: "moredetails", onGetFieldValue: "getMoreDetailsValue"},
			{style: "height: 48px;"}
		]},
		{name: "CommandMenu", kind: "Toolbar", className: "bottom-menu-panel", showing: false, pack: "justify", components: [
			{name: "doneButton", content: $L("Done"), onclick: "doDone"},
			{name: "favoriteBtn", icon: "$contactsui_path/images/menu-icon-favorites.png", onclick: "toggleFavorite", showing: false},
			{kind: "Control"},
			{name: "editButton", content: $L("Edit"), onclick: "editPerson"},
			{name: "addToContactButton", content: $L("Add to contacts"), onclick: "addToContactClick"}
		]},
		{name: "SelectAContact", kind: "VFlexBox", flex: 1, pack: "center", showing: true, style: "text-align: center; color: grey;", components: [
			{kind: "Image", src: "images/first-launch-contacts.png"},
			{content: $L("Select a contact on the left")},
			{content: $L("to see more information.")}
		]},
		{name: "AddToContactsDialog", kind: "Dialog", components: [
			//{name: "DeleteDialogTitle", className: "enyo-item enyo-first", style: "padding: 12px", content: ""},
			{kind: "Button", caption: $L("Add New Contact"), onclick: "addNewContactClick"},
			{kind: "Button", caption: $L("Add to existing"), onclick: "addToExistingClick"},
			{kind: "Button", className: "enyo-button-light", caption: $L("Cancel"), onclick: "cancelAction"}
		]}
	],
	create: function () 
	{
		this.inherited(arguments);

		this.$.linkCounter.hide();
		this.$.addToContactButton.hide();
		if (!this.showDone)
			this.$.doneButton.hide();
	},
	cancelAction: function (inSender) {
		this.$.AddToContactsDialog.toggleOpen();
	},
	launchContacts: function (params)
	{
		this.$.launchApp.call({
			id: "com.palm.app.contacts", 
			params: params
		});
	},
	addNewContactClick: function (inSender) 
	{
		this.launchContacts(
			{
				contact: this.contact.getDBObject(),
				launchType: "newContact"
			}
		);

		this.$.AddToContactsDialog.toggleOpen();
		this.doAddToNew();
	},
	addToExistingClick: function (inSender) 
	{
		this.launchContacts(
			{
				person: this.person.getDBObject(),
				launchType: "addToExisting"
			}
		);

		this.$.AddToContactsDialog.toggleOpen();
		this.doAddToExisting();
	},
	showDetails: function (show) 
	{
		this.$.AllDetails.setShowing(show);
		this.$.CommandMenu.setShowing(show);
		this.$.SelectAContact.setShowing(!show);
	},
	contactChanged: function () 
	{
		this.$.addToContactButton.show();
		this.$.editButton.hide();
		this.person = ContactsLib.PersonFactory.createPersonDisplay(this.contact);
		this.personId = null;
		this.renderPerson();
	},
	personIdChanged: function () {
		var personFuture;

		this.$.addToContactButton.hide();
		this.$.editButton.show();

		if (!this.personId)
		{
			this.showDetails(false);
			return;
		}
	
		personFuture = ContactsLib.Person.getDisplayablePersonAndContactsById(this.personId);
		personFuture.then(this, function (personFuture) {
			try {
				this.person = personFuture.result || {};

				this.renderPerson();
			} catch (e) {
				console.log("person failed: " + e);
				this.showDetails(false);
				return;
			}

		});

	},
	reloadPerson: function () {
		this.personIdChanged();
	},
	renderPerson: function () 
	{
		console.log("||||||||||||||||||||| PseudoDetails renderPerson" + this.person);
		if (!this.person)
		{
			return;
		}

		var photoFuture;
		this.$.title.setContent(this.person.displayName);
		this.$.desc.setContent(this.person.workInfoLine);
		this.$.nickname.setContent(this.getNickName(this.person));
		this.renderLinkDetails();

		this.$.moreDetailsGroup.setFields(this.getMoreDetailsFields());
		this.$.emailGroup.setFields(this.person.getEmails().getArray());
		this.$.phoneGroup.setFields(this.person.getPhoneNumbers().getArray());
		this.$.imGroup.setFields(this.person.getIms().getArray());
		this.$.addressGroup.setFields(this.person.getAddresses().getArray());
		this.$.urlGroup.setFields(this.person.getUrls().getArray());
		this.$.notesGroup.setFields(this.person.getNotes().getArray());

		photoFuture = this.person.getPhotos().getPhotoPath(ContactsLib.PersonPhotos.TYPE.SQUARE);
		photoFuture.then(this, function () {
			this.$.photoImage.setSrc(photoFuture.result);
		});

		this.$.favoriteBtn.setState("down", this.person.isFavorite() ? true : false);

		this.showDetails(true);
	},
	// returns the first one in the list that passes a truth test (iterator)
	detect: function (obj, iterator)
	{
		var result,
			i;														
		for (i in obj)
		{
			if (iterator.call(this, obj[i])) {
				result = obj[i];				 
				return result;
			}										 
		}									
		return result;						
	},
	getMoreDetailsFields: function ()
	{
		var array = [],
			nickname = this.person.getNickname().getDisplayValue(),
			birthday = this.person.getBirthday().getDisplayValue(),
			relations = this.person.getRelations().getArray(),
			spouse = this.detect(relations, function (relation) {
				return relation.getType() === ContactsLib.Relation.TYPE.SPOUSE;
			}),
			child = this.detect(relations, function (relation) {
				return relation.getType() === ContactsLib.Relation.TYPE.CHILD;
			});

		if (birthday)
		{
			array.push({"value": birthday, "type": "type_BIRTHDAY"});
		}
		if (spouse)
		{
			array.push({"value": spouse.getDisplayValue(), "type": "type_SPOUSE"});
		}
		if (child)
		{
			array.push({"value": child.getDisplayValue(), "type": "type_CHILDREN"});
		}
		if (nickname)
		{
			array.push({"value": nickname, "type": "type_NICKNAME"});
		}
		return array;

	},
	getNickName: function (inPerson) 
	{
		return inPerson.nickname ? ("\"" + inPerson.nickname + '"') : "";
	},
	emailFieldClick: function (inSender, inField) {
		this.$.openApp.call(
			{id: "com.palm.app.email", params: {
				card: "compose",
				uri: "mailto:" + inSender.getFieldValue(inField)
			}}
		);
	},
	phoneFieldClick: function (inSender, inField) {
		this.$.openApp.call(
			{id: "com.palm.app.phone", params: {
				number: inSender.getFieldValue(inField)
			}}
		);
	},
	imFieldClick: function (inSender, inField) {
		this.$.openApp.call(
			//FIXME: Messaging app ID will likely revert to "com.palm.app.messaging"
			{id: "com.palm.app.enyo-messaging", params: {
				address: inSender.getFieldValue(inField)
			}}
		);
	},
	getAddressFieldValue: function (inSender, inField) {
		return inField.streetAddress;
	},

	getNotesFieldValue: function (inSender, inField) {
		return inField;
	},
	getNotesFieldType: function (inSender, inField) {
		return "NOTES";
	},

	
/*
1. get maps app call: com.palm.applicationManager/listAllHandlersForUrl
2. return: { "subscribed": false, "url": "mapto:", "returnValue": true, "redirectHandlers": { "activeHandler": { "url": "^mapto:", "appId": "com.palm.app.maps", "index": 24, "tag": "system-default", "schemeForm": true, "appName": "Google Maps" } } }
3. default maps app call: {"id":"com.palm.app.maps","params":{"target":"maploc:666 HELL AVENUE, HELL, MD!!!!!"}
*/
	addressFieldClick: function (inSender, inField) {
		this.$.openApp.call(
			{id: "com.palm.app.maps", params: { //TODO: this will need to change in the future to the system default - goog maps or carrier gps nav app
				target: "maploc:" + inSender.getFieldValue(inField)
			}}
		);
	},
	urlFieldClick: function (inSender, inField) {
		this.$.openApp.call(
			//FIXME: Browser app ID will likely revert to "com.palm.app.browser"
			{id: "com.palm.app.enyo-browser", params: {
				url: inSender.getFieldValue(inField)
			}}
		);
	},
	addToContactClick: function () 
	{
		this.$.AddToContactsDialog.toggleOpen();
	},
	editPerson: function () 
	{
		this.launchContacts(
			{
				contact: this.person.getDBObject(),
				launchType: "editContact"
			}
		);

		this.doEdit();
	},
	toggleFavorite: function () {
		this.personShouldBeFavorite = ! this.person.isFavorite();

		//business logic that saves, changes appearance
		this.$.favoriteBtn.setState("down", this.personShouldBeFavorite ? true : false);
		if (this.personShouldBeFavorite) {
			this.person.makeFavorite();
		} else {
			this.person.unfavorite();
		}

	},
	createContactDisplay: function () {
		return ContactsLib.ContactFactory.createContactDisplay();
	},

	// These are "overridden" by the Details scene
	photoMousedown: function () {
	},
	photoMouseup: function () {
	},
	linkContact: function (inPerson) {
	},
	linkedContactsChanged: function (inSender, inPerson) {
	},
	photoClick: function () {
	},
	renderLinkDetails: function () {
	}
});
