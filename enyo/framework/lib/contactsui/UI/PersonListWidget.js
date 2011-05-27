/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, document, enyo, console, PersonList, crb */


/*
	=======instantiation params=======
	onContactClick: <fxn> - function to call back when person is tapped
	mode: <string> - one of "noFilter", "favoritesOnly", "noFavoritesOnly". Defaults to "noFilter"
	exclusions: <array of <str>> - array of strings containing mojodb person _id's. Defaults to no exclusions : []
	sortOrder: <str> - "sortKey" - contacts sort default setting
	showModeButtons: <bool>,
	showSearchBar: <bool> //only works when mode = noFilter
	enableGAL: <bool> - global address lookup enable flag
	showIMStatuses: <bool> - enable flag for IM status indicator for messaging contacts (not available yet in webOS 3.0)
	resizeOnSearchFocus: <bool> - If you don't want it to resize your window when the search field receives focus then set this to false.  Defaults to true.

*/

enyo.kind({
	name: "com.palm.library.contactsui.personListWidget",
	kind: "VFlexBox",
	className: "enyo-contacts-list",
	published: {
		mode: "noFilter", 
		showSearchBar: true, 
		showAddButton: true,
		showIMStatuses: false,
		showFavStars: true,
		showToggle: false,
		enableGAL: false,
		resizeOnSearchFocus: true,
		exclusions: [] //need to propagate these to list by this.filterList() and need to change item decorator to hide items that are exclusions
	},
	events: {
		onContactClick: "", //consider the consumer and what kind of information to return to callback. if the app using this widget has no direct access to com.palm.person(.*):1 then it may be a security violation to return personal information. return id instead?
		onListUpdated: "",
		onAddClick: "",
		onSearchCriteriaUpdated: "",
		onSearchCriteriaCleared: "",
		onAddFavoriteClick: ""
	},
	components: [
		{kind: "Toolbar", className: "enyo-toolbar-light", layoutKind: "VFlexLayout", name: "modeButtonsContainer", components: [
			{kind: "RadioGroup", width: "100%", name: "radioGroup", onChange: "toggleList", value: "all", components: [
				{label: crb.$L("All"), value: "all"},
				{label: crb.$L("Favorites"), value: "favorites"}
			]}
		]},
		{name: "searchField", kind: "RoundedInput", className: "contacts-search", hint: crb.$L("Search"), onSearch: "onSearch", onchange: "filterList", // change to SearchInput when fw implements x swap
		autoCapitalize: "lowercase", autocorrect: false, autoWordComplete: false, changeOnInput: true, changeOnEnterKey: true, disabled: false, spellcheck: false,
		onfocus: "onSearchFieldFocus", onblur: "onSearchFieldBlur",
		components: [
			{name: "searchImg", kind: "Image", src: "$palm-themes-Onyx/images/search-input-search.png", style: "display: block", onclick: "onSearchIconClicked"}
		]},
		{name: 'listWrapper', style: "position:relative", components: [], height: "100%", flex: 1, kind: enyo.VFlexBox},
		{name: "emptyContacts", kind: "VFlexBox", showing: false, style: "text-align: center; color: #555; font-size: 20px;", components: [
			{kind: "Image", src: "images/first-launch-contacts.png"},
			{content: crb.$L("Your contact list is empty.")},
			{content: crb.$L("Tap the menu button to create a contact.")}
		]},
		{kind: "Toolbar", name: "bottomButtonPane", className: "contacts-toolbar enyo-toolbar-light", pack: "center", width: "100%", components: [
			{name: "addContactsButton", kind: "ToolButton", caption: crb.$L("Add Contact"), onclick: "doAddClick", className: "enyo-button-light"},
			{name: "addFavoriteButton", kind: "ToolButton", caption: crb.$L("Add Favorite"), showing: false, onclick: "doAddFavoriteClick"}// this needs to bring up a PersonList popup filtered to show non-favorites only
		]}
	],
	setExclusions: function (exclusionsArray) {
//		console.log("||||||||||PERSON LIST WIDGET - SET EXCLUSIONS : running this.$.PersonList.setExclusions with array" + JSON.stringify(this.exclusions));
		this.$.list.setExclusions(exclusionsArray);
	},
	clearSearchField: function () {
		if (this.$.searchField.getValue()) {
			this.$.searchField.setValue(null);
		}
	},
	create: function () {
		this.inherited(arguments);
	
		this.$.listWrapper.createComponent({name: "list", 
			kind: "PersonList", 
			flex: 1, 
			onContactClick: "doContactClick", 
			onListUpdated: "doListUpdated", 
			showAddButton: this.showAddButton, 
			showIMStatuses: this.showIMStatuses, 
			showFavStars: this.showFavStars,
			enableGAL: this.enableGAL,
			owner: this}
		);
		
		this.showSearchBarChanged();
		this.modeChanged();
		this.enableGALChanged();
	},
	rendered: function () {
		this.inherited(arguments);
		this.renderContacts();

//		console.log("PERSON LIST WIDGET - RENDERED - calling changemode on personList with " + this.mode);
		
	},
	showSearchBarChanged: function () {
		if (!this.showSearchBar) {
			this.$.searchField.hide();
		}
	},
	modeChanged: function () {
		// TODO: Enyo.require

		if (this.mode === "favoritesOnly") {
			this.curMode = PersonList.FAVORITES_ONLY;
		} else if (this.mode === "noFavoritesOnly") {
			this.curMode = PersonList.NO_FAVORITES_ONLY;
		} else {
			this.curMode = PersonList.NOFILTER;
		}

		if (this.showSearchBar) {
			this.curMode += 1;
		}

		this.$.list.changeMode(this.curMode);
	},
	enableGALChanged: function () {
		this.$.list.setEnableGAL(this.enableGAL);
	},
	refresh: function () {
		this.$.list.refresh();
	},
	punt: function () {
		this.$.list.punt();
	},
	ready: function () {
//		console.log("|||||||| PERSON LIST WIDGET IN READY");
		if (this.exclusions && Array.isArray(this.exclusions)) {
//			console.log("||||||||||PERSON LIST WIDGET - READY : this.exclusions is an array, running this.$.PersonList.setExclusions with array" + JSON.stringify(this.exclusions));
			this.$.list.setExclusions(this.exclusions);
		}
//		console.log("|||||||||||||||||MODE : " + this.mode);
		if (this.showToggle === false) {
			this.$.modeButtonsContainer.hide();
			//this.toggleList(null, "favorites");
			//this.$.radioGroup.setValue("favorites");
		} 
		if (!this.showAddButton) {
			this.$.bottomButtonPane.hide();
		}
		this.$.list.setShowIMStatuses(this.showIMStatuses);
		this.$.list.setShowFavStars(this.showFavStars);
	},
	filterList: function (inSender, inEvent) {
		this.filterString = this.$.searchField.getValue();
		if (this.filterString) {
			this.$.searchImg.setSrc("$palm-themes-Onyx/images/search-input-cancel.png");
			this.doSearchCriteriaUpdated();
		} else {
			this.$.searchImg.setSrc("$palm-themes-Onyx/images/search-input-search.png");
			this.doSearchCriteriaCleared();
		}

//		console.log("THE SEARCH TERM IS: " + this.filterString);
//		this.$.searchField.applyStyle("background-color", this.filterString ? "#E9AB17" : "white");	

		this.$.list.setSearchString(this.filterString || undefined);
		this.renderContacts();
	},
	renderContacts: function (showFavorites) {
		this.$.list.changeMode(showFavorites ? PersonList.FAVORITES_ONLY : this.curMode);
	},
	toggleList: function (inSender, inValue) {
		this.$.list.setShowFavStars(this.showFavStars);
		this.showFavorites = (inValue === "favorites");
		if (this.showFavorites) {
			this.$.searchField.hide();
			this.$.addContactsButton.hide();
			this.$.addFavoriteButton.show();
			this.$.modeButtonsContainer.addClass("favorites");
			this.$.listWrapper.addClass("favorites");
		} else {
			this.$.addContactsButton.show();
			this.$.addFavoriteButton.hide();
			this.$.modeButtonsContainer.removeClass("favorites"); 
			this.$.listWrapper.removeClass("favorites"); // i don't like this, if you don't like it either, please make bettur.
			this.$.searchField.show();
		}
		this.renderContacts(this.showFavorites);
	},
	selectContact: function (inPersonId) {
		this.$.list.selectContact(inPersonId);
	},
	enableButtons: function (inEnable) {
		this.$.addContactsButton.setDisabled(!inEnable);
		this.$.addFavoriteButton.setDisabled(!inEnable);
	},
	onSearchIconClicked: function (inSrc, inEvent) {
		if (this.$.searchField.getValue()) {
			this.$.searchField.setValue(null);
			// If the searchField isn't currently focused then prevent it from gaining focus
			if (!this.$.searchField.hasFocus()) {
				enyo.stopEvent(inEvent);
			}
			this.filterList();
		}
	},
	onSearchFieldFocus: function () {
		if (!this.resizeOnSearchFocus) {
			enyo.keyboard.setResizesWindow(false);
		}
	},
	onSearchFieldBlur: function () {
		if (!this.resizeOnSearchFocus) {
			enyo.keyboard.setResizesWindow(true);
		}
	}
});
