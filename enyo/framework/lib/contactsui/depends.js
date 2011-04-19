/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
$contactsui_path = "$enyo-lib/contactsui/"

enyo.depends(
	"/usr/palm/frameworks/mojoloader.js",
	"mojoshim/importContactsBase.js",
	"$enyo-lib/accounts/",
	"mojoshim/mojo-serviceRequest.js",
	"mojoshim/mojoCore-service.js",
	"Logic/AccountListEnyo.js",
	"UI/FieldGroup.js",
	"UI/PersonList.js",
	"UI/PersonListWidget.js",
	"UI/PseudoDetails.js",
	"UI/PersonListDialog.js",
	"css/contacts.css"
);
