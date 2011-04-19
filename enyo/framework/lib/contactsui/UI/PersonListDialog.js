/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name		: "com.palm.library.contactsui.personListDialog",
	kind		: enyo.Toaster,
	scrim		: true,
	style		: "top: 0; bottom: 0;",
	flyInFrom	: "left",

	events:
	{	
		onContactClick:"",
		onListUpdated:"",
		onSearchCriteriaUpdated:"",
		onSearchCriteriaCleared:"",
		onAddClick:""
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

	components: [], //VFlexBox container for personListWidget did not work out; add components dynamically to component list in create() only!

	create: function() {
		this.inherited(arguments);

		this.createComponent({kind: "com.palm.library.contactsui.personListWidget", 
			name: "personListWidget", 
			width: "350px", 
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
	
	open: function() {
		this.inherited(arguments);

		this.$.personListWidget.punt();
		if (this.exclusions && typeof(this.exclusions) === "array"){
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
	setExclusions : function (exclusions){
		this.$.personListWidget.setExclusions(exclusions);
	}
	
});		
