/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.AddressingPopup",
	kind: enyo.Control,
	published: {
		contacts: null,
		/* Address types as defined by the contacts schema that should be
		 * returned for each contact.
		 *
		 * Options are "emails", "phoneNumbers", and "ims"
		 */
		addressTypes: null,
		imTypes: null,
		inputType: "email",
		expandButtonCaption: enyo.addressing._$L("To:"),
		popupClassName: ""
	},
	events: {
		/**
		Event fired when the expand button (left of the input) is clicked
		*/
		onExpandButtonClick: "",
		/**
		Event fired when a contact is accepted; implement to decorate the contact with extra information,
		such as providing an "type" (address type) for reverse lookup.
		*/
		onDecorateContact: ""
	},
	//* @protected
	components: [
		{name: "input", kind: "AtomizingInput",
			onFilterStringChanged: "inputFilterStringChanged",
			onAtomize: "inputAtomize",
			onGetContact: "inputGetContact",
			onfocus: "inputFocus",
			onblur: "inputBlur",
			onEditContact: "inputEditContact",
			onShowAllButtonClick: "inputShowAllContacts",
			onExpandButtonClick: "doExpandButtonClick",
			onFilterCleared: "inputFilterCleared"
		},
		{kind: "ReverseLookupService", onSuccess: "gotReverseLookup", onFailure: "failedReverseLookup"},
		{kind: "Popup", layoutKind: "VFlexLayout", dismissWithClick: false, onmousedown: "popupMousedown",
			onmousedown: "popupMousedown", className: "enyo-addressing-popup enyo-bg", components: [
			{name: "client"},
			{name: "list", flex: 1, kind: "AddressingList", onSelect: "listSelect"}
		]}
	],
	create: function() {
		this.inherited(arguments);
		if (!this.addressTypes) {
			this.addressTypes = ["emails"];
		}
		this.contactsChanged();
		this.expandButtonCaptionChanged();
		this.addressTypesChanged();
		this.imTypesChanged();
		this.inputTypeChanged();
		this.popupClassNameChanged();
	},
	setOrderStyle: function(inClassName) {
		this.$.input.setOrderStyle(inClassName);
	},
	popupClassNameChanged: function(inOldValue) {
		if (inOldValue) {
			this.$.popup.removeClass(inOldValue);
		}
		this.$.popup.addClass(this.popupClassName);
	},
	popupMousedown: function(inSender, inEvent) {
		inEvent.preventDefault();
	},
	addressTypesChanged: function() {
		this.$.list.setAddressTypes(this.addressTypes);
	},
	imTypesChanged: function() {
		this.$.list.setImTypes(this.imTypes);
	},
	expandButtonCaptionChanged: function() {
		this.$.input.setExpandButtonCaption(this.expandButtonCaption);
	},
	inputTypeChanged: function() {
		this.$.input.setInputType(this.inputType);
	},
	popupMousedown: function(inSender, inEvent) {
		if (inEvent.dispatchTarget.isDescendantOf(this.$.popup)) {
			inEvent.preventDefault();
		}
	},
	contactsChanged: function() {
		this.$.input.setContacts(this.contacts);
	},
	getContacts: function() {
		return this.$.input.getContacts();
	},
	//* @public
	/**
	Return the value of the addresssing input, the non-atomized portion.
	*/
	getInputValue: function() {
		return this.$.input.getInputValue();
	},
	/**
	Force the value of the input to become an input atom.

	inContact {Object} The contact to atomize, by default inContact will be given a 
	displayName and value property set to the current value of the addressing input.

	*/
	addContact: function(inContact) {
		this.$.input.atomizeInput(inContact);
	},
	/**
	Force the addressing input to be focused.
	*/
	forceFocus: function() {
		this.$.input.forceFocus();
	},
	//* @protected
	inputFocus: function(inSender, inEvent) {
	},
	inputBlur: function() {
		this.close();
	},
	inputGetContact: function() {
		var selected = this.$.list.getSelected();
		return (selected ? selected.address : null);
	},
	//* @public
	//* search for contacts by person name
	search: function(inSearch) {
		this.open();
		this.$.input.setInputValue(inSearch);
	},
	//* close the addressing popup
	close: function() {
		this.$.popup.close();
	},
	//* if the popup is closed, open it, otherwise close it
	toggleSearch: function(inSearch) {
		if (this.$.popup.isOpen) {
			this.close();
		} else {
			this.search(inSearch);
		}
	},
	//* @protected
	open: function() {
		var n = this.hasNode();
		if (n) {
			this.$.popup.applyStyle("min-width", n.offsetWidth + "px");
		}
		this.$.popup.openAroundControl(this.$.input);
	},
	inputAtomize: function(inSender, inAtom) {
		var contact = inAtom.contact;
		// expose event for user to decorate contact?
		this.doDecorateContact(contact);
		if (!contact.personId) {
			if (!contact.type) {
				contact.type = this.addressTypes.length == 1 ? this.addressTypes[0] : null;
			}
			// need type for reverse lookup.
			this.reverseLookupContact(inAtom);
		} else {
			inAtom.setContact(contact);
		}
		this.close();
	},
	reverseLookupContact: function(inAtom) {
		var contact = inAtom.contact;
		var t = contact.type;
		if (t) {
			this.$.reverseLookupService.call({address: contact.value, type: contact.type}, {atom: inAtom});
		}
	},
	gotReverseLookup: function(inSender, inResponse, inRequest) {
		var atom = inRequest.atom;
		var r = inResponse.results[0];
		if (r) {
			atom.setContact(r);
		}
	},
	failedReverseLookup: function(inSender, inResponse, inRequest) {
		// udpate the atom with any decoration the user made
		var a = inRequest.atom;
		a.setContact(a.contact);
	},
	refreshList: function() {
		this.$.list.refresh();
	},
	inputFilterCleared: function() {
		this.close();
	},
	inputShowAllContacts: function() {
		this.toggleSearch();
	},
	inputFilterStringChanged: function(inSender, inFilter) {
		this.listSearch(inFilter);
	},
	inputEditContact: function(inSender, inAtom) {
		this.listSearch(inAtom.contact.displayName || inAtom.contact.value);
	},
	listSearch: function(inFilter) {
		this.open();
		this.$.list.search(inFilter);
	},
	listSelect: function(inSender, inSelected) {
		this.$.input.atomizeInput(inSelected.address);
	}
});
