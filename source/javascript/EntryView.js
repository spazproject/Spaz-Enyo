enyo.kind({
	name: "Spaz.EntryView",
	kind: "VFlexBox",
	//kind: "Toaster", 
	//flyInFrom: "right",
	width: "300px",
	//height: "100%",
	//style: "background-color: #D8D8D8;",
	//flex: 1,
	published: {
		entry: {}
	},
	events: {
		onDestroy: ""
	},
	components: [
		{className: "entry-view", width: "300px", height: "100%", layoutKind: "VFlexLayout", components: [
			{kind: "Header", components: [
				{kind: "VFlexBox", className: "header", components: [
					{kind: "HFlexBox", components: [
						{kind: "Image", width: "75px",  height: "75px", className: "avatar"},
						{kind: "VFlexBox", flex: 1, components: [
							{name: "realname", className: "realname"},
							{name: "username", className: "link username"},

						]},	
						{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doDestroy"}	
					]},
					{name: "bio", className: "small"},

				]},
			]},
			//{layoutKind: "HFlexLayout", pack: "center", components: [
		    {kind: "Scroller", flex: 1, className: "entry-view", components: [
				{kind: "VFlexBox", className: "header", style: "", components: [
						//{kind: "Divider", className: "divider", style: "display: none", caption: ""},
						{name: "entry", className: "entry"},
						{name: "timeFrom", className: "small", style: "padding-top: 10px"}
				]},
				//]},
				
	        ]},
	        {kind: "Toolbar", components: [
				//{kind: "GrabButton"},
				{kind: "Spacer"},
				{kind: "ToolButton", disabled: true, icon: "source/images/icon-reply.png"},
				{kind: "ToolButton", disabled: true, icon: "source/images/icon-share.png"},
				{kind: "ToolButton", disabled: true, icon: "source/images/icon-favorite.png"},
				{kind: "Spacer"}
			]}
		]}
	],
	entryChanged: function(){
		if(this.$.entry.content !== this.entry.message){
			this.$.image.setSrc(this.entry.user.profile_image_url);
			this.$.image.applyStyle("display", "");
			this.$.realname.setContent(this.entry.user.name);
			this.$.username.setContent("@" + this.entry.user.screen_name);
			this.$.bio.setContent(this.entry.user.description);
			this.$.timeFrom.setContent(sch.getRelativeTime(this.entry.created_at) + " from <span class='link'>" + this.entry.source + "</span>");
			this.$.entry.setContent(this.entry.text);
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