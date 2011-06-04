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
						{kind: "HFlexBox", style: "margin-top: 2px; margin-right: 18px;", components: [
							{kind: "Button", style: "padding: 0px 5px; margin-bottom: 0px; margin-left: 0px;", components: [
								{name: "accountSelection", "kind":"ListSelector", onChange: "setRelationshipState", className: "accountSelection"}
							]},
							{kind: "Spacer"},
							{kind: "ActivityButton", name: "following", caption: "Loading", disabled: true, style: "padding-top: 6px; margin-bottom: 0px;", onclick: "toggleFollow"}
						]},
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
				//{kind: "ToolButton", name: "follow", caption: "Following", disabled: true, /*icon: "source/images/icon-start-following.png",*/ onclick: "toggleFollow"},
				{kind: "ToolButton", name: "mention", disabled: false, icon: "source/images/icon-mention.png", onclick: "mention"},
				{kind: "ToolButton", name: "message", disabled: false, icon: "source/images/icon-messages.png", onclick: "message"},
				{kind: "ToolButton", name: "block", disabled: false, icon: "source/images/icon-block.png", onclick: "block"},
				{kind: "Spacer"}
			]},
			
			{name: "entryClickPopup", kind: "Spaz.EntryClickPopup"},
			
			{name: "confirmPopup", kind: "enyo.Popup", scrim : true, components: [
				{content: enyo._$L("Block user?")},
				{style: "height: 10px;"},
				{kind: "enyo.HFlexBox", components: [
					{kind: "enyo.Button", caption: enyo._$L("No"), flex: 1, onclick: "cancelBlock"},
					{kind: "enyo.Button", className: "enyo-button-negative", caption: enyo._$L("Yes"), flex: 1, onclick: "confirmBlock"}
				]}
			]}
		]}
	],
	
	showLoading: function(inShowing) {
	   	this.$.content.setShowing(!inShowing);
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
				this.buildAccountButton();
				this.showLoading(false);
			}),
			enyo.bind(this, function() {
				AppUtils.showBanner("Error loading user info for "+inUsername);
				this.showLoading(false);
				this.doDestroy();
			})
		);
	},
	buildAccountButton: function(){
		
		this.accounts = [];
		var allusers = App.Users.getAll();
		for (var key in allusers) {
			if(allusers[key].type === this.user.service){
				this.accounts.push({
					id:allusers[key].id,
					value: allusers[key].id,
					caption:App.Users.getLabel(allusers[key].id),
					type:allusers[key].type
				});
			}
		}
		this.$.accountSelection.setItems(this.accounts);
		this.$.accountSelection.setValue(this.account_id);
		
		this.setRelationshipState();
	
	},
	setRelationshipState: function() {
		
		var self = this;		
		this.enableFollowButton(false);
		if (App.Users.get(this.$.accountSelection.getValue()).type === SPAZCORE_ACCOUNT_TWITTER) {
			this.getTwitterRelationship();
		} else if (this.user._orig.following !== null) { // the .following attribute exists and this is not twitter
		
			this.enableFollowButton(true);
			if (this.user._orig.following === true) {  // i am following this user
				this.user.are_following = 'yes';
			} else {  // i am NOT following this user
				this.user.are_following = 'no';
			}
			this.setFollowButtonIcon(this.user.are_following);
			
		}
		
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
					var url = this.author_url || '';
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
		
		var self = this;
		this.$.following.setActive(true);
		var twit = AppUtils.makeTwitObj(this.$.accountSelection.getValue());
		
		if (this.user.are_following) {
			if (this.user.are_following === 'yes') {
				twit.removeFriend(
					this.user.service_id,
					function(data){
						console.log('response from remove friend:', data);
						self.user.are_following = 'no';
						self.setFollowButtonIcon(self.user.are_following);
						self.$.following.setActive(false);

						AppUtils.showBanner(enyo.macroize($L('Stopped following {$screen_name}'), {'screen_name':self.user.username}));
					},
					function(xhr, msg, exc){
						self.$.following.setActive(false);
						AppUtils.showBanner(enyo.macroize($L('Failed to stop following {$screen_name}'), {'screen_name':self.user.username}));
					}	
				);
			} else {
				twit.addFriend(
					this.user.service_id,
					function(data){
						console.log('response from add friend:', data);
						self.user.are_following = 'yes';
						self.setFollowButtonIcon(self.user.are_following);
						self.$.following.setActive(false);
						AppUtils.showBanner(enyo.macroize($L('Started following {$screen_name}'), {'screen_name':self.user.username}));
					},
					function(xhr, msg, exc){
						self.$.following.setActive(false);
						AppUtils.showBanner(enyo.macroize($L('Failed to start following {$screen_name}'), {'screen_name':self.user.username}));
					}		
				);
			}
		}
		
	},
	mention: function(inSender, inEvent) {
		AppUI.compose('@'+this.user.username+' ');
	},
	message: function(inSender, inEvent) {
		AppUI.directMessage(this.user.username, this.account_id);
	},
	
	block: function(inSender, inEvent) {
		this.$.confirmPopup.openAtCenter();
	},
	
	confirmBlock: function(inSender) {
		this.$.confirmPopup.close();
		
		var twit = AppUtils.makeTwitObj(this.account_id);
		twit.block(
			this.user.service_id,
			function(data){
				AppUtils.showBanner($L('Blocked user'));
			},
			function(xhr, msg, exc){
				AppUtils.showBanner($L('Failed to block user'));
			}
		);
	},
	
	cancelBlock: function(inEvent) {
		this.$.confirmPopup.close();
	},
	
	getTwitterRelationship: function() {
		var self = this;
		
		var twit = AppUtils.makeTwitObj(this.$.accountSelection.getValue());
		twit.showFriendship(
			this.user.service_id,
			null,
			function(data) {
				console.log('show friendship result: %j', data);
				if (data.relationship.target.followed_by) {
					console.log('You are following this user!');
					self.user.are_following = 'yes';
				} else {
					console.log('You are NOT following this user!');
					self.user.are_following = 'no';
				}
				self.enableFollowButton(true);
				self.setFollowButtonIcon(self.user.are_following);
			},
			function(xhr, msg, exc) {
				AppUtils.showBanner($L('Could not retrieve relationship info'));
			}
		);
	},
	
	enableFollowButton: function(enabled) {
		this.$.following.setDisabled(!enabled);
	},
	
	setFollowButtonIcon: function(current_state) {
		this.$.following.setDisabled(false);
		if (current_state === 'yes') {
			this.$.following.setCaption("Unfollow");
			this.$.following.removeClass("enyo-button-affirmative");
			this.$.following.addClass("enyo-button-negative");
			//this.$.follow.setIcon('source/images/icon-stop-following.png');
		} else {
			if(App.Users.get(this.$.accountSelection.getValue()).username === this.user.username){ //if it IS this user
				this.$.following.setCaption("That's you!");
				this.$.following.removeClass("enyo-button-affirmative");
				this.$.following.removeClass("enyo-button-negative");
				this.enableFollowButton(false);
			} else {
				this.$.following.setCaption("Follow");
				this.$.following.removeClass("enyo-button-negative");
				this.$.following.addClass("enyo-button-affirmative");
			}
			//this.$.follow.setIcon('source/images/icon-start-following.png');
		}
	}
	
	
});
