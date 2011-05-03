/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/**
	Wish list:
	* Add persistent mru support
*/
enyo.kind({
	name: "enyo.AddressingList",
	kind: enyo.VFlexBox,
	published: {
		/* Address types as defined by the contacts schema that should be
		 * returned for each contact.
		 *
		 * Options are one or more of "emails", "phoneNumbers", and "ims"
		 */
		addressTypes: null,
		imTypes: null,
		selected: null
	},
	events: {
		/**
		Event fires when an address is selected; in addition to inSender, fires with:
		
		inDisplayAddress {Object} The selected address 

		inAddress {Object} The contact record for the selected address
		*/
		onSelect: ""
	},
	filterHighlightClassName: "enyo-text-filter-highlight",
	//* @protected
	components: [
		{kind: "DbPages", onQuery: "dbPagesQuery", onReceive: "receiveDbPage"},
		{kind: "DbService", dbKind: "com.palm.person:1", onSuccess: "querySuccess", onFailure: "gotFailure", components: [
			{name: "find", method: "find", onSuccess: "gotPageResults"},
			{name: "search", method: "search", onSuccess: "gotSearchResults"},
			{name: "get", method: "get"}
		]},
		{kind: "GalService", onSuccess: "gotGalResults", onFailure: "gotFailure"},
		{name: "list", flex: 1, kind: "VirtualList", className: "enyo-addressing-list", 
			onAcquirePage: "listAcquirePage", onDiscardPage: "listDiscardPage", onSetupRow: "listSetupRow", components: [
			{name: "client", canGenerate: false},
			{kind: "Divider", className: "enyo-addressing-item-divider"},
			{name: "addressList", kind: "VirtualRepeater", className: "enyo-addressing-item-addresses", onGetItem: "addressGetItem", components: [
				{kind: "Item", tapHighlight: true, onclick: "selectItem", components: [
					{name: "addressType", className: "enyo-addressing-type"},
					{name: "address"}
				]}
			]}
		]},
		{kind: "Spinner", className: "enyo-addressing-list-spinner", showing: false}
	],
	favoriteHtml: '<div class="enyo-addressing-favorite"></div>',
	create: function() {
		this.data = [];
		this.inherited(arguments);
		if (!this.addressTypes) {
			this.addressTypes = ["emails"];
		}
		// FIXME: see fixme at "listRowToPage"
		this.$.list.rowToPage = enyo.bind(this, "listRowToPage");
		this.addressTypesChanged();
	},
	addressTypesChanged: function() {
		this.querySelect =
			[
				"_id",
				"favorite",
				"name",
				"names",
				"nickname",
				"organization"
			].concat(this.addressTypes || []);
	},
	updateSelection: function(inEvent) {
		var i = this.$.list.fetchRowIndex();
		var vi = inEvent.rowIndex;
		var r = this.fetchRow(i);
		var vr = r.displayAddresses[vi];
		this.setSelected({person: r, address: vr});
		this.$.list.refresh();
	},
	selectItem: function(inSender, inEvent) {
		this.updateSelection(inEvent);
		var s = this.getSelected();
		if (s) {
			enyo.asyncMethod(this, "doSelect", s);
		}
	},
	editContact: function(inSender, inContact) {
		this.$.get.call({
			ids: [inContact.contactId]
		});
	},
	//* @public
	/** 
	Initiate a address search. 
	First, we query for favorites because they should always be shown at the top of the list.
	Then if inSearch is specified we do an un-paged filter search for up to 200 local contacts and 
	add up to 100 gal contacts per account.
	If inSearch is not specified, we do a paged search for all local contacts.
	*/
	search: function(inSearch) {
		this.cancelSearch();
		this.isFiltering = this.searchString = inSearch || "";
		// first get favorites...
		this.searchForFavorites();
	},
	cancelSearch: function() {
		this.data = [];
		this.setSelected(null);
		this.$.find.cancel();
		this.$.search.cancel();
		this.$.galService.cancel();
	},
	//* @protected
	searchForFavorites: function() {
		this.searchForFilterLocal(this.searchString, true, null, {onSuccess: "gotFavorites"});
	},
	gotFavorites: function(inSender, inResponse) {
		this.data = inResponse.results;
		// punt the list
		this.allowListPaging  = true;
		this.$.list.$.buffer.flush();
		this.allowListPaging = !this.isFiltering;
		this.$.list.punt();
		// If we're not filtering and therefore paging data, the list will take care of 
		// retrieving its own data pages so do nothing, otherwise do a filter search
		if (this.isFiltering) {
			this.searchForFilter();
		}
	},
	searchForFilter: function() {
		this.$.spinner.show();
		this.$.galService.call({filterString: this.searchString, addressTypes: this.addressTypes});
		this.searchForFilterLocal(this.searchString, false, 200);
	},
	searchForFilterLocal: function(inSearch, inFavorites, inLimit, inRequestInfo) {
		var query = {
			orderBy: "sortKey",
			desc: false,
			select: this.querySelect,
			where: []
		}
		if (inLimit) {
			query.limit = inLimit;
		}
		if (inSearch) {
			query.where.push({prop: "searchProperty", op: "?", val: inSearch, collate: "primary"});
		}
		query.where.push({prop: "favorite", op: "=", val: inFavorites || false});
		this.$.search.call({query: query}, enyo.mixin({favorites: inFavorites}, inRequestInfo));
	},
	gotSearchResults: function(inSender, inResponse, inRequest) {
		this.data = this.data.concat(inResponse.results);
		this.$.list.refresh();
	},
	gotGalResults: function(inSender, inResponse) {
		this.$.spinner.hide();
		this.data = this.data.concat(inResponse.results);
		this.$.list.refresh();
	},
	gotFailure: function(inSender, inResponse) {
		this.$.spinner.hide();
		//console.log("Contact lookup failed: " + (inResponse && inResponse.errorText));
	},
	// list paging query/response
	dbPagesQuery: function(inSender, inQuery) {
		inQuery.select = this.querySelect;
		inQuery.orderBy = "sortKey";
		inQuery.where = [{prop: "favorite", op: "=", val: false}];
		return this.$.find.call({
			query: inQuery
		});
	},
	gotPageResults: function(inSender, inResponse, inRequest) {
		this.$.dbPages.queryResponse(inResponse, inRequest);
		this.$.list.refresh();
	},
	// FIXME: VirtualList could expose an api for this...
	// since paged list contains non-paged data, we need to adjust
	// the calculation of rowToPage
	listRowToPage: function(inRowIndex) {
		return Math.floor((inRowIndex - this.data.length) / this.$.list.pageSize);
	},
	listAcquirePage: function(inSender, inPage) {
		if (this.allowListPaging) {
			this.$.dbPages.require(inPage);
		}
	},
	listDiscardPage: function(inSender, inPage) {
		if (this.allowListPaging) {
			this.$.dbPages.dispose(inPage);
		}
	},
	// data processing for list
	fetchRow: function(inIndex) {
		//return this.$.dbPages.fetch(inIndex);
		if (inIndex < this.data.length) {
			return this.data[inIndex];
		} else {
			return this.$.dbPages.fetch(inIndex - this.data.length);
		}
	},
	listSetupRow: function(inSender, inIndex) {
		var d = this.fetchRow(inIndex);
		if (d) {
			// Show controls only on first row when filtering.
			this.$.client.canGenerate = Boolean(this.isFiltering && inIndex == 0);
			//
			enyo.addressing.appendContactDisplayAddresses(d, this.addressTypes, this.imTypes);
			this.repeaterPerson = d;
			// if there's more than one address, show a divider
			if (d.displayAddresses.length) {
				var recordName = d.name;
				var dn = d.displayName ? d : enyo.addressing.generateDisplayName(d);
				d.displayName = dn.displayName;
				//
				this.$.divider.show();
				var dn = d.displayName;
				if (this.searchString) {
					dn = enyo.string.applyFilterHighlight(dn, this.searchString, this.filterHighlightClassName);
				}
				if (d.favorite) {
					dn += this.favoriteHtml;
				}
				this.$.divider.setCaption(dn);
				// setup selection
				if (!this.selected && this.isFiltering) {
					this.selected = {person: d, address: d.displayAddresses[0]};
				}
			} else {
				this.$.divider.hide();
			}
			return true;
		}
	},
	addressGetItem: function(inSender, inIndex) {
		var displayAddresses = this.repeaterPerson.displayAddresses;
		var address = displayAddresses[inIndex];
		if (address) {
			var s = inIndex == 0 ? "border-top: 0;" : ""
			s += (inIndex == displayAddresses.length-1 ? "border-bottom: 0;" : "");
			this.$.item.addStyles(s);
			this.$.item.addRemoveClass("enyo-addressing-item-selected", 
				this.selected && (this.repeaterPerson == this.selected.person) && (address == this.selected.address));
			this.$.address.setContent(address.formattedValue);
			this.$.addressType.setContent(address.label);
			return true;
		}
		this.rowAddresses = null;
	}
});