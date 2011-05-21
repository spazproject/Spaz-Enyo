enyo.kind({
	name: "Spaz.UserView",
	kind: "VFlexBox",
	//kind: "Toaster", 
	//flyInFrom: "right",
	width: "322px",
	//height: "100%",
	//style: "background-color: #D8D8D8;",
	//flex: 1,
	published: {
		user: ''
	},
	events: {
		onAddViewEvent: "",
		onGoPreviousViewEvent: "",
		onDestroy: ""
	},
	components: [
		{name: "user_view", className: "user-view", width: "322px", height: "100%", layoutKind: "VFlexLayout", components: [
			{name: "viewManagement", kind: "Toolbar", defaultKind: "Control", onclick: "doGoPreviousViewEvent", className: "viewManagement truncating-text", showing: false, content: "", components: [
				{name: "leftArrowIcon", kind: "Image", src: "source/images/icon-back.png", style: "position: relative; bottom: 1px;"},
				{name: "viewManagementText", content: "", className: "underlineOnClick", style: "color: #ccc; font-size: 14px;"},
				{kind: "Spacer"}

			]},		   
			{name: "content", layoutKind: "VFlexLayout", flex: 1, components: [
		        {kind: "Header", width: "322px", components: [
        			{kind: "VFlexBox", className: "header", components: [
        				{kind: "HFlexBox", width: "322px", components: [
        					{kind: "Image", width: "75px",  height: "75px", className: "avatar"},
        					{kind: "VFlexBox", height: "75px", flex: 1, components: [
        						{kind: "Spacer"},
        						{name: "realname", flex: 3, className: "author-realname truncating-text"},
        						{name: "username", flex: 3, className: "author-username"},
        						{kind: "Spacer"}

        					]},	
        					{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 10px; right: 10px; float: right;", onclick: "doDestroy"}	
        				]},
        				{name: "bio", width: "305px", style: "padding-right: 10px", className: "small"},

        			]},
        		]},
    			{kind: "RadioGroup", onChange: "switchDataType", width: "310px", style: "padding-left: 10px; padding-top: 7px;", components: [
    			    {name: "entries", kind: "Spaz.RadioButton", label: "Entries", number: ""},
    			    {name: "followers", kind: "Spaz.RadioButton", label: "Followers", number: ""},
    			    {name: "friends", kind: "Spaz.RadioButton", label: "Following", number: ""}
    			    //{kind: "Spaz.RadioButton", label: "Favorites", number: 12}
    			    //lists
    			]},
    			//{layoutKind: "HFlexLayout", pack: "center", components: [
    		    {kind: "Scroller", flex: 1, className: "entry-view", components: [
    				{name: "list", kind: "VirtualRepeater", onGetItem: "loadItem", style: "", components: [
						{
							name: "item", 
							kind: "Spaz.Entry",
							//onEntryClick: "entryClick"
						}
    				]},
				
    	        ]}
		    ]},
		    
        	{name: "loading", layoutKind: "VFlexLayout", align: "center", pack: "center", flex: 1, components: [
    			{kind: "SpinnerLarge"}
    		]},
    		
	        {kind: "Toolbar", components: [
				//{kind: "GrabButton"},
				{kind: "Spacer"},
				{kind: "ToolButton", name: "follow", disabled: false, content: "Follow"},
				{kind: "Spacer"}
			]}
		]}
	],
	
	
	showLoading: function(inShowing) {
	    this.$.content.setShowing(!inShowing);
	    this.$.follow.setShowing(!inShowing);
		this.$.loading.setShowing(inShowing);
		this.$.spinnerLarge.setShowing(inShowing);
	},
	
	showUser: function(inUsername, inService, inAccountId) {
		var self = this;
		
		self.showLoading(true);
		
		window.AppCache.getUser(inUsername, inService, inAccountId,
			function(user) {
				self.setUser(user);
        		self.showLoading(false);
			},
			function() {
				AppUtils.showBanner("Error loading user info for "+inUsername);
        		self.showLoading(false);
				self.doDestroy();
			}
		);
	},
	
	userChanged: function(inOldValue){
		
		if(this.$.username.getContent() !== "@" + this.user.username){
							
			var events = this.doAddViewEvent({type: "user", user: this.user});
		   	if(events.length > 1){
		    	this.$.viewManagement.setShowing(true);
		    	var lastEvent = events[events.length-2];
		    	switch (lastEvent.type){
		    		case "user":
			    		this.$.viewManagementText.setContent("Back to @" + lastEvent.user.username);
		    			break;
		    		case "entry":
			    		this.$.viewManagementText.setContent("Back to @" + lastEvent.entry.author_username + "'s Entry");
		    			break;
		    	
		    	}
		    } else {
		    	this.$.viewManagement.setShowing(false);		    	
		    }

			this.$.image.setSrc(this.user.avatar_bigger);
			this.$.image.applyStyle("display", null);			
			this.$.realname.setContent(this.user.fullname||this.user.username);
			this.$.username.setContent("@" + this.user.username);
			this.$.bio.setContent(this.user.description||'');
			
			switch(this.user.service){
				case SPAZCORE_SERVICE_IDENTICA:
				case SPAZCORE_SERVICE_CUSTOM: 
				case SPAZCORE_SERVICE_TWITTER:
					this.$.followers.setNumber(this.user._orig.followers_count);
					this.$.friends.setNumber(this.user._orig.friends_count);
					this.$.entries.setNumber(this.user._orig.statuses_count);	
					break;
			}
			
		}// else {
		//	this.doDestroy();
			//this.$.image.applyStyle("display", "none");
			//this.$.realname.setContent("");
			//this.$.username.setContent("");
			//this.$.bio.setContent("");
			//this.$.timeFrom.setContent("");
			//this.$.entry.setContent("");
		//}
	},
	items: [],
	switchDataType: function(inSender){
		this.dataType = this.$.radioGroup.components[inSender.getValue()].name;
		switch(this.dataType){
			case "entries":
				//get Items
				//@TODO create/delete item component based on choice.
				break;
			case "followers":

				break;
			case "friends":

				break;

		}
		this.$.list.render();

	},
	loadItem: function(inSender, inIndex){
		if (this.items[inIndex]) {
			var item = this.items[inIndex];
			switch(this.dataType){
				case "entries":
					this.$.item.setEntry(entry);
					break;
			}
			return true;
		}
	}
});