/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global $contactsui_path:true, runningInBrowser:true, window, enyo  */

$contactsui_path = "$enyo-lib/contactsui";

runningInBrowser = window.runningInBrowser ? window.runningInBrowser : (window.PalmSystem ? false : true);

if (!runningInBrowser) { //this is a global flag that is set by contacts app
/* device or emulator */
	enyo.depends(
		"/usr/palm/frameworks/mojoloader.js",
		"$enyo-lib/accounts/",
		"$enyo-lib/addressing/",
		"mojoshim/mojo-serviceRequest.js",
		"mojoshim/mojoCore-service.js",
		"mojoshim/importContactsBase.js",
		"Logic/AccountListEnyo.js",
		"UI/FieldGroup.js",
		"UI/PersonList.js",
		"UI/PersonListWidget.js",
		"UI/PseudoDetails.js",
		"UI/PersonListDialog.js",
		"utils/Utils.js",
		"css/contactsui.css"
	);
} else {
/* browser */
	enyo.depends(
		"$enyo-lib/accounts/",
		"$enyo-lib/addressing/",
		"Logic/AccountListEnyo.js",
		"UI/FieldGroup.js",
		"UI/PersonList.js",
		"UI/PersonListWidget.js",
		"UI/PseudoDetails.js",
		"UI/PersonListDialog.js",
		"utils/Utils.js",
		"css/contactsui.css"
	);
}
/*if (Mojo && Mojo.Core && Mojo.Core.Service) {
	Mojo.Core.Service.setup();
}*/
