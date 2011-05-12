/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, document, enyo, console, runningInBrowser, PersonList, MockPersonMap, $L, $contactsui_path */

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
			{name: "getPersons", method: "find", dbKind: "com.palm.person:1", onSuccess: "gotPersons", subscribe: true, reCallWatches: true, sortBy: "sortKey"}, //im status feature: getPersons -> chainGetImBuddyStatus 
			{name: "searchPersons", method: "search", dbKind: "com.palm.person:1", onSuccess: "gotPersons", subscribe: false, sortBy: "sortKey"},
			{name: "searchPersonsCnt", method: "search", dbKind: "com.palm.person:1", onSuccess: "gotPersonsCount", onFailure: "gotPersonsCountFailed", subscribe: false, sortBy: "sortKey"}
		]},
		{kind: "TempDbService", components: [
			{name: "getIMStatuses", method: "find", dbKind: "com.palm.imbuddystatus:1", onSuccess: "gotIMStatuses", subscribe: false, reCallWatches: false}
		]},
		{name: "galService", kind: "GalService", onSuccess: "gotGalResults", onFailure: "gotGalFailure"},
		{name: "personList", kind: "DbList", pageSize: 21, onQuery: "listQuery", flex: 1, onSetupRow: "getListItem", components: [
			{name: "divider", className: "enyo-divider-alpha", showing: false, components: [
				{name: "dividerLabel", className: "enyo-divider-alpha-caption divider-Label"}
			]},
			{name: "personItem", kind: "Item", layoutKind: "HFlexLayout", pack: "start", align: "center", onclick: "itemClick", components: [
				{className: "icon", components: [
					{name: "photo", kind: "Control", className: "img"},
					{name: "photoMask", kind: "Control", className: "mask"} // name "photoMask" needed for CFISH
				]},
				{name: "contactName", className: "name", wantsEvents: false},
				{name: "favIcon", className: "favorite"}
//				{name: "availabilityIcon", className: "status", kind: "Image", src: "images/status-away.png"},
			]},
			// GAL related items
			{name: "GalDivider", kind: enyo.Divider, caption: $L("GLOBAL ADDRESS LOOKUP"), canGenerate: false},
			{kind: "HFlexBox", name: "GalMessage", onclick: "GalMessageOnClick", canGenerate: false, components: [
				{content: $L("Search Exchange"), className: "contacts-GAL-message"}, // TODO: Can Exchange be replaced????
				{kind: "Spacer"},
				{name: "GalArrow", kind: enyo.Image, className: "contacts-gal-arrow", src: $contactsui_path + "/images/gal-arrow.png"},
				{name: "GalSpinner", kind: "Spinner", className: "contacts-gal-spinner"}
			]},
			{name: "GalNoResultsMessage", kind: "VFlexBox", showing: false, canGenerate: false, flex: 1, components: [
				{kind: "Spacer"},
				{content: $L("No search results found"), flex: 1, className: "contacts-gal-noresults"}
			]},
			{name: "GalDrawer", kind: enyo.Drawer, open: false, canGenerate: false, onOpenAnimationComplete: "onOpenAnimationComplete", components: [
				{name: "GalList", kind: enyo.VirtualRepeater, onGetItem: "onGalGetItem", components: [
					{name: "galPerson", className: "contacts-gal-person", onclick: "onGalPersonClick"}
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
			}.bind(this));
		} else {
			this.refresh();
		}
	
		this.favoriteProperty = {prop: "favorite", op: "=", val: undefined};
		this.searchProperty = {prop: "searchProperty", op: "?", val: undefined, collate: "primary"};
		this.applySearchString = true;
		this.galData = [];
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
		if (this.isAppPrefsReady === true) {
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
		this.isGalActive = (this.enableGAL && this.applySearchString);
	},
	setExclusions: function (exclusionsArray) {
		this.exclusions = exclusionsArray;
		if (this.readyFlag) {
			this.refresh();
		}
	},
	setSearchString: function (searchString) {
		var srchQuery;
		
		this.resetGalStates();

		if (this.applySearchString === true && searchString) {
			this.searchProperty.val = searchString;
			if (this.isGalActive === true) {
				srchQuery = {orderBy: "sortKey", desc: false, where: [this.searchProperty]};
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
		query.query.desc = false;
		//console.log("|||QUERY||| " + enyo.json.to(query));

		if (this.applySearchString === true && this.searchProperty.val !== undefined) {
			if (this.favoriteProperty.val === undefined) {
				query.query.where = [this.searchProperty, {prop: "favorite", op: "=", val: [true, false]}];
			} else {
				query.query.where = [this.searchProperty, this.favoriteProperty];
			}
			// TODO: Need to figure out why DbList only returns a maximun of 1 page for searching, after this is fixed look at the TODO in gotPersonsCount
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

/*** IM STATUS LOGIC
	chainGetImBuddyStatus : function (inSender, inResponse, inRequest){

		var index,
			idArray = [], //where person Ids are collected for the im status query
			query = {query: {
					where : [{prop: "personId", op: "=", val: idArray}]
				}
			};
	
		for (index = 0; index < inResponse.results.length; index += 1) {
			idArray.push(inResponse.results[index]._id);
			if (runningInBrowser) {
				MockPersonMap["" + inResponse.results[index]._id] = inResponse.results[index];
				MockPersonMap["" + inResponse.results[index]._id].contactCount = (index+1);
			}
		}
console.info("Personlist - querying QUERY " + JSON.stringify(query));

		this.doListUpdated();
		this.persons = inResponse.results;
		this.$.personList.queryResponse(inResponse, inRequest);

		this.$.getIMStatuses.call(query);
	},
	gotIMStatuses: function (inSender, inResponse, inRequest){
		var index,
			key;
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
***/

	getListItem: function (inSender, inPerson, inIndex) {		
		if (this.isGalActive && inIndex === this.maxIndex) {
			this.$.GalDivider.canGenerate = true;
			this.$.GalMessage.canGenerate = true;
			this.$.GalSpinner.setShowing(this.galSpinnerShowing);
			this.$.GalList.canGenerate = true;
			this.$.GalDrawer.canGenerate = true;
			this.$.GalNoResultsMessage.canGenerate = true;
			this.$.GalNoResultsMessage.setShowing(this.showGalNoResultsMessage);
			this.$.GalArrow.setShowing(!this.showGalNoResultsMessage && !this.galSpinnerShowing && !this.$.GalDrawer.getOpen());
		} else {
			this.$.GalDivider.canGenerate = false;
			this.$.GalMessage.canGenerate = false;
			this.$.GalList.canGenerate = false;
			this.$.GalDrawer.canGenerate = false;
			this.$.GalNoResultsMessage.canGenerate = false;
		}

		//inPerson is the same as this.$.personList.fetch(inIndex)
		var future,
//			personListPageSize = this.$.personList.getPageSize(),
			l,
			displayName,
//			type = this.showFavOnly ? ContactsLib.PersonPhotos.TYPE.SQUARE : ContactsLib.PersonPhotos.TYPE.LIST,
			type = this.showFavOnly ? ContactsLib.PersonPhotos.TYPE.BIG : ContactsLib.PersonPhotos.TYPE.LIST,
			noDividerAfter;
			
		if (inPerson.emptyGALContact !== undefined) {
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
//IM STATUS STUFF 
/*
			if (inPerson.personAvailability === 4) {
				displayName += "---OFFLINE---";
			} else if (inPerson.personAvailability === 2) {
				displayName += "---AWAY---";
			} else if (inPerson.personAvailability === 0) {
				displayName += "---AVAILABLE---";
			}
*/
			this.$.contactName.setContent(displayName);
			this.$.favIcon.applyStyle("display", !this.showFavOnly && this.showFavStars && inPerson.favorite ? "inline-block" : "none");
			future = ContactsLib.PersonPhotos.getPhotoPath(inPerson.photos, type, !this.showFavOnly);
			future.now(this, function () {
				this.$.photo.applyStyle("background-image", "url(" + future.result + ");");
		
//				this.$.photo.domAttributes.src = future.result;
			});
			l = this.getGroupName(inIndex, inPerson);
			this.renderDivider(inIndex, l);

			noDividerAfter = (this.getGroupName(inIndex + 1) === l);
			this.$.personItem.addRemoveClass('first', this.$.divider.getShowing() ? true : false);
			this.$.personItem.addRemoveClass('last', noDividerAfter ? false : true);

			if (this.exclusions && Array.isArray(this.exclusions)) {
				if (this.exclusions.indexOf(inPerson._id) !== -1) {
					this.$.personItem.hide();
//TODO: also display and hide divs in a smarter manner
				}
			} else if (this.peopleWithAddressOnly === true && inPerson.addresses && inPerson.addresses.length === 0) {
				this.$.personItem.hide();
			}

			if (this.selectedPersonInfo && inPerson._id === this.selectedPersonInfo.personId) {
				this.$.personItem.addClass('selected');
			} else {
				this.$.personItem.removeClass('selected');
			}
			return true;
		}
	},
	renderDivider: function (inIndex, l)
	{
		var prevDividerTxt = inIndex > 0 ? this.getGroupName(inIndex - 1) : undefined;
		this.$.divider.setShowing(inIndex === 0 || (l !== "" && prevDividerTxt !== l));
		if (this.$.divider.getShowing()) {
			this.$.dividerLabel.setContent(l);
		}
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
				// TODO: Remove this hack since the search does not return any more pages for the DbList when the results have more results than the pageSize
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
		this.doListUpdated();
		if (runningInBrowser) {	//for in-browser use (FOR APP PRODUCTION PEOPLE ONLY - will not be supported beyond this)
			var index,
				idArray = []; //where person Ids are collected for the im status query

			for (index = 0; index < inResponse.results.length; index += 1) {
				idArray.push(inResponse.results[index]._id);
				MockPersonMap["" + inResponse.results[index]._id] = inResponse.results[index];
				MockPersonMap["" + inResponse.results[index]._id].contactCount = (index + 1);
			}
		}
		this.persons = inResponse.results;
		//console.log("========" + JSON.stringify(inResponse.results[0]));
//		inResponse.results.push({ });
		// TODO: Preset the dividerText for each rawPerson object????
		/*
		if (this.persons && this.persons.length > 0) {
			this.persons.forEach(function(rawPerson) {
				// Ideally we would use ContactsLib.PersonDisplayLite but it uses the globalization objects, therefore we have to re-implement some of the functionality ourselves
			});
		}*/
		
		if (this.searchProperty.val && this.maxIndex === 0) {
			inResponse.results.push({"emptyGALContact": ""});
		}

		this.$.personList.queryResponse(inResponse, inRequest);
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
			this.$.personList.updateRow(prevSelectedPersonIndex);
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
			this.$.personList.updateRow(prevSelectedPersonIndex);
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
			this.$.personList.updateRow(inIndex);
		}
	},
	// GAL Functions
	resetGalStates: function () {
		this.$.galService.cancel();
		this.galData = [];
		this.maxIndex = -1;
		this.selectedGalPersonInfo = undefined;
		this.showGalNoResultsMessage = false;
		this.galSpinnerShowing = false;	
	},
	onGalGetItem: function (inSender, inIndex) {
		var galPerson,
			selectedIndex = this.selectedGalPersonInfo ? this.selectedGalPersonInfo.itemIndex : -1;
		if (inIndex >= 0 && inIndex < this.galData.length) {
			galPerson = this.galData[inIndex];
			if (galPerson) {
				this.$.galPerson.setContent(galPerson.displayName);
				this.$.galPerson.addRemoveClass('selected', inIndex === selectedIndex);
				return true;
			}
		}
	},
	gotGalResults: function (inSender, inResponse) {
		this.showGalSpinner(false);
		this.galData = inResponse.results || [];
		if (this.galData.length > 0) {
			this.showGalNoResultsMessage = false;
		} else {
			this.showGalNoResultsMessage = true;
		}
		this.$.GalList.render();
		if (this.galData.length > 0 && this.galData.length <= 100) {
			this.$.GalDrawer.setOpen(!this.$.GalDrawer.getOpen());
		}
		this.$.personList.updateRow(this.maxIndex); // Needed so that changes to this.showGalNoResultsMessage are rendered
	},
	gotGalFailure: function (inSender, inResponse) {
		this.showGalSpinner(false);
	},
	showGalSpinner: function (inShowing) {
		if (this.maxIndex >= 0) {
			this.galSpinnerShowing = inShowing;
			this.$.personList.updateRow(this.maxIndex);
		}
	},
	GalMessageOnClick: function () {
		if (!this.$.GalDrawer.getOpen()) {
			this.showGalSpinner(true);
			this.$.galService.call({filterString: this.searchProperty.val, addressTypes: ["emails", "phoneNumbers", "ims"]});
		}
	},
	onOpenAnimationComplete: function () {
		this.$.personList.refresh();
	},
	onGalPersonClick: function (inSender, inEvent) {
		var galPerson = this.galData[inEvent.rowIndex];
		if (galPerson) {
			this.toggleListSelection(true, inEvent.rowIndex, undefined);		
			this.doContactClick(galPerson);
		}
	}
});
