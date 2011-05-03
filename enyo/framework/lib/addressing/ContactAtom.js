/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.ContactAtom",
	kind: "Button",
	layoutKind: "HFlexLayout",
	align: "center",
	pack: "center",
	className: "enyo-button enyo-contact-atom",
	published: {
		contact: null,
		isButtony: false,
		separator: "",
		spinnerShowing: false
	},
	events: {
		onGetContact: ""
	},
	chrome: [
		{name: "content", className: "enyo-contact-atom-content", flex: 1},
		{kind: "Spinner", className: "enyo-contact-atom-spinner", showing: false}
	],
	constructor: function() {
		this.contact = {};
		this.inherited(arguments);
	},
	create: function() {
		this.inherited(arguments);
		this.contactChanged();
		this.isButtonyChanged();
		this.spinnerShowingChanged();
	},
	isButtonyChanged: function() {
		this.addRemoveClass("enyo-button", this.isButtony);
		if (!this.isButtony) {
			this.setSpinnerShowing(false);
		}
		this.contactChanged();
	},
	contactChanged: function() {
		var v = this.contact && (this.contact.displayName || this.contact.name) || "";
		v = v + (this.isButtony ? "" : this.separator);
		this.$.content.setContent(v);
		// if we don't have a contact id and haven't tried to get it, send event
		if (this.contact.personId) {
			this.setSpinnerShowing(false);
		} else if (!this.alreadyGotContact) {
			this.alreadyGotContact = true;
			//this.setSpinnerShowing(true);
			this.doGetContact();
		}
	},
	separatorChanged: function() {
		this.contactChanged();
	},
	spinnerShowingChanged: function() {
		this.$.spinner.setShowing(this.spinnerShowing);
	}
});