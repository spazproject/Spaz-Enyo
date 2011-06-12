enyo.kind({
	name: "Spaz.EntryView",
	kind: "VFlexBox",
	style: "background-color: #D8D8D8",
	width: "322px",
	published: {
		entry: {}
	},
	events: {
		onAddViewEvent: "",
		onGoPreviousViewEvent: "",
		onDestroy: "",
		onShowImageView: ""
	},
	components: [
		{className: "entry-view", width: "322px", height: "100%", layoutKind: "VFlexLayout", components: [
			{name: "viewManagement", kind: "Toolbar", defaultKind: "Control", onclick: "doGoPreviousViewEvent", className: "viewManagement truncating-text", showing: false, content: "", components: [
				{name: "leftArrowIcon", kind: "Image", src: "source/images/icon-back.png", style: "position: relative; bottom: 2px;"},
				{name: "viewManagementText", content: "", className: "underlineOnClick", style: "color: #ccc; font-size: 14px;"},
				{kind: "Spacer"}

			]},
			{kind: "Header", width: "322px", components: [
				{kind: "VFlexBox", className: "header", components: [
					{kind: "HFlexBox", width: "322px", components: [
						{kind: "Image", width: "75px",  height: "75px", className: "avatar"},
						{width: "10px"},
						{kind: "VFlexBox", height: "75px", flex: 1, components: [
							{kind: "Spacer"},
    						{name: "realname", className: "author-realname truncating-text"},
    						{name: "username", className: "link author-username", onclick: "entryClick"},
    						{name: "url", allowHtml: true, className: "small"},
    						{kind: "Spacer"}
						]},	
						{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 10px; right: 10px; float: right;", onclick: "doDestroy"}	
					]},
					{name: "bio", width: "305px", allowHtml: true, style: "padding-right: 10px", onclick: "entryClick", className: "small"},

				]},
			]},
			//{layoutKind: "HFlexLayout", pack: "center", components: [
		    {kind: "Scroller", name: "detail_scroller", flex: 1, className: "entry-view", components: [
				{kind: "VFlexBox", className: "header", style: "", components: [
						//{kind: "Divider", className: "divider", style: "display: none", caption: ""},
						{name: "entry", allowHtml: true, onclick: "entryClick", className: "message"},
						{name: "small", kind: "HFlexBox", className: "small", style: "padding: 5px 0px",
							components: [
								{name: "time"},
								{content: "from", style: "padding: 0px 3px;"},
								{name: "from",  allowHtml: true}
							]
						},
						{name: "images", kind: "enyo.VFlexBox", align: "center"},
						{name: "repost", allowHtml: true, className: "repost-outer", onclick: "entryClick", showing: false},
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
				{kind: "ToolButton", icon: "source/images/icon-share.png", onclick: "share"},
				{name: "favoriteButton", onclick: "toggleFavorite", kind: "ToolButton", disabled: true, icon: "source/images/icon-favorite.png"},
				{name: "deleteButton", kind: "ToolButton", icon: "source/images/icon-delete.png", onclick: "deleteEntry"},
				{kind: "Spacer"}
			]},
			{name: "browser", kind: "enyo.PalmService", service: "palm://com.palm.applicationManager/", method: "open"},
			{name: "sharePopup", kind: "enyo.PopupSelect", onSelect: "sharePopupSelected", items: [
				{caption: enyo._$L("Repost")},
				{caption: enyo._$L("Edit & Repost")},
				{caption: enyo._$L("Email")},
				{caption: enyo._$L("SMS/IM")},
				{caption: enyo._$L("Copy To Clipboard")}
			]}
		]}
	],
	entryChanged: function(){
		
		var self = this;
		
		if(this.$.entry.content !== this.entry.message){

			var events = this.doAddViewEvent({type: (this.entry.is_private_message === true) ? "message" : "entry", entry: this.entry});
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

		    this.$.detail_scroller.setScrollPositionDirect(0,0);
		    
			this.$.image.setSrc(this.entry.author_avatar_bigger);
			this.$.image.applyStyle("display", "");			
			this.$.realname.setContent(this.entry.author_fullname||this.entry.author_username);
			this.$.username.setContent("@" + this.entry.author_username);
			var url = this.entry.author_url || '';
			this.$.url.setContent(sch.autolink(enyo.string.runTextIndexer(url)), url.length);
			this.$.bio.setContent(AppUtils.makeItemsClickable(this.entry.author_description) || '');
			this.$.time.setContent(sch.getRelativeTime(this.entry.publish_date));
			if (this.entry._orig.source) {
				this.$.from.setContent(this.entry._orig.source);
			}
			enyo.forEach (this.$.images.getControls(), function (control) {
				control.destroy();
			});
			this.$.entry.setContent(AppUtils.makeItemsClickable(this.entry.text));
			
			
			// expand URLs
			var shurl = new SpazShortURL();
			var entryhtml = self.$.entry.getContent();
			var urls = shurl.findExpandableURLs(entryhtml);
			if (urls) {
				for (var i = 0; i < urls.length; i++) {
					shurl.expand(urls[i], {
						'onSuccess':function(data) {
							entryhtml = shurl.replaceExpandableURL(entryhtml, data.shorturl, data.longurl)
							self.$.entry.setContent(entryhtml);
							if ((i + 1) >= urls.length) {
								self.buildMediaPreviews();
							}
						}
					});
				}
			} else {
				this.buildMediaPreviews();
			}
			

			
			
			// build conversation
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
			} else {
				this.$.repost.setShowing(false);			
			}
			
			this.setFavButtonState();
			
			this.$.deleteButton.setShowing((this.entry.is_author) || (this.entry.is_private_message));
		} else {
			this.doDestroy();
		}
	},
	
	
	buildMediaPreviews: function() {
		
		var self = this;
		
		var siu = new SpazImageURL();
		var imageThumbUrls = siu.getThumbsForUrls(this.$.entry.getContent());
		console.log(this.entry.text_raw, imageThumbUrls);
		var imageFullUrls = siu.getImagesForUrls(this.$.entry.getContent());
		this.imageFullUrls = [];
		if (imageThumbUrls) {
			var i = 0;
			for (var imageUrl in imageThumbUrls) {
				var imageComponent = this.$.images.createComponent({
					kind: "enyo.Control",
					owner: this,
					components: [
						{style: "height: 10px;"},
						{name: "imagePreview" + i, kind: "enyo.Image", onclick: "imageClick", src: imageThumbUrls[imageUrl]}
					]
				});
				imageComponent.render();
				this.imageFullUrls.push(imageFullUrls[imageUrl]);
				i++;
			}
		} else {
			jQuery('#spaz_entryview_entry').embedly({
				maxWidth: 300,
				maxHeight:300,
				'method':'afterParent',
				'wrapElement':'div',
				'className':'thumbnails',
				'success':function(oembed, dict) {
					
					if (oembed.code.indexOf('<embed') === -1) { // webOS won't render Flash inside an app. DERP.
						var embedlyComponent = self.$.images.createComponent({
							kind: "enyo.Control",
							owner: self,
							components: [
								{style: "height: 10px;"},
								// {kind: "enyo.Image", style: "max-width: 100%;", onclick: "embedlyClick", src: oembed.thumbnail_url, url: oembed.url},
								{kind: "enyo.HFlexBox", pack: "center", components: [
									{name: "oembed_code", allowHtml: true, content:oembed.code}
								]}
							]
						});
						embedlyComponent.render();
					} else {
						console.log("skipping oembed with <embed> tag in it", oembed.code);
					}
				}
			});
		};
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
	    } else {
			setTimeout(enyo.bind(this, function(){ this.$.detail_scroller.scrollTo(0, 0)}), 100);
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
	},
	share: function(inSender) {
		this.$.sharePopup.openAroundControl(inSender);
	},
	imageClick: function(inSender) {
		var imageIndex = parseInt(inSender.getName().replace("imagePreview", ""), 10);
		this.doShowImageView(this.imageFullUrls, imageIndex);
	},
	embedlyClick: function(inSender) {
		if(inSender.url) {
			this.$.browser.call({id: "com.palm.app.browser", params: {target: inSender.url}});
		}
	},
	toggleFavorite: function(inSender){
		var that = this;
		var account = App.Users.get(this.entry.account_id);
		var auth = new SpazAuth(account.type);
		auth.load(account.auth);
			
		that.twit = that.twit || new SpazTwit();
		that.twit.setBaseURLByService(account.type);
		that.twit.setSource(App.Prefs.get('twitter-source'));
		that.twit.setCredentials(auth);
			
		if (that.entry.is_favorite) {
			console.log('UNFAVORITING %j', that.entry);
			that.twit.unfavorite(
				that.entry.service_id,
				function(data) {
					that.entry.is_favorite = false;
					that.setFavButtonState();
					AppUI.rerenderTimelines();
					AppUtils.showBanner($L('Removed favorite'));
				},
				function(xhr, msg, exc) {
					AppUtils.showBanner($L('Error removing favorite'));
				}
			);
		} else {
			console.log('FAVORITING %j', that.entry);
			that.twit.favorite(
				that.entry.service_id,
				function(data) {
					that.entry.is_favorite = true;
					that.setFavButtonState();
					AppUI.rerenderTimelines();
					AppUtils.showBanner($L('Added favorite'));								
				},
				function(xhr, msg, exc) {
					AppUtils.showBanner($L('Error adding favorite'));
				}
			);
		}
	}, 
	setFavButtonState: function(){
		if(this.entry.is_favorite === true){
			this.$.favoriteButton.setDisabled(false);
			this.$.favoriteButton.setIcon("source/images/icon-favorite.png");
		} else if(this.entry.is_private_message === true){
			this.$.favoriteButton.setDisabled(true);
		} else {		
			this.$.favoriteButton.setIcon("source/images/icon-favorite-outline.png");
			this.$.favoriteButton.setDisabled(false);
		}
	},
	sharePopupSelected: function(inSender, inSelected) {
		switch(inSelected.getValue()) {
			case enyo._$L("Repost"):
				AppUI.repost(this.entry);
				break;
			case enyo._$L("Edit & Repost"):
				AppUI.repostManual(this.entry);
				break;
			case enyo._$L("Email"):
				AppUtils.emailTweet(this.entry);
				break;
			case enyo._$L("SMS/IM"):
				AppUtils.SMSTweet(this.entry);
				break;
			case enyo._$L("Copy To Clipboard"):
				AppUtils.copyTweet(this.entry);
				break;
			default:
				console.error(inSelected.getValue() + " has no handler");
				break;
		}
	},
	deleteEntry: function() {
		AppUI.confirmDeleteEntry(this.entry);
	}
});
