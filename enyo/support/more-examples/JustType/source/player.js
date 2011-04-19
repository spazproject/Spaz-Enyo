/* Copyright 2009-2011 Hewlett-Packard Development Company, L.P. All rights reserved. */
enyo.kind({
	kind: "VFlexBox",
	name:"player",
	published: {
		player: null,  //player info
		firstName: null //player's first name - used with Just Type parameters
	},
	events: {
		onSaveComplete: "",
	},	
	components: [
		{kind: "DbService", dbKind: "com.palmdts.justtype:1", onFailure: "dbFail", components: [
			{name: "dbPut", method: "put"},
			{name: "dbMerge", method: "merge"}
		]},
		{kind: "PageHeader", content: "Player"},
		{kind: "Scroller", flex: 1, components: [
			{kind: "RowGroup", caption: "Rows in Group", components: [
				{name: "firstname", kind: "Input", components: [
					{content: "first name", style: "text-transform: uppercase; color: rgb(31, 117, 191)"}
				]},
				{name: "lastname", kind: "Input", components: [
					{content: "last name", style: "text-transform: uppercase; color: rgb(31, 117, 191)"}
				]},
				{	name: "position", 
					kind: "ListSelector",
					label: "Position",
					items: [
						{caption: "GoalKeeper", value: 'Goalkeeper'},
						{caption: "Defender", value: 'Defender'},
						{caption: "Midfielder", value: 'Midfielder'},
						{caption: "Forward", value: 'Forward'}
					]
				},
				{
					name: "height", 
					kind: "ListSelector",
					label: "Height",
					value: true,
					items: [
						{caption: "5-5", value: '5-5'},
						{caption: "5-6", value: '5-6'},
						{caption: "5-7", value: '5-7'},
						{caption: "5-8", value: '5-8'},
						{caption: "5-9", value: '5-9'},
						{caption: "5-10", value: '5-10'},
						{caption: "5-11", value: '5-11'},
						{caption: "6-0", value: '6-0'},
						{caption: "6-1", value: '6-1'},
						{caption: "6-2", value: '6-2'},
						{caption: "6-3", value: '6-3'},
						{caption: "6-4", value: '6-4'},
						{caption: "6-5", value: '6-5'}
					]
				},
				{name: "weight", kind: "IntegerPicker", label: "Weight", min: 140, max: 260},					
				{name: "hometown", kind: "Input", components: [
					{content: "home town", style: "text-transform: uppercase; color: rgb(31, 117, 191)"}
				]},
				{name: "club", kind: "Input", components: [
					{content: "club", style: "text-transform: uppercase; color: rgb(31, 117, 191)"}
				]}
			]}
		]},
		{kind: "Toolbar", pack: "justify", components: [
			{icon: "images/menu-icon-save.png", onclick: "savePlayer"}
		]}
	],
	create: function() {	
		this.inherited(arguments);
	},
 	playerChanged: function() {
		if (this.player) {
   			this.$.firstname.setValue(this.player.firstname);
			this.$.lastname.setValue(this.player.lastname);
			this.$.position.setValue(this.player.position);
			this.$.height.setValue(this.player.height);
			this.$.weight.setValue(this.player.weight);
			this.$.hometown.setValue(this.player.hometown);
			this.$.club.setValue(this.player.club);
		} else {
   			this.$.firstname.setValue('');
			this.$.lastname.setValue('');
			this.$.position.setValue('');
			this.$.height.setValue('');
			this.$.weight.setValue('');
			this.$.hometown.setValue('');
			this.$.club.setValue('');			
		}
	},
	firstNameChanged: function() {
		 this.$.firstname.setValue(this.firstName);
	},
	savePlayer: function() {
		//if it's an existing player being updated then just update the existing record
		if (this.player) {
			this.updatePlayer();
		} else {
			//if it's a new player then we create a new entry in the DB
			var player = {
				_kind: "com.palmdts.justtype:1",
				firstname: this.$.firstname.getValue(),
				lastname: this.$.lastname.getValue(),
				position: this.$.position.getValue(),
				height: this.$.height.getValue(),
				weight: this.$.weight.getValue(),
				hometown: this.$.hometown.getValue(),
				club: this.$.club.getValue()
			};	

			this.$.dbPut.call({objects: [player]});
		}
		this.doSaveComplete();
	},
	updatePlayer: function() {
		this.$.dbMerge.call({objects: [{
			_id: this.player._id,
			firstname: this.$.firstname.getValue(),
			lastname: this.$.lastname.getValue(),
			position: this.$.position.getValue(),
			height: this.$.height.getValue(),
			weight: this.$.weight.getValue(),
			hometown: this.$.hometown.getValue(),
			club: this.$.club.getValue()
		}]});
	},
	dbFail: function(inSender, inResponse) {
		console.log("dbService failure: " + enyo.json.to(inResponse));
	},
})