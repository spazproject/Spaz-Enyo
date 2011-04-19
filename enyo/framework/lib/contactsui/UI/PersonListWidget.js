/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, document, enyo, console */


/*
	=======instantiation params=======
	onContactClick: <fxn> - function to call back when person is tapped
	mode: <string> - one of "all", "favorites", "nofavorites". Defaults to "all"
	exclusions: <array of <str>> - array of strings containing mojodb person _id's. Defaults to no exclusions : []
	sortOrder: <str> - "sortKey" - contacts sort default setting
	showModeButtons: <bool>,
	showSearchBar: <bool>

*/

enyo.kind({
	name: "com.palm.library.contactsui.personListWidget",
	kind: "VFlexBox",
	className: "enyo-bg",
	published: {
		mode: "noFilter", 
		showSearchBar: true, 
		showAddButton: true,
		showIMStatuses: false,
		showFavStars: true,
		exclusions: [] //need to propagate these to list by this.filterList() and need to change item decorator to hide items that are exclusions
	},
	events: {
		onContactClick: "", //consider the consumer and what kind of information to return to callback. if the app using this widget has no direct access to com.palm.person(.*):1 then it may be a security violation to return personal information. return id instead?
		onListUpdated: "",
		onAddClick: "",
		onSearchCriteriaUpdated: "",
		onSearchCriteriaCleared: ""
	},
	components: [
		{kind: "Control", name:"modeButtonsContainer", style: "padding: 4px; font-size: 16px; font-weight: bold;", components: [
			{kind: "RadioGroup", name: "radioGroup", onChange: "toggleList", value: "all", components: [
				{label: $L("All"), value: "all"},
				{label: $L("Favorites"), value: "favorites"},
			]}
		]},
		{name: "searchField", className: "search-field", kind: "Input", onchange: "filterList", hint: $L("Search"), 
			autoCapitalize: "lowercase", autocorrect: false, spellcheck: false, disabled: false, changeOnKeypress: true, components: [
			{kind: "Image", src: "images/search.png"}
		]},
		{name:'listWrapper', components:[], flex:1, kind: enyo.VFlexBox},
		{name: "emptyContacts", kind: "VFlexBox", showing: false, style: "text-align: center; color: grey; font-size: 18px;", components: [
			{kind: "Image", src: "images/first-launch-contacts.png"},
			{content: $L("Your contact list is empty.")},
			{content: $L("Tap the menu button to create a contact.")}
		]},
		{kind: "Toolbar", name:"bottomButtonPane", className: "bottom-menu-panel", pack: "start", components: [
			{icon: "images/menu-icon-new-contact.png", onclick: "doAddClick"}
		]}
	],
	setExclusions: function (exclusionsArray){
		console.log("||||||||||PERSON LIST WIDGET - SET EXCLUSIONS : running this.$.PersonList.setExclusions with array" + JSON.stringify(this.exclusions));
		this.$.list.setExclusions(exclusionsArray);
	},
	create: function() {
		this.inherited(arguments);
	
		this.$.listWrapper.createComponent({name: "list", 
			kind: "PersonList", 
			flex: 1, 
			onContactClick: "doContactClick", 
			onListUpdated: "doListUpdated", 
			mode: this.mode, 
			showSearchBar: this.showSearchBar, 
			showAddButton: this.showAddButton, 
			showIMStatuses: this.showIMStatuses, 
			showFavStars: this.showFavStars,
			owner: this}
		);
	},
	rendered: function () {
		this.inherited(arguments);
		this.renderContacts();
		if (!this.showSearchBar){
			this.$.searchField.hide();
		}
		console.log("PERSON LIST WIDGET - RENDERED - calling changemode on personList with " + this.mode);
		this.$.list.changeMode(this.mode);
	},
	refresh: function(){
		this.$.list.refresh();
	},
	punt: function() {
		this.$.list.punt();
	},
	ready: function() {
		console.log("|||||||| PERSON LIST WIDGET IN READY");
		if (this.exclusions && Array.isArray(this.exclusions)){
			console.log("||||||||||PERSON LIST WIDGET - READY : this.exclusions is an array, running this.$.PersonList.setExclusions with array" + JSON.stringify(this.exclusions));
			this.$.list.setExclusions(this.exclusions);
		}
//		console.log("|||||||||||||||||MODE : " + this.mode);
		if (this.mode !== "dualMode"){
			this.$.modeButtonsContainer.hide();
			//this.toggleList(null, "favorites");
			//this.$.radioGroup.setValue("favorites");
		} 
		if (!this.showAddButton){
			this.$.bottomButtonPane.hide();
		}
		this.$.list.setShowIMStatuses(this.showIMStatuseses);
		this.$.list.setShowFavStars(this.showFavStars);
	},
	filterList: function (inSender) {
		this.filterString = this.$.searchField.getValue();
		if (this.filterString) {
			this.doSearchCriteriaUpdated();
		} else {
			this.doSearchCriteriaCleared();
		}

//		console.log("THE SEARCH TERM IS: " + this.filterString);
		this.$.searchField.applyStyle("background-color", this.filterString ? "#E9AB17" : "white");	

		this.$.list.setSearchString(this.filterString || undefined);
		this.renderContacts();
	},
	renderContacts: function (showFavorites) {
		this.$.list.toggleFavorites(showFavorites);
		this.$.list.refresh();
	},
	toggleList: function (inSender, inValue) {
		this.$.list.setShowFavStars(this.showFavStars);
		this.showFavorites = (inValue === "favorites");
		if (this.showFavorites) {
			this.$.searchField.hide();
		} else {
			this.$.searchField.show();
		}
		this.renderContacts(this.showFavorites);
	}
});
