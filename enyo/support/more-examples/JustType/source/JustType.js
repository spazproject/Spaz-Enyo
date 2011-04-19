/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	name: "JustType",
	kind: enyo.VFlexBox,
	published: {
		selectedRecord: null,		
		launchParams: null
	},
	components: [
		{kind: "DbService", dbKind: "com.palmdts.justtype:1", onFailure: "dbNonExistent", components: [
			{name: "dbFind", method: "find", onSuccess: "queryResponse"},
			{name: "dbDel", method: "del", onSuccess: "deletedResponse"},
			{name: "dbPut", method: "put"},
			{name: "dbMerge", method: "merge"}
		]},
		{flex: 1, name: 'mainPane', kind: "Pane", transitionKind: "enyo.transitions.Simple", components: [
			{kind: "VFlexBox", name: 'mainView', components:[
				{kind: "PageHeader", content: "Just Type"},
				{flex: 1, name: "list", kind: "DbList", pageSize: 50, onQuery: "listQuery", onSetupRow: "listSetupRow", components: [
					{name: "item", kind: "SwipeableItem", className: "item", tapHighlight: false, confirmCaption: "Delete", onConfirm: "swipeDelete", onclick: "itemClick", components: [
						{kind: "VFlexBox", components: [
							{name: "itemFirstName"},
							{name: "itemLastName"},
							{name: "itemPosition"},
							{name: "itemClub"},
						]},
					]}
				]},
				{kind: "Toolbar", pack: "justify", components: [
					{icon: "images/menu-icon-new.png", onclick: "createNewPlayer"}
				]}
			]},
			{kind: "player", name:"playerView",
				onSaveComplete: "saveComplete",
			}
		]},
		{kind: "DbInstaller", onSuccess: "installSuccess", onFailure: "dbFail"},
		{kind: "Scrim", layoutKind: "VFlexLayout", align: "center", pack: "center", components: [
			{kind: "SpinnerLarge"}
		]},
		{
			name: "putDBPermissions", 
			kind: enyo.PalmService,
		    service: "palm://com.palm.db/",
		    method: "putPermissions",
		    onSuccess: "permissionSuccess",
		    onFailure: "permissionFailure",
		}
	],
	permissionSuccess: function(){
		console.log("DB permission granted successfully!");
	},
	permissionFailure: function(){
		console.log("DB failed to grant permissions!");
	},
	create: function(){
		this.inherited(arguments);		
	},
	//This will be called if setLaunchParams is called from index.html.  It's called automatically since launchParams is a published property on our kind.
	launchParamsChanged: function(){
		//if we received a launch parameter then we either make a query based on it or create a new player
		if (this.launchParams){
			if (this.launchParams.playerId){
				var inQuery = {"from":"com.palmdts.justtype:1","where":[{"prop":"_id","op":"=","val":this.launchParams.playerId}]};
				this.$.dbFind.call({query: inQuery}, {onSuccess: "playerQuerySuccess", onFailure: "playerQueryFail"});
			} else if (this.launchParams.newPlayer){
				this.createNewPlayer();
			} else if (this.launchParams.query){
				this.$.list.reset();  //reset the list which will cause listQuery to be called with our query param
			}
		}
	},
	playerQuerySuccess: function(inSender, inResponse, inRequest) {
		//found the desired player so show them in our player view
		this.printProps(inResponse.results[0])
		this.$.playerView.setPlayer(inResponse.results[0]);
		this.$.mainPane.next();
	},
	playerQueryFail: function(inSender, inResponse, inRequest) {
		console.log("dbService failure: " + enyo.json.to(inResponse));
	},
	dbFail: function(inSender, inResponse) {
		console.log("dbService failure: " + enyo.json.to(inResponse));
	},
	listQuery: function(inSender, inQuery) {
		// IMPORTANT: must return a request object so dbList can decorate it		
		if (this.launchParams && this.launchParams.query){
			// We do a query for all player's with our passed in params.  
			// Then we reset the query param so the next list refresh is a full query
			var inQuery = {"from":"com.palmdts.justtype:1","where":[{"prop":"firstname","op":"%","val":this.launchParams.query}],"orderBy":"firstname"};
			this.launchParams.query = null;
			return this.$.dbFind.call({query: inQuery});
		} else {
			inQuery.orderBy = "firstname";
			return this.$.dbFind.call({query: inQuery});
		}
	},
	queryResponse: function(inSender, inResponse, inRequest) {
		this.$.list.queryResponse(inResponse, inRequest);
	},
	dbNonExistent: function(inSender, inResponse, inRequest) {
		this.installDb();
	},
	listSetupRow: function(inSender, inRecord, inIndex) {
		// For records marked for deletion: 
		this.$.item.canGenerate = !inRecord.deleted;
		this.$.item.applyStyle("background-color", inRecord.selected ? "#F0F0FF" : null);

		this.$.itemFirstName.setContent(inRecord.firstname);
		this.$.itemLastName.setContent(inRecord.lastname);
		this.$.itemClub.setContent(inRecord.club);
		this.$.itemPosition.setContent(inRecord.position);
	},
	reset: function() {
		this.$.list.reset();
	},
	selectedRecordChanged: function(inOldRecord) {
		if (inOldRecord) {
			delete inOldRecord.selected;
		}
		if (this.selectedRecord) {
			this.selectedRecord.selected = true;
		}
		this.$.list.refresh();
	},
	itemClick: function(inSender, inEvent) {
		this.setSelectedRecord(this.$.list.fetch(inEvent.rowIndex));
		var record = this.getSelectedRecord(this.$.list.fetch(inEvent.rowIndex));
		this.$.playerView.setPlayer(record);
		this.$.mainPane.next();
	},
	createNewPlayer: function() {
		this.$.playerView.setPlayer(null);	
		
		//if we have a newPlayer launch parameter then we start the new player with the passed in name
		if (this.launchParams && this.launchParams.newPlayer != null){	
			this.$.playerView.setFirstName(this.launchParams.newPlayer);
			this.launchParams.newPlayer = null;  //reset it so that we don't use it again later
		}
		
		this.$.mainPane.next();
	},
	deleteRecord: function(inRecord) {
		if (inRecord) {
			inRecord.deleted = true;
			this.$.dbDel.call({ids: [inRecord._id]});
		}
	},
	deletedResponse: function(inSender,inReponse,inRequest){
		this.$.list.refresh();
	},
	swipeDelete: function(inSender, inIndex) {
		this.deleteRecord(this.$.list.fetch(inIndex));
	},
	//this is fired whenever a new player is created or an existing player is updated
	saveComplete: function(inSender, inEvent){
		this.$.mainPane.back();
		this.reset();
	},
	//
	// these methods are for installing the data into a database on a PalmSystem device
	//
	installDb: function() {
		if (window.PalmSystem) {
			this.$.dbInstaller.install(this.$.dbService.dbKind, "com.palmdts.justtype", this.$.dbService.data);
			this.$.scrim.show();
		} else {
			console.log("Device required for install Db.");
		}
	},
	installSuccess: function(inSender) {
		this.$.scrim.hide();
		this.$.list.punt();
		this.$.list.refresh();
		
		//attempt to give db permissions to the launcher so user's can perform queries on our data with the Just Type feature
		//We do this after the db has been installed since otherwise we'd have nothing to grant permissions for.
		var permObj = [{"type":"db.kind","object":'com.palmdts.justtype:1',"caller":"com.palm.launcher","operations":{"read":"allow"}}];
		this.$.putDBPermissions.call({"permissions":permObj});
	}
});