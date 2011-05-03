/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.addressing = {};

enyo.addressing._$L = function(inText) {
	if (!this._resources) {
		this._resources = new enyo.g11n.Resources({root:"$enyo-lib/addressing/"});
	}
	return this._resources.$L(inText);
};

enyo.addressing.displayNameType = {
	NAME: "name",
	NICKNAME: "nickname",
	TITLE_AND_ORGANIZATION_NAME: "title_and_organization_name",
	ORGANIZATION_NAME: "organization_name",
	TITLE: "title",
	EMAIL: "email",
	IM: "im",
	PHONE: "phone",
	NONE: "none"
};

// FIXME: g11n not working on device, commenting out for now.
enyo.addressing.getFullNameFromRawObject = function(inName) {
	if (!this.formatter) {
		this.formatter = new enyo.g11n.NameFmt({locale: enyo.g11n.currentLocale().locale, style: enyo.g11n.Name.longName});
	}
	var name = new enyo.g11n.Name({
		prefix: inName.honorificPrefix,
		givenName: inName.givenName,
		middleName: inName.middleName,
		familyName: inName.familyName,
		suffix: inName.honorificSuffix
	});
	return this.formatter.format(name);
	return inName.givenName ? (inName.givenName + " " + inName.familyName) : "";
	
};

// Adapted from mojo2 addressing
enyo.addressing.generateDisplayName = function(rawPerson) {
	var obj = rawPerson,
		displayName = "",
		basedOnField = null,
		fullName = enyo.addressing.getFullNameFromRawObject(obj.name || {}),
		org;
	//
	var dn = enyo.addressing.displayNameType;
	//
	if (fullName) {
		displayName = fullName;
		basedOnField = dn.NAME;
	} else if (obj.nickname) {
		displayName = obj.nickname;
		basedOnField = dn.NICKNAME;
	} 
	//
	if (!displayName && obj.organization) {
		if (obj.organization.title && obj.organization.name) {
			displayName = obj.organization.title + ", " + obj.organization.name;
			basedOnField = dn.TITLE_AND_ORGANIZATION_NAME;
		} else if (!obj.organization.title && obj.organization.name) {
			displayName = obj.organization.name;
			basedOnField = dn.ORGANIZATION_NAME;
		} else if (obj.organization.title && !obj.organization.name) {
			displayName = obj.organization.title;
			basedOnField = dn.TITLE;
		}
	}
	//
	if (!displayName) {
		if (obj.emails && obj.emails.length) {
			displayName = obj.emails[0].value;
			basedOnField = dn.EMAIL;
		} else if (obj.ims && obj.ims.length) {
			displayName = obj.ims[0].value;
			basedOnField = dn.IM;
		} else if (obj.phoneNumbers && obj.phoneNumbers.length) {
			displayName = obj.phoneNumbers[0].value;
			basedOnField = dn.PHONE;
		} else {
			displayName = $L("[No Name Available]");
			basedOnField = dn.NONE;
		}
	}
	//
	return {
		displayName: displayName,
		basedOnField: basedOnField
	};
};


enyo.addressing.appendContactDisplayAddresses = function(inPerson, inTypes, inImTypes) {
	inPerson.displayAddresses = [];
	for (var i=0, t, a; t=inTypes[i]; i++) {
		a = inPerson[t];
		if (a) {
			if (t == "ims" && inImTypes) {
				a = enyo.addressing.filterAddressImTypes(a, inImTypes);
			}
			if (a && a.length) {
				enyo.addressing.formatAddresses(a, t, inPerson);
				inPerson.displayAddresses = inPerson.displayAddresses.concat(a);
			}
		}
	}
}

enyo.addressing.filterAddressImTypes = function(inAddresses, inImTypes) {
	var r = [];
	for (var i=0, a; a=inAddresses[i]; i++) {
		if (enyo.addressing.addressHasImTypes(a, inImTypes)) {
			r.push(a);
		}
	}
	return r;
}

enyo.addressing.addressHasImTypes = function(inAddress, inImTypes) {
	for (var i=0, t; t=inImTypes[i]; i++) {
			if (inAddress.type == t) {
				return inAddress;
			}
		}
}

enyo.addressing.formatAddresses = function(inAddresses, inContactType, inPerson) {
	for (var i=0, a; a=inAddresses[i]; i++) {
		inAddresses[i] = enyo.addressing.formatAddress(a, inContactType, inPerson);
	}
}

// NOTE: only phone currently requires special formatting.
enyo.addressing.formatAddress = function(inAddress, inContactType, inPerson) {
	if (!this.phoneFormatter) {
		this.phoneFormatter = new enyo.g11n.PhoneFmt();
	}
	var r = "remote";
	var id = inAddress.personId = inPerson._id || r;
	inAddress.label = enyo.addressing.fetchLabelFromType(inContactType, inAddress.type);
	inAddress.displayName = inPerson.displayName || (inPerson && enyo.addressing.generateDisplayName(inPerson).displayName);
	inAddress.addressType = inContactType;
	// localize phone numbers if they are not remote.
	if (inContactType == "phoneNumbers" && id != r) {
		inAddress.formattedValue = this.phoneFormatter.format(new enyo.g11n.PhoneNumber(inAddress.value));
		//console.dir(inAddress.formattedValue);
	} else {
		inAddress.formattedValue = inAddress.formattedValue || inAddress.value;
	}
	return inAddress;
}
