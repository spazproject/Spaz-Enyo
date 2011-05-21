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
							{width: "10px"},
        					{kind: "VFlexBox", height: "75px", flex: 1, components: [
        						{name: "realname", className: "author-realname truncating-text"},
        						{name: "username", className: "author-username"},
        						{name: "url", style: "padding-left: 10px;", className: "small"}
        					]},	
        					{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 10px; right: 10px; float: right;", onclick: "doDestroy"}	
        				]},
        				{name: "bio", width: "305px", style: "padding-right: 10px", className: "small"},

        			]},
        		]},
    			{name: "radioGroup", kind: "RadioGroup", onChange: "switchDataType", width: "310px", style: "padding-left: 10px; padding-top: 7px;", components: [
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
							onEntryClick: "entryClick"
						}
					]}
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
			]},
			
			{name: "entryClickPopup", kind: "Spaz.EntryClickPopup"}
		]}
	],
	
	showLoading: function(inShowing) {
	    this.$.content.setShowing(!inShowing);
	    this.$.follow.setShowing(!inShowing);
		this.$.loading.setShowing(inShowing);
		this.$.spinnerLarge.setShowing(inShowing);
	},
	
	showUser: function(inUsername, inService, inAccountId) {
		this.showLoading(true);
		this.account_id = inAccountId;
		window.AppCache.getUser(inUsername, inService, inAccountId,
			enyo.bind(this, function(user) {
				this.setUser(user);
				this.showLoading(false);
			}),
			enyo.bind(this, function() {
				AppUtils.showBanner("Error loading user info for "+inUsername);
				self.showLoading(false);
				self.doDestroy();
			})
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
					this.$.radioGroup.setValue(0);
					this.switchDataType(this.$.radioGroup);
					var url = this.user._orig.url || '';
					this.$.url.setContent(sch.autolink(enyo.string.runTextIndexer(url)), url.length);
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
				AppUtils.makeTwitObj(this.account_id).getUserTimeline(this.user.service_id, null, null,
					enyo.bind(this, function(data) {
						this.items = AppUtils.convertToEntries(data.reverse());
						this.$.list.render();
					}),
					enyo.bind(this, function() {
						AppUtils.showBanner("Error loading entries for " + this.$.username.getContent());
					}));
				break;
			case "followers":
				break;
			case "friends":
				break;
		}
		this.$.scroller.start();
		this.$.list.render();

	},
	loadItem: function(inSender, inIndex){
		if (this.items[inIndex]) {
			switch(this.dataType){
				case "entries":
					this.$.item.setEntry(this.items[inIndex]);
					break;
			}
			return true;
		}
	},
	
	entryClick: function(inSender, inEvent){
		this.$.entryClickPopup.showAtEvent(inSender.entry, inEvent);
	},
});
