/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "enyo.FilteredContactList",
	kind: enyo.VFlexBox,
	published: {
		propName: "", // eg. emails, phoneNumbers, ims...
		filter: "",
		offsetBottom: 0
	},
	events: {
		onItemClick: "",
		onFormatData: "",
		onGetPropValue: ""
	},
	chrome: [
		{name: "getContacts", kind: "DbService", dbKind: "com.palm.person:1", onSuccess: "gotContacts"},
		{name: "list", kind: "VirtualList", flex: 1, onSetupRow: "listSetupRow", components: [
			{name: "divider", kind: "Divider"},
			{name: "item", kind: "Item", layoutKind: "HFlexLayout", onclick: "itemClick", className: "enyo-filtered-contact-list-item", components: [
				{name: "value", flex: 1},
				{name: "type", className: "enyo-filtered-contact-list-type-label"}
			]}
		]}
	],
	renderList: function() {
		this.$.list.refresh();
		var n = this.hasNode(), ln = this.$.list.hasNode();
		if (!this.height && n && ln) {
			// if height is not set, adjust it based on the height of the underlying list after it has been rendered
			n.style.height = ln.offsetHeight + "px";
			n.style.maxHeight = (document.body.offsetHeight - this.$.list.getOffset().top - this.offsetBottom) + "px";
		}
	},
	filterChanged: function() {
		if (this.filter) {
			var whereClause = [{"prop":"searchProperty","op":"?","val":this.filter,"collate":"primary"}, {"prop":"favorite","op":"=","val":[true,false]}];
			this.getContacts({where: whereClause}, this.filter);
		} else {
			this.gotContacts();
		}
	},
	getContacts: function(inQuery, inSearch) {
		var q = enyo.mixin({
			orderBy: "sortKey",
			desc: false
		}, inQuery);
		var method = inSearch ? "search" : "find";
		this.$.getContacts.call({query: q}, {method: method});
	},
	gotContacts: function(inSender, inResponse) {
		var r = (inResponse && inResponse.results) || [];
		r = this.doFormatData(r) || r;
		this.contacts = [];
		for (var i=0, c; c=r[i]; i++) {
			for (var j=0; e=c[this.propName][j]; j++) {
				var contact = enyo.mixin({_propIndex: j}, c);
				this.contacts.push(contact);
			}
		}
		this.renderList();
	},
	listSetupRow: function(inSender, inRow) {
		var c = this.contacts[inRow];
		if (c) {
			var prop = c[this.propName][c._propIndex];
			this.$.value.content = this.doGetPropValue(prop) || prop.value;
			this.$.type.content = this.getType(prop) || "";
			this.$.divider.setCaption(this.getFullName(c));
			this.$.divider.applyStyle("display", c._propIndex ? "none" : "");
			return true;
		}
	},
	getFullName: function(inContact) {
		return inContact.name.givenName + " " + (inContact.name.familyName || "");
	},
	getType: function(inProp) {
		return inProp.type && inProp.type.indexOf("type_") == 0 && inProp.type.substring(5).toUpperCase();
	},
	getContactFromItem: function(inItem) {
		var index = this.$.list.fetchRowIndex();
		return this.contacts[index % this.contacts.length];
	},
	itemClick: function(inSender) {
		var c = this.getContactFromItem(inSender); 
		this.doItemClick([c[this.propName][c._propIndex],c]);
	}
});
