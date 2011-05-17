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
		onDestroy: ""
	},
	components: [
		{name: "user_view", className: "user-view", width: "322px", height: "100%", layoutKind: "VFlexLayout", components: [
		    {name: "content", layoutKind: "VFlexLayout", flex: 1, components: [
		        //{kind: "Header", width: "322px", components: [
        			{kind: "VFlexBox", className: "header", components: [
        				{kind: "HFlexBox", width: "322px", components: [
        					{kind: "Image", width: "75px",  height: "75px", className: "avatar"},
        					{kind: "VFlexBox", height: "75px", flex: 1, components: [
        						{kind: "Spacer"},
        						{name: "realname", flex: 3, className: "realname truncating-text"},
        						{name: "username", flex: 3, className: "link username"},
        						{kind: "Spacer"}

        					]},	
        					{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 10px; right: 10px; float: right;", onclick: "doDestroy"}	
        				]},
        				{name: "bio", width: "305px", style: "padding-right: 10px", className: "small"},

        			]},
        		//]},
    			{kind: "RadioGroup", onChange: "radioButtonSelected", width: "310px", style: "padding-left: 10px", components: [
    			    {name: "entries", kind: "Spaz.RadioButton", label: "Entries", number: ""},
    			    {name: "followers", kind: "Spaz.RadioButton", label: "Followers", number: ""},
    			    {name: "friends", kind: "Spaz.RadioButton", label: "Following", number: ""}
    			    //{kind: "Spaz.RadioButton", label: "Favorites", number: 12}
    			    //lists
    			]},
    			//{layoutKind: "HFlexLayout", pack: "center", components: [
    		    {kind: "Scroller", flex: 1, className: "entry-view", components: [
    				{kind: "VFlexBox", className: "header", style: "", components: [
				
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
	
	userChanged: function(){
		
		if(this.$.username.getContent() !== "@" + this.user.username){
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
			
		} else {
			this.doDestroy();
			//this.$.image.applyStyle("display", "none");
			//this.$.realname.setContent("");
			//this.$.username.setContent("");
			//this.$.bio.setContent("");
			//this.$.timeFrom.setContent("");
			//this.$.entry.setContent("");
		}
	}
});