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
        						{kind: "Spacer"},
        						{name: "realname", className: "author-realname truncating-text"},
        						{name: "username", className: "author-username"},
        						{name: "url", allowHtml: true, className: "small"},
        						{kind: "Spacer"}
        					]},	
        					{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 10px; right: 10px; float: right;", onclick: "doDestroy"}	
        				]},
        				{name: "bio", allowHtml: true, width: "305px", style: "padding-right: 10px", onclick: "bioClick", className: "small"},

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
    		    	{layoutKind: "VFlexLayout", align: "center", pack: "center", flex: 1, components: [
		    			{name: "listSpinner", kind: "SpinnerLarge"}
		    		]},
    				{name: "list", kind: "VirtualRepeater", onSetupRow: "loadItem", style: "", components: [
						{
							name: "entryItem", 
							kind: "Spaz.Entry",
							onEntryClick: "entryClick"
						},
						{
							name: "userItem", kind: "enyo.Item", tapHighlight: true, onclick: "userItemClick", components: [
								{kind: "enyo.HFlexBox", components: [
									{name: "userAvatar", kind: "enyo.Image", width: "48px", height: "48px", className: "small-avatar"},
									{width: "10px"},
									{kind: "enyo.VFlexBox", height: "48px", flex: 1, components: [
										{kind: "Spacer"},
										{name: "userRealname", style: "font-weight: bold; font-size: 16px;", className: "truncating-text"},
										{name: "userUsername", style: "font-weight: normal; font-size: 14px;"},
										{kind: "Spacer"}
									]}
								]}
							]
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
				
				
				// follow only enabled when we check if following. may adjust icon
				{kind: "ToolButton", name: "follow", disabled: true, icon: "source/images/icon-start-following.png", onclick: "toggleFollow"},
				{kind: "ToolButton", name: "mention", disabled: false, icon: "source/images/icon-mention.png", onclick: "mention"},
				{kind: "ToolButton", name: "message", disabled: false, icon: "source/images/icon-messages.png", onclick: "message"},
				{kind: "ToolButton", name: "block", disabled: false, icon: "source/images/icon-block.png", onclick: "block"},
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

	showSpinner: function(inShowing) {
		this.$.listSpinner.setShowing(inShowing);		
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
				this.showLoading(false);
				this.doDestroy();
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
					case "message":
			    		this.$.viewManagementText.setContent("Back to @" + lastEvent.entry.author_username + "'s Private Message");					
						break;
		    	}
		    } else {
		    	this.$.viewManagement.setShowing(false);		    	
		    }

			this.$.image.setSrc(this.user.avatar_bigger);
			this.$.image.applyStyle("display", null);			
			this.$.realname.setContent(this.user.fullname||this.user.username);
			this.$.username.setContent("@" + this.user.username);
			this.$.bio.setContent(AppUtils.makeItemsClickable(this.user.description) || '');
			
			switch(this.user.service){
				case SPAZCORE_SERVICE_IDENTICA:
				case SPAZCORE_SERVICE_CUSTOM: 
				case SPAZCORE_SERVICE_TWITTER:
					this.$.followers.setNumber(this.user._orig.followers_count);
					this.$.friends.setNumber(this.user._orig.friends_count);
					this.$.entries.setNumber(this.user._orig.statuses_count);
					var url = this.user._orig.url || '';
					this.$.url.setContent(sch.autolink(enyo.string.runTextIndexer(url)), url.length);
					this.$.radioGroup.setValue(0);
					this.switchDataType(this.$.radioGroup);
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
		this.showSpinner(true);
		this.items = [];
		this.dataType = this.$.radioGroup.components[inSender.getValue()].name;
		switch(this.dataType){
			case "entries":
				AppUtils.makeTwitObj(this.account_id).getUserTimeline(this.user.service_id, null, null,
					enyo.bind(this, function(data) {
						this.showSpinner(false);
						this.items = AppUtils.convertToEntries(data.reverse());
						this.$.list.render();
						this.$.scroller.setScrollTop(0);
					}),
					enyo.bind(this, function() {
						this.showSpinner(false);
						AppUtils.showBanner("Error loading entries for " + this.$.username.getContent());
					}));
				break;
			case "followers":
				AppUtils.makeTwitObj(this.account_id).getFollowersList(this.user.service_id, null,
					enyo.bind(this, function(data) {
						this.showSpinner(false);
						this.items = data;
						this.$.list.render();
						this.$.scroller.setScrollTop(0);
					}),
					enyo.bind(this, function() {
						this.showSpinner(false);
						AppUtils.showBanner("Error loading followers for " + this.$.username.getContent());
					}));
				break;
			case "friends":
				AppUtils.makeTwitObj(this.account_id).getFriendsList(this.user.service_id, null,
					enyo.bind(this, function(data) {
						this.showSpinner(false);
						this.items = data;
						this.$.list.render();
						this.$.scroller.setScrollTop(0);
					}),
					enyo.bind(this, function() {
						this.showSpinner(false);
						AppUtils.showBanner("Error loading friends for " + this.$.username.getContent());
					}));
				break;
		}
		this.$.scroller.start();
		this.$.list.render();

	},
	loadItem: function(inSender, inIndex){
		if (this.items[inIndex]) {
			switch(this.dataType){
				case "entries":
					this.$.entryItem.setShowing(true);
					this.$.userItem.setShowing(false);
					this.$.entryItem.setEntry(this.items[inIndex]);
					break;
				case "followers":
				case "friends":
					this.$.entryItem.setShowing(false);
					this.$.userItem.setShowing(true);
					this.$.userAvatar.setSrc(this.items[inIndex].profile_image_url);
					this.$.userRealname.setContent(this.items[inIndex].name);
					this.$.userUsername.setContent("@" + this.items[inIndex].screen_name);
					break;
			}
			return true;
		}
	},
	bioClick: function(inSender, inEvent){
		var className = inEvent.target.className;
		if(_.includes(className, "username")){
			var username = inEvent.target.getAttribute('data-user-screen_name') || inEvent.target.innerText.replace("@", "");
			AppUI.viewUser(username, this.user.service, this.user.account_id);
		} else if(_.includes(className, "hashtag")){
			AppUI.search(inEvent.target.innerText, this.user.account_id);
		}
	},
	entryClick: function(inSender, inEvent){
		this.$.entryClickPopup.showAtEvent(inSender.entry, inEvent);
	},
	
	userItemClick: function(inSender, inEvent) {
		AppUI.viewUser(this.items[inEvent.rowIndex].screen_name, this.items[inEvent.rowIndex].SC_service, this.account_id);
	},
	
	
	toggleFollow: function(inSender, inEvent) {
		AppUtils.showBanner($L("Not Yet Implemented"));
	},
	mention: function(inSender, inEvent) {
		AppUI.compose('@'+this.user.username+' ');
	},
	message: function(inSender, inEvent) {
		AppUI.directMessage(this.user.username, this.account_id);
	},
	
	
	block: function(inSender, inEvent) {
		AppUtils.showBanner($L("Not Yet Implemented"));
	}
});
