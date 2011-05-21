enyo.kind({
	name: "Spaz.EntryView",
	kind: "VFlexBox",
	width: "322px",
	published: {
		entry: {}
	},
	events: {
		onDestroy: "",
	},
	components: [
		{className: "entry-view", width: "322px", height: "100%", layoutKind: "VFlexLayout", components: [
			{kind: "Header", width: "322px", components: [
				{kind: "VFlexBox", className: "header", components: [
					{kind: "HFlexBox", width: "322px", components: [
						{kind: "Image", width: "75px",  height: "75px", className: "avatar"},
						{kind: "VFlexBox", height: "75px", flex: 1, components: [
							{kind: "Spacer"},
							{name: "realname", flex: 3, className: "author-realname truncating-text"},
							{name: "username", onclick: "entryClick", flex: 3, className: "link author-username"},
							{kind: "Spacer"}

						]},	
						{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 10px; right: 10px; float: right;", onclick: "doDestroy"}	
					]},
					{name: "bio", width: "305px", style: "padding-right: 10px", className: "small"},

				]},
			]},
			//{layoutKind: "HFlexLayout", pack: "center", components: [
		    {kind: "Scroller", name: "detail_scroller", flex: 1, className: "entry-view", components: [
				{kind: "VFlexBox", className: "header", style: "", components: [
						//{kind: "Divider", className: "divider", style: "display: none", caption: ""},
						{name: "entry", onclick: "entryClick", className: "message"},
						{name: "small", kind: "HFlexBox", className: "small", style: "padding: 5px 0px",
							components: [
								{name: "time"},
								{content: "from", style: "padding: 0px 3px;"},
								{name: "from"}
							]
						},
						{name: "repost", className: "repost-outer", onclick: "entryClick", showing: false},
						{kind: "ActivityButton", name: "conversation_button", onclick: "toggleDrawer", toggling: true, content: "View Conversation"},
						{kind: "Drawer", name: "conversation_drawer", /*caption: "Conversation",*/ open: false, onOpenChanged: "onConversationOpenChanged", components: [
						    {kind: "Spaz.Conversation", name: "conversation", onStart: "onConversationLoadStart", onDone: "onConversationLoadDone"}
						]}
				]},
				//]},
				
	        ]},
	        {kind: "Toolbar", components: [
				{kind: "Spacer"},
				{kind: "ToolButton", icon: "source/images/icon-reply.png", onclick: "reply"},
				{kind: "ToolButton", disabled: true, icon: "source/images/icon-share.png"},
				{kind: "ToolButton", disabled: true, icon: "source/images/icon-favorite.png"},
				{kind: "Spacer"}
			]}
		]}
	],
	entryChanged: function(){
		if(this.$.entry.content !== this.entry.message){
		    this.$.detail_scroller.setScrollPositionDirect(0,0);
		    
			this.$.image.setSrc(this.entry.author_avatar_bigger);
			this.$.image.applyStyle("display", "");			
			this.$.realname.setContent(this.entry.author_fullname||this.entry.author_username);
			this.$.username.setContent("@" + this.entry.author_username);
			this.$.bio.setContent(this.entry.author_description||'');
			this.$.time.setContent(sch.getRelativeTime(this.entry.publish_date));
			if (this.entry._orig.source) {
				this.$.from.setContent(this.entry._orig.source);
			} 
			this.$.entry.setContent(AppUtils.makeItemsClickable(this.entry.text));
			
			if(!this.entry.in_reply_to_id) {
			    this.$.conversation_button.hide();
			    this.$.conversation.clearConversationMessages();
			} else {
			    this.$.conversation_button.show();
			    this.$.conversation_button.setDepressed(false);
			    this.$.conversation_drawer.close();
    			this.$.conversation.setEntry(this.entry);
			}

			if(this.entry.is_repost === true){
				this.$.repost.setContent("<span class='repost'>Reposted by <span class='username'>" + this.entry.reposter_username + "</span> " + sch.getRelativeTime(this.entry.publish_date) + "</span>");//@TODO
				this.$.repost.setShowing(true);

				this.$.time.setContent(sch.getRelativeTime(this.entry.repost_orig_date));
			}
		} else {
			this.doDestroy();
		}
	},
	entryClick: function(inSender, inEvent) {
		var className = inEvent.target.className;
		if(_.includes(className, "username")){
			var username = inEvent.target.getAttribute('data-user-screen_name') || inEvent.target.innerText.replace("@", "");
			AppUI.viewUser(username, this.entry.service, this.entry.account_id);
		} else if(_.includes(className, "avatar")){
			AppUI.viewUser(this.entry.author_username, this.entry.service, this.entry.account_id);
		} else if(_.includes(className, "hashtag")){
			AppUI.search(inEvent.target.innerText, this.entry.account_id);
		}
	},
	toggleDrawer: function(inSender, inEvent){
		this.$.conversation_drawer.toggleOpen();	
	},
	onConversationOpenChanged: function(inSender, inEvent) {
	    if(this.$.conversation_drawer.open){
	        this.loadConversation();	
	        console.log("opening drawer");    	
	    }
	},
	loadConversation: function() {
	    this.$.conversation.loadConversation();
	},
	onConversationLoadStart: function () {
	    console.log("Load Conversation Start");
	    this.$.conversation_button.setActive(true);
	},
	onConversationLoadDone: function() {
	    console.log("Load Conversation Done");
	    this.$.conversation_button.setActive(false);
	},
	reply: function() {
		AppUI.reply(this.entry);
	}
});
