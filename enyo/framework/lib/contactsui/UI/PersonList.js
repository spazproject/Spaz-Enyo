/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, document, enyo, console, runningInBrowser, PersonList, MockPersonMap, crb, $contactsui_path */

enyo.kind({
	name: "PersonList",
	kind: "VFlexBox",
	persons: null,
	selectedPersonInfo: undefined,
	published: {
		mode: 2, // PersonList.NOFILTER_SEARCH,
		showFavStars: true,
		whereClause: undefined,
		showIMStatuses: true,
		exclusions: [],
		peopleWithAddressOnly: false,
		enableGAL: false
	},
	events: {
		onContactClick: "",
		onListUpdated: ""
	},
	statics: {
		SORTKEY_DEFAULT_CHAR: "\uFAD7",
		DEFAULT_DIVIDER_TEXT: "#",
		SORT_LAST_FIRST: "LAST_FIRST",
		SORT_FIRST_LAST: "FIRST_LAST",
		
		NOFILTER: 1,
		NOFILTER_SEARCH: 2,
		FAVORITES_ONLY: 3,
		FAVORITES_ONLY_SEARCH: 4,
		NO_FAVORITES_ONLY: 5,
		NO_FAVORITES_ONLY_SEARCH: 6
	},
	components: [
		{kind: "DbService", components: [
			{name: "getPersons", method: "find", dbKind: "com.palm.person:1", onSuccess: "decideToGetIMStatuses", subscribe: true, onWatch: "gotPersonsWatch", sortBy: "sortKey"}, 
			{name: "searchPersons", method: "search", dbKind: "com.palm.person:1", onSuccess: "gotPersons", sortBy: "sortKey", subscribe: false},
			{name: "searchPersonsCnt", method: "search", dbKind: "com.palm.person:1", onSuccess: "gotPersonsCount", onFailure: "gotPersonsCountFailed", subscribe: false, sortBy: "sortKey"}
		]},
		{kind: "TempDbService", components: [
			{name: "getIMStatuses", method: "find", dbKind: "com.palm.imbuddystatus:1", onSuccess: "gotIMStatuses", subscribe: false}
		]},
		{name: "galService", kind: "GalService", onSuccess: "gotGalResults", onFailure: "gotGalFailure"},
		{name: "personList", kind: "DbList", onQuery: "listQuery", flex: 1, onSetupRow: "getListItem", components: [
			{name: "divider", className: "enyo-divider-alpha", showing: false, components: [
				{name: "dividerLabel", className: "enyo-divider-alpha-caption divider-Label"}
			]},
			{name: "personItem", kind: "Item", layoutKind: "HLayout", onclick: "itemClick", components: [
				{className: "icon", components: [
					{name: "photo", kind: "Control", className: "img"},
					{kind: "Control", className: "mask"}
				]},
				{name: "contactName", className: "name", wantsEvents: false},
				{name: "favIcon", className: "favorite"},
				{name: "availabilityIcon", className: "status", kind: "Image", src: $contactsui_path + "/images/status-offline.png", showing: false}
			]},
			// GAL related items
			{name: "GalDivider", kind: enyo.Divider, caption: crb.$L("GLOBAL ADDRESS LOOKUP"), canGenerate: false},
			{name: "GalMessage", kind: "Item", layoutKind: "HFlexLayout", pack: "justify", align: "center", onclick: "GalMessageOnClick", className: "first last", canGenerate: false, components: [
				{content: crb.$L("Search Exchange"), className: "name", style: "padding:20px 0;font-size:20px"},
				{name: "GalImage", kind: "Image", src: "$palm-themes-Onyx/images/search-input-search.png"},
				{name: "GalSpinner", kind: "Spinner"}
			]},
			{name: "GalResultsMessage", className: "enyo-item first last", showing: false, canGenerate: false, flex: 1, components: [
				{name: "GalResultsMsg", flex: 1, className: "message"}
			]},
			{name: "GalDrawer", kind: enyo.Drawer, open: false, canGenerate: false, onOpenAnimationComplete: "onOpenAnimationComplete", components: [
				{name: "GalList", kind: "VirtualRepeater", onSetupRow: "onGalGetItem", components: [
					{name: "galItem", kind: "Item", layoutKind: "HLayout", onclick: "onGalPersonClick", components: [
						{className: "icon", components: [
							{kind: "Control", className: "img"},
							{kind: "Control", className: "mask"}
						]},
						{name: "galPerson", className: "name long"}
					]}
				]}
			]}
		]}
	],
	create: function () {
		this.inherited(arguments);
	
		if (!runningInBrowser) {
			this.AppPrefs = new ContactsLib.AppPrefs(function () {
				this.isAppPrefsReady = true;
				this.refresh();
			}.bind(this)); //fourth argument disables appPrefs object writeback to db upon instantiation. this eliminates any race conditions with competing PersonLists.
		} else {
			this.createComponent({kind: "DbService", dbKind: "enyo.mockGal:1", onFailure: "gotGalFailure", components: [{name: "mockGalService", method: "find", onResponse: "gotGalResults"}]});
			this.refresh();
		}
	
		this.favoriteProperty = {prop: "favorite", op: "=", val: undefined};
		this.searchProperty = {prop: "searchProperty", op: "?", val: undefined, collate: "primary"};
		this.applySearchString = true;
		this.galData = [];
		this.gotGalData = false;
		this.refreshRetryCount = 0;
	},
	ready: function () {
		var mustRefresh = false;
		if (this.exclusions.length > 0) {
			mustRefresh = true;
		}

		this.readyFlag = true;
		this.idAvailabilityHash = {};

		if (mustRefresh) {
			this.refresh();
			return true;
		}
	},
	rendered: function () {
		this.inherited(arguments);
	},
	refresh: function () {
		if (this.isAppPrefsReady === true || runningInBrowser) {
			if (this.isGalActive === true && this.maxIndex < 0 && this.refreshRetryCount < 3) {
				// Wait before updating the list...
				this.refreshRetryCount += 1;
				enyo.job("job.contacts.PersonList.Refresh", enyo.bind(this, "_refresh"), 300);
			} else {
				this.refreshRetryCount = 0;
				this.$.personList.punt();
			}
		}
	},
	_refresh: function () {
		enyo.job.stop("job.contacts.PersonList.Refresh");
		this.$.personList.punt();
	},
	punt: function () {
		this.$.personList.punt();
	},
	enableGALChanged: function () {
		if (runningInBrowser) {
			this.isGalActive = true;
		} else {
			this.isGalActive = (this.enableGAL && this.applySearchString);
		}
	},
	setExclusions: function (exclusionsArray) {
		enyo.require(exclusionsArray && Array.isArray(exclusionsArray), "setExclusions requires an array");
		this.exclusions = exclusionsArray;
		if (this.readyFlag) {
			this.refresh();
		}
	},
	setSearchString: function (searchString, dontResetGalStates) {
		var srchQuery;
		
		if (dontResetGalStates === undefined) {
			this.resetGalStates();
		}

		if (this.applySearchString === true && searchString) {
			this.searchProperty.val = searchString;
			if (this.isGalActive === true) {
				srchQuery = {orderBy: "sortKey", where: [this.searchProperty]};
				srchQuery.where.push(this.favoriteProperty.val === undefined		? 
									{prop: "favorite", op: "=", val: [true, false]}	:
									this.favoriteProperty);

				this.$.searchPersonsCnt.call({query : srchQuery, count: true});
			}
		} else {
			this.searchProperty.val = undefined;
		}
	},
	changeMode: function (mode) {
		this.mode = mode;
		switch (this.mode) {
		case PersonList.NOFILTER:
		case PersonList.FAVORITES_ONLY:
		case PersonList.NO_FAVORITES_ONLY:
			this.applySearchString = false;
			break;
		default:
			this.applySearchString = true;
			break;
		}

		switch (this.mode) {
		case PersonList.NOFILTER:
		case PersonList.NOFILTER_SEARCH:
			this.showFavOnly = false;
			this.favoriteProperty.val = undefined;
			break;
		case PersonList.FAVORITES_ONLY:
		case PersonList.FAVORITES_ONLY_SEARCH:
			this.showFavOnly = true;
			this.favoriteProperty.val = true;
			break;
		case PersonList.NO_FAVORITES_ONLY:
		case PersonList.NO_FAVORITES_ONLY_SEARCH:
			this.showFavOnly = false;
			this.favoriteProperty.val = false;
			break;
		}
		
		this.enableGALChanged();

		this.ready();
		this.refresh();
	},
	listQuery: function (inSender, inQuery) {
		//this.showFavOnly = false; this.hideFavOnly = false;
		//this.showFavOnly = true; this.hideFavOnly = false;
		//this.showFavOnly = false; this.hideFavOnly = true;
		//console.info("*** QUERYING DATABASE WITH: " + enyo.json.to(inQuery));
		var query = {query: inQuery};
		query.query.orderBy = "sortKey";
		//console.log("|||QUERY||| " + enyo.json.to(query));

		if (this.applySearchString === true && this.searchProperty.val !== undefined) {
			if (this.favoriteProperty.val === undefined) {
				query.query.where = [this.searchProperty, {prop: "favorite", op: "=", val: [true, false]}];
			} else {
				query.query.where = [this.searchProperty, this.favoriteProperty];
			}
			return this.$.searchPersons.call(query);
		} else {
			if (this.favoriteProperty.val !== undefined) {
				query.query.where = [this.favoriteProperty];
			} else {
				query.query.where = undefined;
			}
			return this.$.getPersons.call(query);
		}
	},

	decideToGetIMStatuses : function (inSender, inResponse, inRequest) {

		if (this.showIMStatuses) {
			this.chainGetImBuddyStatus(inSender, inResponse, inRequest);
		} else {
			this.gotPersons(inSender, inResponse, inRequest);
		}
	},
	chainGetImBuddyStatus : function (inSender, inResponse, inRequest) {
		var index,
			idArray = [], //where person Ids are collected for the im status query
			query = {query: {
				where: [{prop: "personId", op: "=", val: idArray}]
			}};
	
		for (index = 0; index < inResponse.results.length; index += 1) {
			idArray.push(inResponse.results[index]._id);
			if (runningInBrowser) {
				MockPersonMap["" + inResponse.results[index]._id] = inResponse.results[index];
				MockPersonMap["" + inResponse.results[index]._id].contactCount = (index + 1);
			}
		}
//console.info("Personlist - querying QUERY " + JSON.stringify(query));

		this._processPersonResults(inResponse, inRequest);

		this.$.getIMStatuses.call(query);
	},
	gotIMStatuses: function (inSender, inResponse, inRequest) {
		var index;
//		console.log("|||||||>>>>> gotImStatuses  " + JSON.stringify(inSender));
//		console.info("|||||||>>>>> imstatus " + JSON.stringify(inResponse.results));
//	console.info("|||||||>>>>> imstatus for page " + JSON.stringify(this.persons[0].name) + " ||| " + JSON.stringify(this.persons[this.persons.length-1].name));

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

	getListItem: function (inSender, inPerson, inIndex) {
		if (this.isGalActive && inIndex === this.maxIndex) {
			this.$.GalDivider.canGenerate = true;
			this.$.GalMessage.canGenerate = true;
			this.$.GalSpinner.setShowing(this.galSpinnerShowing);
			this.$.GalMessage.addRemoveClass("selected", this.galSpinnerShowing);
			this.$.GalImage.setShowing(!this.galSpinnerShowing);
			this.$.GalList.canGenerate = true;
			this.$.GalDrawer.canGenerate = true;
			this.$.GalDrawer.setOpen(this.gotGalData);
			this.$.GalResultsMessage.canGenerate = true;
			this.$.GalMessage.setShowing(!this.gotGalData);
			this.$.GalResultsMessage.setShowing(this.galResultsMsg !== undefined);
			this.$.GalResultsMsg.setContent(this.galResultsMsg ? this.galResultsMsg : "");
			this.$.GalResultsMessage.setShowing(this.galResultsMsg !== undefined);
		} else {
			this.$.GalDivider.canGenerate = false;
			this.$.GalMessage.canGenerate = false;
			this.$.GalList.canGenerate = false;
			this.$.GalDrawer.canGenerate = false;
			this.$.GalResultsMessage.canGenerate = false;
		}

		//inPerson is the same as this.$.personList.fetch(inIndex)
		var future,
//			personListPageSize = this.$.personList.getPageSize(),
			curGroupName,
			displayName,
//			type = this.showFavOnly ? ContactsLib.PersonPhotos.TYPE.SQUARE : ContactsLib.PersonPhotos.TYPE.LIST,
			type = this.showFavOnly ? ContactsLib.PersonPhotos.TYPE.BIG : ContactsLib.PersonPhotos.TYPE.LIST,
			nextPerson,
			noDividerAfter;
			
		if (inPerson.emptyGALContact !== undefined) {
			this.$.personItem.setShowing(false);
			return true;
		} else if (inPerson.excludedPerson) {
			this.$.personItem.setShowing(false);
			return true;
		} else {
/* //DEBUG LOGIC
console.log("|||||||> inRecord					: " + inRecord ? enyo.json.to(inRecord.name) : "");
var curContact = this.persons[inIndex % personListPageSize];
console.log("|||||||> contacts[" + inIndex % personListPageSize	+ "]	 : " + (curContact ? enyo.json.to(curContact.name) : ""));
var nextContact = this.persons[(inIndex % personListPageSize) + 1];
console.log("|||||||> contacts[" + ((inIndex % personListPageSize) + 1) + "]: " + (nextContact ? enyo.json.to(nextContact.name) : ""));
*/
			this.$.personItem.setShowing(true);
			displayName = ContactsLib.Person.generateDisplayNameFromRawPerson(inPerson);

			if (inPerson.personAvailability === 4) {
				this.$.availabilityIcon.setSrc($contactsui_path + "/images/status-offline.png");
				this.$.availabilityIcon.show();
			} else if (inPerson.personAvailability === 2) {
				this.$.availabilityIcon.setSrc($contactsui_path + "/images/status-away.png");
				this.$.availabilityIcon.show();
			} else if (inPerson.personAvailability === 0) {
				this.$.availabilityIcon.setSrc($contactsui_path + "/images/status-available.png");
				this.$.availabilityIcon.show();
			}
			this.$.contactName.setContent(displayName);
			this.$.contactName.addRemoveClass("long", (this.showFavOnly || !this.showFavStars || !inPerson.favorite));
			this.$.favIcon.applyStyle("display", !this.showFavOnly && this.showFavStars && inPerson.favorite ? "inline-block" : "none");
			future = ContactsLib.PersonPhotos.getPhotoPath(inPerson.photos, type, !this.showFavOnly);
			future.now(this, function () {
				this.$.photo.applyStyle("background-image", "url(" + future.result + ");");
			});
			curGroupName = inPerson.groupName;
			this.renderDivider(inIndex, curGroupName);

			nextPerson = this.$.personList.fetch(inIndex + 1);
			noDividerAfter = nextPerson ? (nextPerson.groupName === curGroupName) : false;
			this.$.personItem.addRemoveClass('first', this.$.divider.getShowing() ? true : false);
			this.$.personItem.addRemoveClass('last', (noDividerAfter || this.showFavOnly) ? false : true); // TODO: When showFavOnly is true how do we figure out if we're the last row..

			if (this.selectedPersonInfo && inPerson._id === this.selectedPersonInfo.personId) {
				this.$.personItem.addClass('selected');
			} else {
				this.$.personItem.removeClass('selected');
			}
			return true;
		}
	},
	renderDivider: function (inIndex, inCurGroupName)
	{
		this.$.divider.setShowing(this.determineIfCurDivShouldBeShown(inIndex, inCurGroupName));
		if (this.$.divider.getShowing()) {
			this.$.dividerLabel.setContent(inCurGroupName);
		}
	},
	determineIfCurDivShouldBeShown: function (inIndex, inCurGroupName) {
		var rawPerson;
		do {
			inIndex -= 1;
			rawPerson = this.$.personList.fetch(inIndex);
			if (!rawPerson) {
				return true;
			} else if (!rawPerson.excludedPerson) { // If they are exlcuded keep looping
				return (rawPerson.groupName !== inCurGroupName);
			}
		} while (rawPerson);

		return false;
	},
	getGroupName: function (inIndex, rawPersonObject) {
		//if we're in first-last or last-first, let the divider text be the first character, or the default divider text
		//if we're in company-first-last or company-last-first, let the divider text be the full company name, or the default divider text
		if (!rawPersonObject) {
			rawPersonObject = this.$.personList.fetch(inIndex);
		}
	
		if (!rawPersonObject) {
			return "";
		}
	
		var dividerText,
			sortKey = rawPersonObject.sortKey,
			sortOrder = runningInBrowser ? PersonList.SORT_LAST_FIRST : this.AppPrefs.get(ContactsLib.AppPrefs.Pref.listSortOrder);

		// Source and logic here ported from the PersonDisplayLite.create fn of the Mojo Contacts library (since the Globalization fns will fail)
		if (sortOrder === PersonList.SORT_FIRST_LAST || sortOrder === PersonList.SORT_LAST_FIRST) {
			//if there's a sort key and it doesn't start with the default character, use it
			if (sortKey && sortKey.slice(0, 1) !== PersonList.SORTKEY_DEFAULT_CHAR) {
				dividerText = sortKey.slice(0, 1);

				//make the divider text accent-free
				dividerText = enyo.g11n.Char.getBaseString(dividerText);

				//Some characters have a 2 character base
				dividerText = dividerText.slice(0, 1);

				return dividerText;
			} else {
				//else we use the default divider text
				return PersonList.DEFAULT_DIVIDER_TEXT;
			}
		} else {
			//if there's a sort key and it doesn't start with the default character, use it
			if (sortKey && sortKey.slice(0, 1) !== PersonList.SORTKEY_DEFAULT_CHAR) {
				dividerText = rawPersonObject.organization && rawPersonObject.organization.name;

				if (dividerText) {
					//make the divider text accent-free
					dividerText = enyo.g11n.Char.getBaseString(dividerText);
				
					//Some characters have a 2 character base
					dividerText = dividerText.slice(0, 1);

					return dividerText;
				} else {
					//not sure how we could ever get into this case, considering we have an org name in the sortKey
					//TODO: instead of reading from the org name directly, as above, should we parse the org name off the sortKey?

					//else we use the default divider text
					dividerText = PersonList.DEFAULT_DIVIDER_TEXT;

					return dividerText;
				}
			} else {
				//else we use the default divider text
				dividerText = PersonList.DEFAULT_DIVIDER_TEXT;

				return dividerText;
			}
		}	
	},
	gotPersonsCount: function (inSender, inResponse, inRequest) {
		if (inResponse.count !== undefined && this.isGalActive === true) {
			if (inResponse.count > 0) {
				this.maxIndex = inResponse.count - 1;
				// The DbList will only return a maximum of number of results equal to the pageSize, this is a limitation of a DB search
				if (this.maxIndex > (this.$.personList.pageSize - 1)) {
					this.maxIndex = this.$.personList.pageSize - 1;
				}
				// End of TODO
			} else { // There are no results but we still want to show the GAL if applicable
				this.maxIndex = 0;
			}
		} else {
			this.maxIndex = -1;
		}
	},
	gotPersonsCountFailed: function (inSender, inResponse, inRequest) {
		this.maxIndex = -1;
	},
	gotPersons: function (inSender, inResponse, inRequest) {
		var idArray = [], //where person Ids are collected for the im status query
			index;

		if (runningInBrowser) {	//for in-browser use (FOR APP PRODUCTION PEOPLE ONLY - will not be supported beyond this)
			for (index = 0; index < inResponse.results.length; index += 1) {
				idArray.push(inResponse.results[index]._id);
				MockPersonMap["" + inResponse.results[index]._id] = inResponse.results[index];
				MockPersonMap["" + inResponse.results[index]._id].contactCount = (index + 1);
			}
		}
		
		this._processPersonResults(inResponse, inRequest);
	},
	_processPersonResults: function (inResponse, inRequest) {
		var persons = inResponse.results || [],
			rawPerson,
			index;
		
		this.doListUpdated();
		this.persons = inResponse.results;
		
		for (index = 0; index < persons.length; index += 1) {
			rawPerson = persons[index];
			rawPerson.groupName = this.getGroupName(undefined, rawPerson);
			if (this.exclusions.length > 0) {
				if ((this.exclusions.indexOf(rawPerson._id) !== -1) ||
					(this.peopleWithAddressOnly === true && rawPerson.addresses && rawPerson.addresses.length === 0))
				{
					persons[index] = {excludedPerson: true, groupName: rawPerson.groupName};
				}
			}
		}

		if (this.searchProperty.val && this.maxIndex === 0) {
			inResponse.results.push({"emptyGALContact": ""});
		}

		this.$.personList.queryResponse(inResponse, inRequest);
	},
	gotPersonsWatch: function (inSender, inResponse, inRequest) {
		if (inResponse.fired === true) {
			this.$.personList.reset();

			if (this.searchProperty.val !== undefined) {
				this.setSearchString(this.searchProperty.val, true);
			}
		}
	},
	getContactFromItem: function (inItem) {
		var index = this.$.personList.fetchRowIndex();
		return this.persons[index % this.persons.length];
	},
	itemClick: function (inSender, inEvent, index) {
		var item = this.$.personList.fetch(index);
		this.doContactClick(item);
		this.toggleListSelection(false, index, item._id);
	},
	selectContact: function (inPersonId) {
		// Should un-highlight any previous item and highlight the person that matches with inPersonId
		var prevSelectedPersonIndex = this.selectedPersonInfo ? this.selectedPersonInfo.itemIndex : -1;
	
		// TODO: Don't know how to find the index of the inPersonId in the list yet & scroll to that position...
		//		Therefore just unselect any currently selected item in the list for now.
		this.selectedPersonInfo = undefined;
		if (prevSelectedPersonIndex >= 0) {
			//this.$.personList.updateRow(prevSelectedPersonIndex);
			this.$.personList.refresh(); // TODO Work-aroud since updateRow is no longer working for a enyo 0.10 DbList, remove once fixed in fmwk or ...
		}
	},
	toggleListSelection: function (inIsForGal, inIndex, inPersonId) {
		var prevSelectedPersonIndex = this.selectedPersonInfo ? this.selectedPersonInfo.itemIndex : -1,
			prevSelectedGalPersonIndex = this.selectedGalPersonInfo ? this.selectedGalPersonInfo.itemIndex : -1;
		
		// Remember which item is being selected
		if (inIsForGal) {
			this.selectedPersonInfo = undefined;
			this.selectedGalPersonInfo = {itemIndex: inIndex};
		} else {
			this.selectedPersonInfo = {itemIndex: inIndex, personId: inPersonId};
			this.selectedGalPersonInfo = undefined;
		}

		// Un-select any previously selected item
		if (prevSelectedPersonIndex >= 0) {
			//this.$.personList.updateRow(prevSelectedPersonIndex);
			this.$.personList.refresh(); // TODO Work-aroud since updateRow is no longer working for a enyo 0.10 DbList, remove once fixed in fmwk or ...
		}
		
		if (prevSelectedGalPersonIndex >= 0) {
			// TODO: this.$.GalList.renderRow is not working, thus calling render instead
			//this.$.GalList.renderRow(prevSelectedGalPersonIndex);
			this.$.GalList.render();
		}

		// Select the currrent item
		if (inIsForGal) {
			// TODO: this.$.GalList.renderRow is not working, thus calling render instead
			//this.$.GalList.renderRow(inIndex);
			this.$.GalList.render();
		} else {
			//this.$.personList.updateRow(inIndex);
			this.$.personList.refresh(); // TODO Work-aroud since updateRow is no longer working for a enyo 0.10 DbList, remove once fixed in fmwk or ...
		}
	},
	// GAL Functions
	resetGalStates: function () {
		this.$.galService.cancel();
		this.galData = [];
		this.gotGalData = false;
		this.maxIndex = -1;
		this.selectedGalPersonInfo = undefined;
		this.galResultsMsg = undefined;
		this.galSpinnerShowing = false;
	},
	onGalGetItem: function (inSender, inIndex) {
		var galPerson,
			selectedIndex = this.selectedGalPersonInfo ? this.selectedGalPersonInfo.itemIndex : -1;
		if (inIndex >= 0 && inIndex < this.galData.length) {
			galPerson = this.galData[inIndex];
			if (galPerson) {
				this.$.galPerson.setContent(galPerson.displayName);
				this.$.galItem.addRemoveClass("selected", inIndex === selectedIndex);
				return true;
			}
		}
	},
	gotGalResults: function (inSender, inResponse) {
		this.showGalSpinner(false);
		this.galData = inResponse.results || [];
		this.gotGalData = true;
		if (this.galData.length === 0) {
			this.galResultsMsg = crb.$L("No search results found");
		} else if (this.galData.length >= 100) {
			this.galResultsMsg = crb.$L("Over 100 results found. Please narrow your search query.");
		} else {
			this.galResultsMsg = undefined;
		}
		this.$.GalList.render();
		if (this.galData.length > 0) {
			this.$.GalDrawer.setOpen(true);
		}
		//this.$.personList.updateRow(this.maxIndex); // Needed so that changes to this.galMessage are rendered
		this.$.GalResultsMessage.addRemoveClass("last", (this.galData.length >= 100)); // oksana: this is the attempt... failed one.
		this.$.personList.refresh(); // TODO Work-aroud since updateRow is no longer working for a enyo 0.10 DbList, remove once fixed in fmwk or ...
	},
	gotGalFailure: function (inSender, inResponse) {
		this.showGalSpinner(false);
	},
	showGalSpinner: function (inShowing) {
		if (this.maxIndex >= 0) {
			this.galSpinnerShowing = inShowing;
			//this.$.personList.updateRow(this.maxIndex);
			this.$.personList.refresh(); // TODO Work-aroud since updateRow is no longer working for a enyo 0.10 DbList, remove once fixed in fmwk or ...
		}
	},
	GalMessageOnClick: function () {
		if (!this.$.GalDrawer.getOpen()) {
			this.showGalSpinner(true);
			if (runningInBrowser) {
				this.$.mockGalService.call();
			} else {
				this.$.galService.call({filterString: this.searchProperty.val, addressTypes: ["emails", "phoneNumbers", "ims"]});
			}
		}
	},
	onOpenAnimationComplete: function () {
		this.$.personList.refresh();
	},
	onGalPersonClick: function (inSender, inEvent) {
		var galPerson = this.galData[inEvent.rowIndex];
		if (galPerson) {
			galPerson.isGAL = true;
			this.toggleListSelection(true, inEvent.rowIndex, undefined);		
			this.doContactClick(galPerson);
		}
	}
});
