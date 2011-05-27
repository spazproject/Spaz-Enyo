/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
/*jslint white: true, onevar: true, undef: true, eqeqeq: true, plusplus: true, bitwise: true, 
regexp: true, newcap: true, immed: true, nomen: false, maxerr: 500 */
/*global ContactsLib, document, enyo, console, crb */

enyo.kind({
	name		: "com.palm.library.contactsui.personListDialog",
	kind		: "ModalDialog",
	layoutKind	: "VFlexLayout",
	caption		: crb.$L("Make A Selection"),
	scrim		: true,
//	height		: "500px",

	events:
	{	
		onContactClick: "",
		onListUpdated: "",
		onSearchCriteriaUpdated: "",
		onSearchCriteriaCleared: "",
		onAddClick: "",
		onCancelClick: ""
	},

	published:
	{	
		exclusions : [],
		mode: "noFilter",
		showSearchBar: true,
		showAddButton: false,
		showIMStatuses: true,
		showFavStars: true	
	},

	components: [
		{kind: "Control", height: "300px", layoutKind: "VFlexLayout", className: "group", components: [
			{name: "listWrapper", flex: 1, style: "margin: -6px -10px -10px;", components: [], kind: "VFlexBox"}
		]},
		{kind: "Button", caption: crb.$L("Cancel"), onclick: "doCancelClick"}
	], //VFlexBox container for personListWidget did not work out; add components dynamically to component list in create() only!

	componentsReady: function () {
		this.inherited(arguments);
		this.$.listWrapper.createComponent({kind: "com.palm.library.contactsui.personListWidget", 
			name: "personListWidget", 
			//width: "320px", 
			height: "100%",
			flex: 1,
			mode: this.mode, 
			showSearchBar: this.showSearchBar, 
			showAddButton: this.showAddButton, 
			onContactClick: "doContactClick", 
			onListUpdated: "doListUpdated", 
			onAddClick: "doAddClick", 
			onSearchCriteriaUpdated: "doSearchCriteriaUpdated", 
			onSearchCriteriaCleared: "doSearchCriteriaCleared", 
			showIMStatuses: this.showIMStatuses, 
			showFavStars: this.showFavStars,
			owner: this
		});
	},
	open: function () {
		this.inherited(arguments);

		this.$.personListWidget.punt();
		if (this.exclusions && typeof(this.exclusions) === "array") {
			this.$.personListWidget.setExclusions = this.exclusions;
		}
//		this.$.personListWidget.setMode(this.mode);
	},	
/*create: function create(){
		this.inherited (arguments);
		
	},
	ready: function (inWide) {
	this.$.contacts.setManager(this.$.left);
	this.$.contacts.setParent(this.$.left);
	this.$.left.show();
	if (this.hasNode()) {
	  this.render();
	}
  },
	ready: function(){
//		this.$.personListWidget.show();
		this.$.personListWidget.refresh();
	},

	closeDialog: function closeDialog(){
		this.close();
	},
*/
	closeDialog: function () {
		this.clearSearchField();
		this.close();
	},
	clearSearchField: function () {
		this.$.personListWidget.clearSearchField();
	},
	setExclusions : function (exclusions) {
		this.$.personListWidget.setExclusions(exclusions);
	}
	
});		
