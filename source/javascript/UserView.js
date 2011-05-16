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
		username: ''
	},
	events: {
		onDestroy: ""
	},
	components: [
		{className: "user-view", width: "322px", height: "100%", layoutKind: "VFlexLayout", components: [
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
			    {kind: "Spaz.RadioButton", label: "Entries", number: 1444},
			    {kind: "Spaz.RadioButton", label: "Followers", number: 233},
			    {kind: "Spaz.RadioButton", label: "Following", number: 118}
			    //{kind: "Spaz.RadioButton", label: "Favorites", number: 12}
			    //lists
			]},
			//{layoutKind: "HFlexLayout", pack: "center", components: [
		    {kind: "Scroller", flex: 1, className: "entry-view", components: [
				{kind: "VFlexBox", className: "header", style: "", components: [
				
				]},
				
	        ]},
	        {kind: "Toolbar", components: [
				//{kind: "GrabButton"},
				{kind: "Spacer"},
				{kind: "ToolButton", disabled: false, content: "Follow"},
				{kind: "Spacer"}
			]}
		]}
	],
	
	showUser: function(inUsername, inService, inAccountId) {
		var self = this;
		window.AppCache.getUser(inUsername, inService, inAccountId,
			function(user) {
				self.user = user;
				self.userChanged();
			},
			function() {
				AppUtils.showBanner("Error loading user info for "+inUsername);
				self.doDestroy();
			}
		);
	},
	
	userChanged: function(){
		
		if(this.$.username.getContent() !== "@" + this.user.username){
			this.$.image.setSrc(this.user.avatar);
			this.$.image.applyStyle("display", null);			
			this.$.realname.setContent(this.user.fullname||this.user.username);
			this.$.username.setContent("@" + this.user.username);
			this.$.bio.setContent(this.user.description||'');
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