/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, enyo, console, $L, com, $contactsui_path, PalmSystem, crb */

/*

!!!!!!! DO NOT USE THIS COMPONENT DIRECTLY IN YOUR CODE !!!!!!!!
IT IS A SUPERKIND OF DetailsDialog, which should be used instead.

*/
enyo.kind({
	name: "com.palm.library.contactsui.detailsInDialog",
	kind: "VFlexBox",
	className: "enyo-contacts-details",
	person: null,
	showDone: true,
	published: {
		personId: null,
		contact: null,
		showButtonsHideBar: true
	},
	events: {
		onEdit: "",
		onAddToExisting: "",
		onAddToNew: "",
		onDone: "",
		onDoneCreatingPersonObject: "",
		onRenderPersonComplete: ""
	},
	components: [
		{ kind: "PalmService", service: "palm://com.palm.applicationManager/", components: [
			{name: "launchApp", method: "launch"},
			{name: "openApp", method: "open"},
			{name: "getDefaultMapApp", method: "listAllHandlersForUrl"}
		]},
		{name: "AllDetails", layoutKind: "VFlexLayout", showing: false, components: [
			{kind: "Control", components: [
				{kind: "HFlexBox", components: [
					{name: "photo", kind: "Control", className: "icon", components: [
						{name: "photoImage", className: "img", kind: "Control"},
						{kind: "Control", className: "mask"}
					]},
					{name: "favIndicator", kind: "Control", className: "favorite", onclick: "toggleFavorite", showing: false},
					{kind: "Control", layoutKind: "VFlexLayout", className: "nameinfo", align: "start", pack: "justify", components: [
						{name: "title", className: "name"},
						{name: "nickname", className: "nickname", showing: false},
						{name: "desc", className: "position"}
					]},
					{name: "linkCounter", kind: "enyo.Button", toggling: true, showing: false, caption: "", className: "enyo-button-light profiles-button", 
						onclick: "linkedProfilesClick", onmousedown: "photoMousedown", onmouseup: "photoMouseup"}
				]}
			]}
		]},
		{name: "SelectAContact", kind: "VFlexBox", flex: 1, pack: "center", showing: true, style: "border-left:1px solid #a8a8a8;text-align: center; color: grey;", components: [
			{kind: "Spacer", flex: 2},
			{kind: "Image", src: "images/first-launch-contacts.png"},
			{content: crb.$L("Select a contact on the left to see more information."), style: "width:250px;margin:0 auto;"},
			{kind: "Spacer", flex: 5}
		]},
		{name: "skypeMenu", kind: "PopupSelect", onSelect: "onSkypeMenuSelect", onBeforeOpen: "onSkypeMenuBeforeOpen", onClose: "onSkypeMenuClose"},
		{kind: "Control", layoutKind: "VFlexLayout", className: "group", flex: 1, components: [
			{name: "SomeDetails", kind: "Scroller", flex: 1,  horizontal: false, autoHorizontal: false, components: [
				{name: "emailGroup", kind: "com.palm.library.contactsui.FieldGroup", onFieldClick: "emailFieldClick"},
				{name: "phoneGroup", kind: "com.palm.library.contactsui.FieldGroup", onFieldClick: "phoneFieldClick", onGetActionIcon: "phoneGetActionIcon", onActionIconClick: "phoneActionIconClick"},
				{name: "imGroup", kind: "com.palm.library.contactsui.FieldGroup", onFieldClick: "imFieldClick", onShowArrow: "showImDropdownArrow"},
				{name: "addressGroup", kind: "com.palm.library.contactsui.FieldGroup", onGetFieldValue: "getAddressFieldValue", onFieldClick: "addressFieldClick"},
				{name: "urlGroup", kind: "com.palm.library.contactsui.FieldGroup", onFieldClick: "urlFieldClick"},
				{name: "notesGroup", kind: "com.palm.library.contactsui.FieldGroup", onGetFieldValue: "getNotesFieldValue"},
				{name: "moreDetailsGroup", kind: "com.palm.library.contactsui.FieldGroup", propertyName: "moredetails", onGetFieldValue: "getMoreDetailsValue"},
				{name: "ButtonsWrapper", className: "enyo-item enyo-last contacts-actions", components: [
					{kind: "Button", name: "addToNewButtonInline", caption: crb.$L("Add New Contact"), onclick: "addNewContactClick", showing: false},
					{kind: "Button", name: "addToExistingButtonInline", caption: crb.$L("Add to existing"), onclick: "addToExistingClick", showing: false},
					{kind: "Button", name: "editButtonInline", caption: crb.$L("Edit Contact"), onclick: "editPerson", showing: false}
				], flex: 1, kind: "VFlexBox", showing: false}
			]}
		]}
	],
	create: function () 
	{
		this.inherited(arguments);

		if (this.showButtonsHideBar) { //shows either the chrome with buttons or inlines the buttons for in-dialog use. Triggered with this.showButtonsHideBar
			this.$.ButtonsWrapper.show();
		}
		
		this.personIdChanged();
	},
	cancelAction: function (inSender) {
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

		this.doAddToExisting();
	},
	showDetails: function (show) 
	{
		this.$.AllDetails.setShowing(show);
		this.$.SelectAContact.setShowing(!show);
//		this.$.SomeDetails.scrollTo(0, 0);
	},
	contactChanged: function () 
	{
		 //inline buttons mode
		this.$.addToNewButtonInline.show();
		this.$.addToExistingButtonInline.show();
		this.$.editButtonInline.hide();
		

		this.$.linkCounter.setDepressed(false);

		this.person = ContactsLib.PersonFactory.createPersonDisplay(this.contact);
		this.personId = null;
		this.renderPerson();
	},
	personIdChanged: function () {
		var personFuture;

		 //inline buttons mode
		this.$.addToNewButtonInline.hide();
		this.$.addToExistingButtonInline.hide();
		this.$.editButtonInline.show();
		

		this.$.linkCounter.setDepressed(false);

		if (!this.personId)
		{
			this.showDetails(false);
			return;
		}
	
		personFuture = ContactsLib.Person.getDisplayablePersonAndContactsById(this.personId);
		personFuture.then(this, function (personFuture) {
			try {
				this.person = personFuture.result || {};
				this.renderPerson();  //TODO: move this back into try block
				if (enyo.windowParams && enyo.windowParams.launchType === "editContact") {
					this.doDoneCreatingPersonObject();
					enyo.windowParams = {}; //global
				}
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
		this.$.notesGroup.setFields(this.addTypeToNotes(this.person.getNotes().getArray()));

		photoFuture = this.person.getPhotos().getPhotoPath(ContactsLib.PersonPhotos.TYPE.SQUARE);
		photoFuture.then(this, function () {
			this.$.photoImage.applyStyle("background-image", "url(" + photoFuture.result + ");");
		});

//		this.$.favoriteBtn.setState("down", this.person.isFavorite() ? true : false);
		this.$.favIndicator.addRemoveClass("true", this.person.isFavorite() ? true : false);
		this.showDetails(true);
		
		this.doRenderPersonComplete();
	},
	addTypeToNotes: function (array)
	{
		var i;
		for (i = 0; i < array.length; i += 1)
		{
			array[i].x_displayType = crb.$L("notes");
		}
		return array;
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
			// Note: getDisplayValue relies on Mojo.Format which we are not importing therefore we are using Utils.formatBirthday as an alternative
			birthday = com.palm.library.contacts.Utils.formatBirthday(this.person.getBirthday()),
			relations = this.person.getRelations().getArray(),
			spouse = this.detect(relations, function (relation) {
				return relation.getType() === ContactsLib.Relation.TYPE.SPOUSE;
			}),
			child = this.detect(relations, function (relation) {
				return relation.getType() === ContactsLib.Relation.TYPE.CHILD;
			});

		if (birthday)
		{
			array.push({"value": birthday, "x_displayType": crb.$L("BIRTHDAY")});
		}
		if (spouse)
		{
			array.push({"value": spouse.getDisplayValue(), "x_displayType": crb.$L("SPOUSE")});
		}
		if (child)
		{
			array.push({"value": child.getDisplayValue(), "x_displayType": crb.$L("CHILDREN")});
		}
		return array;

	},
	getNickName: function (inPerson) 
	{
		return inPerson.getNickname().getDisplayValue() || "";
	},
	emailFieldClick: function (inSender, inEvent, inField) {
		this.$.openApp.call(
			{
				target: "mailto:" + inSender.getFieldValue(inField)
			}
		);
	},
	onSkypeMenuSelect: function (inSender, inSelected)
	{
		if (inSelected.getValue() === "CHAT")
		{
			this.$.openApp.call({
				id: "com.palm.app.messaging", 
				params: {
					compose:
					{
						personId: this.personId,
						ims: [inSelected.field.getDBObject()]
					}
				}
			});
		}
		else if (inSelected.getValue() === "VOICE")
		{
			this.openPhoneApp(inSelected.inSender.getFieldValue(inSelected.field.getDBObject()), "com.palm.skype");
		}
		else if (inSelected.getValue() === "VIDEO")
		{
			this.openPhoneApp(inSelected.inSender.getFieldValue(inSelected.field.getDBObject()), "com.palm.skype", true);
		}
	},
	onSkypeMenuBeforeOpen: function () {
		this.$.skypeMenu.setItems(this.skypPopupItems);
	},
	onSkypeMenuClose: function () {
		this.skypPopupItems = [];
	},

	openPhoneApp: function (address, transport, video)
	{
		this.$.openApp.call({
			id: "com.palm.app.phone", 
			params: 
			{
				address: address,
				transport: transport,
				video: video
			}
		});
	},
	phoneActionIconClick: function (inSender, inEvent, inField)
	{
		this.$.openApp.call(
			{
				id: "com.palm.app.messaging",
				params: {
					compose:
					{
						personId: this.personId,
						phoneNumbers: [inField.getDBObject()]
					}
				}
			}
		);
	},
	phoneGetActionIcon: function () 
	{
		return $contactsui_path + "/images/btn_sms.png";
	},
	phoneFieldClick: function (inSender, inEvent, inField) {
		this.openPhoneApp(inSender.getFieldValue(inField), "com.palm.telephony");
	},
	showImDropdownArrow: function (inSender, inType) 
	{
		return (inType === ContactsLib.IMAddress.TYPE.SKYPE);
	},
	imFieldClick: function (inSender, inEvent, inField) {
		if (inSender.getFieldType(inField) === ContactsLib.IMAddress.TYPE.SKYPE)
		{
			// maxSkypeMenuXPosition is a work-around for DFISH-12977 (This should be handled by the fmwk)
			var	deviceDetails = PalmSystem && JSON.parse(PalmSystem.deviceInfo),
				maxSkypeMenuXPosition,
				orientation;

			this.skypPopupItems = [
				{caption: crb.$L("Chat"), value: "CHAT", field: inField, inSender: inSender},
				{caption: crb.$L("Voice Call"), value: "VOICE", field: inField, inSender: inSender},
				{caption: crb.$L("Video Call"), value: "VIDEO", field: inField, inSender: inSender}
			];

			if (deviceDetails) {
				orientation = enyo.getWindowOrientation();
				if (orientation === "up" || orientation === "down") {
					maxSkypeMenuXPosition = deviceDetails.screenWidth - (parseInt(this.$.skypeMenu.width, 10) + 28);
				} else if (orientation === "left" || orientation === "right") {
					maxSkypeMenuXPosition = deviceDetails.screenHeight - (parseInt(this.$.skypeMenu.width, 10) + 28);
				}
			}

			if (maxSkypeMenuXPosition && (inEvent.clientX > maxSkypeMenuXPosition)) {
				this.$.skypeMenu.openAt({left: maxSkypeMenuXPosition, top: inEvent.clientY});
			} else {
				this.$.skypeMenu.openAtEvent(inEvent);
			}

			return;
		}

		this.$.openApp.call(
			{
				id: "com.palm.app.messaging", 
				params: {
					compose:
					{
						personId: this.personId,
						ims: [inField.getDBObject()]
					}
				}
			}
		);
	},
	getAddressFieldValue: function (inSender, inField) {
		return inField.streetAddress;
	},

	getNotesFieldValue: function (inSender, inField) {
		return inField.getDisplayValue();
	},
	
/*
1. get maps app call: com.palm.applicationManager/listAllHandlersForUrl
2. return: { "subscribed": false, "url": "mapto:", "returnValue": true, "redirectHandlers": { "activeHandler": { "url": "^mapto:", "appId": "com.palm.app.maps", "index": 24, "tag": "system-default", "schemeForm": true, "appName": "Google Maps" } } }
3. default maps app call: {"id":"com.palm.app.maps","params":{"target":"maploc:666 HELL AVENUE, HELL, MD!!!!!"}
*/
	addressFieldClick: function (inSender, inEvent, inField) {
		this.$.openApp.call(
			{id: "com.palm.app.maps", params: { //TODO: this will need to change in the future to the system default - goog maps or carrier gps nav app
				address: "" + inSender.getFieldValue(inField)
			}}
		);
	},
	urlFieldClick: function (inSender, inEvent, inField) {
		this.$.openApp.call(
			{id: "com.palm.app.browser", params: {
				url: inSender.getFieldValue(inField)
			}}
		);
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
//		this.$.favoriteBtn.setState("down", this.personShouldBeFavorite ? true : false);
		this.$.favIndicator.addRemoveClass("true", this.personShouldBeFavorite ? true : false);
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
	linkedProfilesClick: function () {
	},
	renderLinkDetails: function () {
		this.$.linkCounter.setShowing(false);
	}
});
