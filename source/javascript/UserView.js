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
		user: {}
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
			{kind: "RadioGroup", onChange: "radioButtonSelected", width: "320px", components: [
			    {label: "Tweets", style: "font-size: 12px"},
			    {label: "Followers", style: "font-size: 12px"},
			    {label: "Following", style: "font-size: 12px"},
			    {label: "Favorites", style: "font-size: 12px"}
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
	userChanged: function(){
		if(this.$.username.getContent() !== "@" + this.user.author_username){
			this.$.image.setSrc(this.user.author_avatar);
			this.$.image.applyStyle("display", null);			
			this.$.realname.setContent(this.user.author_fullname||this.user.author_username);
			this.$.username.setContent("@" + this.user.author_username);
			this.$.bio.setContent(this.user.author_description||'');
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