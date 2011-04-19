/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, document, enyo, console */

enyo.kind({
	name: "PersonList",
	kind: "VFlexBox",
	persons: null,
	pageSize: 20,
	showFavOnly: false,
	hideFavOnly: false,
	published: {
		mode: "noFilter",
		showFavStars: true,
		whereClause: undefined,
		showIMStatuses: true,
		showFavOnly: false,
		hideFavOnly: false,
		exclusions: []
	},
	events: {
		onContactClick: "",
		onListUpdated: ""
	},
	components: [
		{kind: "DbService", components: [
			{name: "getPersons", method: "find", dbKind: "com.palm.person:1", onSuccess: "chainGetImBuddyStatus", subscribe: true, reCallWatches: true, sortBy: "sortKey"},
			{name: "searchPersons", method: "search", dbKind: "com.palm.person:1", onSuccess: "gotPersons", subscribe: true, reCallWatches: true, sortBy: "sortKey"}
		]},
		{kind: "TempDbService", components: [
			{name: "getIMStatuses", method: "find", dbKind: "com.palm.imbuddystatus:1", onSuccess: "gotIMStatuses", subscribe: false, reCallWatches: false}
		]},
		{name: "personList", kind: "DbList", pageSize: this.pageSize, onQuery: "listQuery", flex: 1, onSetupRow: "getListItem", components: [
			{name: "divider", className: "enyo-divider-alpha", showing: false, components: [
				{name: "dividerLabel", className: "enyo-divider-alpha-caption"}
			]},
			{name: "personItem", kind: "Item", className: "contactlist-item", onclick: "itemClick", components: [
				{kind: "HFlexBox", align:"center", height:"100%", pack:"start", components: [
					{className: "contactlist-item-photo", components: [
						{name: "photo", kind: "Image"},
						{kind: "Control", className: "mask"}
					]},
					{name: "contactName", wantsEvents: false},
					{name: "favIcon", className: "favorite", kind: "Image", src: "images/favorites-star-blue.png"},
//					{name: "availabilityIcon", className: "status", kind: "Image", src: "images/status-away.png"},
				]}
			]}
		]}
	],
	create: function () {
		this.inherited(arguments);
	},
	ready: function () {
console.log(">>>>>>>>LIST READY");
		var mustRefresh = false;
		if (this.exclusions.length > 0){
			mustRefresh = true;
		}
console.log(">>>>>>>>>>>>>>>PERSONLIST READY METHOD - this.mode " + this.mode);
		if (this.mode === "noFilter"){
			enyo.nop;	
		}	else if (this.mode === "favoritesOnly"){
			this.showFavOnly = true;
		} else if (this.mode === "noFavoritesOnly"){
			this.hideFavOnly = true;
		} else if (this.mode === "peopleWithAddressOnly"){
			this.hidePeopleWithNoAddress = true;
		}

		this.readyFlag = true;
		this.idAvailabilityHash = {};

		if (mustRefresh){
			this.refresh();
		}
	},
	rendered: function() {
console.log(">>>>>>>>LIST RENDERED");
		this.inherited(arguments);
	},
	refresh: function () {
console.log("||||||||||| PERSON LIST - in refresh calling reset()");
		this.$.personList.reset();
	},
	punt: function() {
		this.$.personList.punt();
	},
	setExclusions: function (exclusionsArray){
		console.log("||||||||| PERSON LIST - setExclusions");
		this.exclusions = exclusionsArray;
		if (this.readyFlag){
			this.refresh();
		}
	},
	setSearchString: function (searchString) {
		if (searchString) {
			this.whereClause = [{prop: "searchProperty", op: "?", val: searchString, collate: "primary"}, {prop: "favorite", op: "=", val: [true, false]}];
		} else {
			this.whereClause = undefined;
		}
	},
	changeMode: function(mode){
console.log(">>>>>>> in LIST CHANGEMODE " + mode);
		this.mode = mode;
		this.ready();
		this.refresh();
	},
	listQuery: function (inSender, inQuery) {
console.log("||||||||||||||||||||> listQuery()");
console.log("*** QUERYING DATABASE WITH: " + enyo.json.stringify(inQuery));
		var query = {query: inQuery},
			item;
		query.query.orderBy = "sortKey";
		query.query.desc = false;
//console.log("|||QUERY||| " + enyo.json.stringify(query));
		if (this.showFavOnly) {
			query.query.where = [{prop: "favorite", op: "=", val: true}]; 
		} else if (this.hideFavOnly) {
			query.query.where = [{prop: "favorite", op: "=", val: false}];
		} else {
			query.query.where = this.whereClause || undefined;
		}

		if (this.whereClause && this.whereClause.length > 0) {
			for (item = 0; item < this.whereClause.length; item += 1)
			{
				if (this.whereClause[item].prop === "searchProperty") {
					return this.$.searchPersons.call(query);
				}
			}
		}
		
		return this.$.getPersons.call(query);
	},
	chainGetImBuddyStatus : function (inSender, inResponse, inRequest){

		var index,
			idArray = [],
			query = {query: {
					where : [{prop: "personId", op: "=", val: idArray}]
				}
			};
//console.log("||||||||||||>>>>>>>>>>>>>>>>>>>>>>>>>> " + JSON.stringify(inResponse));
		
		for (index = 0; index < inResponse.results.length; index += 1) {
			idArray.push(inResponse.results[index]._id);
		}
console.log("||||||||||||>>>>>>>>>>>>>>>>>>>>>>>>>>QUERY " + JSON.stringify(query));

		this.doListUpdated();
		this.persons = inResponse.results;
		this.$.personList.queryResponse(inResponse, inRequest);
	
		this.$.getIMStatuses.call(query);
	},
	gotIMStatuses: function (inSender, inResponse, inRequest){
		var index,
			key;
//		console.log("|||||||>>>>> gotImStatuses  " + JSON.stringify(inSender));
		console.log("|||||||>>>>> imstatus " + JSON.stringify(inResponse.results));
    console.log("|||||||>>>>> imstatus for page " + JSON.stringify(this.persons[0].name) + " ||| " + JSON.stringify(this.persons[this.persons.length-1].name));

		for (index = 0; index < inResponse.results.length; index += 1) {
			this.idAvailabilityHash[inResponse.results[index].personId] = inResponse.results[index].personAvailability;
		}

		for (index = 0; index < this.persons.length; index += 1) {
			if (this.idAvailabilityHash[this.persons[index]._id]) {
				this.persons[index].personAvailability = this.idAvailabilityHash[this.persons[index]._id];
			}
		}
		
		this.$.personList.update();
	},

	toggleFavorites: function (showFavorites) {
//console.log("SETTING FAVORITES ONLY: " + (showFavorites ? "truthy" : "falsy"));
		var mustRefresh = (this.showFavOnly !== showFavorites);
		this.showFavOnly = showFavorites;
		if (mustRefresh){
			this.refresh();
		}
	},
	getListItem: function (inSender, inPerson, inIndex) {
		//inPerson is the same as this.$.personList.fetch(inIndex)
		var future,
//			personListPageSize = this.$.personList.getPageSize(),
			l,
			displayName,
			noDividerAfter;
/* //DEBUG LOGIC
console.log("|||||||> inRecord					: " + inRecord ? enyo.json.stringify(inRecord.name) : "");
var curContact = this.persons[inIndex % personListPageSize];
console.log("|||||||> contacts[" + inIndex % personListPageSize	+ "]	 : " + (curContact ? enyo.json.stringify(curContact.name) : ""));
var nextContact = this.persons[(inIndex % personListPageSize) + 1];
console.log("|||||||> contacts[" + ((inIndex % personListPageSize) + 1) + "]: " + (nextContact ? enyo.json.stringify(nextContact.name) : ""));
*/
		displayName = ContactsLib.Person.generateDisplayNameFromRawPerson(inPerson);
	
		if (inPerson.personAvailability === 4) {
			displayName += "---OFFLINE---";
		} else if (inPerson.personAvailability === 2) {
			displayName += "---AWAY---";
		} else if (inPerson.personAvailability === 0) {
			displayName += "---AVAILABLE---";
		}
		
		this.$.contactName.content = displayName;
		this.$.favIcon.applyStyle("display", !this.showFavOnly && !this.hideFavOnly && this.showFavStars && inPerson.favorite ? "inline-block" : "none");
		future = ContactsLib.PersonPhotos.getPhotoPath(inPerson.photos, ContactsLib.ContactPhoto.TYPE.LIST, true);
		future.now(this, function () {
			this.$.photo.domAttributes.src = future.result;
		});

		l = this.getGroupName(inIndex, inPerson.name, displayName);
		this.$.divider.setShowing(inIndex === 0 || (l !== "" && this.$.dividerLabel.content !== l));
		if (this.$.divider.showing) {
			this.$.dividerLabel.content = l;
		}

		noDividerAfter = (this.getGroupName(inIndex + 1) === l);
		this.$.personItem.domStyles["border-top"] = this.$.divider.showing ? "none" : null;
		this.$.personItem.domStyles["border-bottom"] = noDividerAfter ? null : "none";

		if (this.exclusions && Array.isArray(this.exclusions)) {
			if (this.exclusions.indexOf(inPerson._id) !== -1) {
				this.$.personItem.hide();
//TODO: also display and hide divs in a smarter manner
			}
		} else if (mode === "peopleWithAddressOnly" && inPerson.addresses && inPerson.addresses.length === 0) {
			this.$.personItem.hide();
		}

		return true;
	},
	getGroupName: function (inIndex, name, displayName) 
	{
		var c, 
			groupName = name && (name.familyName || name.givenName);

		if (!groupName || groupName.length === 0)
		{
			groupName = displayName;
			if (!groupName || groupName.length === 0)
			{
				c = this.$.personList.fetch(inIndex);
				if (!c)
				{
					return "";
				}
				groupName = c.name && (c.name.familyName || c.name.givenName);
				if (!groupName || groupName.length === 0)
				{
					groupName = ContactsLib.Person.generateDisplayNameFromRawPerson(c);
				}
			}
		}

		return groupName.charAt(0).toUpperCase();
	},
	gotPersons : function (inSender, inResponse, inRequest) {
		this.doListUpdated();
		this.persons = inResponse.results;
		this.$.personList.queryResponse(inResponse, inRequest);
	},
	getContactFromItem: function (inItem) {
		var index = this.$.personList.fetchRowIndex();
		return this.persons[index % this.persons.length];
	},
	itemClick: function (inSender, inEvent) {
		var index = inEvent.rowIndex,
			item = this.$.personList.fetch(index);
		this.doContactClick(item);
	}
});
