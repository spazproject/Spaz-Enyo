enyo.kind({
	name: "Spaz.Column",
	kind: enyo.VFlexBox,
	width: "322px",
	style: "margin: 3px;", 
	events: {
		onShowEntryView: "",
		onDeleteClicked: ""
	},
	published: {
		info: {
			//type: home/direct/search/replies
			//display: what is in the header
			//accounts: object array of accounts 
			//		{"type": "twitter", "username": "@Tibfib" etc
			//

		}
	},
	components: [
		{layoutKind: "VFlexLayout", components: [
			{kind: "Toolbar", defaultKind: "Control", content: "Home", style: "color: white;", components: [
				//gotta do this crap to get the header title to center and not be a button. "defaultKind" in Toolbar is key.
				{name: "topLeftButton", kind: "ToolButton", style: "display: none"},
				{name: "header", style: "padding: 0px 0px 5px 10px;", class: "truncating-text", content: ""},
				{kind: "Spacer", flex: 1},
				{name: "accountName", style: "color: grey; font-size: 12px"},
				{name: "topRightButton", kind: "ToolButton", icon: "source/images/icon-close.png", onclick: "doDeleteClicked"},
			]},
			{name: "list", kind: "Spaz.VirtualList", flex: 1, style: "background-color: #D8D8D8; margin: 0px 3px; min-height: 200px;", horizontal: false, className: "timeline list", onSetupRow: "setupRow", components: [
				{kind: "Item", tapHighlight: true, className: "entry", style: "padding-right: 5px;", layoutKind: "HFlexLayout", onclick: "entryClick", components: [
					{kind: "VFlexBox", components: [
						{kind: "Image", width: "50px", height: "50px", className: "avatar"},
					]},
					{kind: "VFlexBox", flex: 1, components: [
						{name: "entry", className: "text"},
						{name: "timeFrom", className: "small"},
					]},		
					//{kind: "VFlexBox", width: "24px", components: [
					//	{kind: "Image", src: "source/images/action-icon-favorite.png"},
					//	{kind: "Image", src: "source/images/action-icon-share.png"},
					//	{kind: "Image", src: "source/images/action-icon-reply.png"},
					//]}		
				]}
			]},
			{kind: "Toolbar", style: "color: white;", components: [
				{kind: "ToolButton", icon: "source/images/icon-clear.png"},
				{name: "refresh", kind: "ToolButton", icon: "source/images/icon-refresh.png", onclick:"loadNewer"}
			]}
		]},

		{name: "entryClickPopup", kind: "Spaz.EntryClickPopup", onShowEntryView: "doShowEntryView"}
	],
	entries: [
		 //{user: {screen_name: "Tibfib"}, realname: "Will Honey", from: "Spaz", avatar: "http://a3.twimg.com/profile_images/1281983040/simpsons_profile.png", time: "10 minutes ago", text: "dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
		 //{user: {screen_name: "Tibfib"}, realname: "Will Honey", from: "Spaz", avatar: "http://a3.twimg.com/profile_images/1281983040/simpsons_profile.png", time: "10 minutes ago", text: "dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
		 //{user: {screen_name: "Tibfib"}, realname: "Will Honey", from: "Spaz", avatar: "http://a3.twimg.com/profile_images/1281983040/simpsons_profile.png", time: "10 minutes ago", text: "dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
		// {user: {screen_name: "Tibfib"}, realname: "Will Honey", from: "Spaz", avatar: "http://a3.twimg.com/profile_images/1281983040/simpsons_profile.png", time: "10 minutes ago", text: "dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
		 //{user: {screen_name: "Tibfib"}, realname: "Will Honey", from: "Spaz", avatar: "http://a3.twimg.com/profile_images/1281983040/simpsons_profile.png", time: "10 minutes ago", text: "dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."},
	],
	create: function(){
		this.inherited(arguments);
     	this.infoChanged();

     	setTimeout(enyo.bind(this, this.resizeHandler), 1);

     	this.loadData();
	},
	infoChanged: function(){
		this.$.header.setContent(_.capitalize(this.info.type));
		this.$.accountName.setContent(App.Users.getLabel(this.info.accounts[0]));

	},

	loadNewer:function() {
		this.loadData({'mode':'newer'});
	},

	loadOlder:function() {
		this.loadData({'mode':'older'});
	},


	/**
	 * @param string [opts.mode] newer or older
	 */
	loadData: function(opts) {

		opts = sch.defaults({
			'mode':'newer',
			'since_id':null,
			'max_id':null
		}, opts);

		var self = this;

		try {
			var since_id;
			var account = App.Users.get(self.info.accounts[0]);
			var auth = new SpazAuth(account.type);
			auth.load(account.auth);

			// embedding for now for the sake of testing
			self.twit = new SpazTwit();
			self.twit.setBaseURLByService(account.type);
			self.twit.setSource(App.Prefs.get('twitter-source'));
			self.twit.setCredentials(auth);

			if (this.entries.length > 0) {
				if (opts.mode === 'newer') {
					since_id = _.first(this.entries).id;
				}

				if (opts.mode === 'older') {
					if (self.info.type === 'search') {
						throw {
							message:'Search columns do not yet support loading older messages',
							name:'UserException'
						};
					}
					since_id = (_.last(self.entries).id)*-1;
				}
			} else {
				since_id = 1;
			}


			switch (self.info.type) {
				case 'home':
					self.$.refresh.addClass("spinning");
					self.twit.getHomeTimeline(since_id, 200, null, null,
						function(data) {
							self.processData(data);
							self.$.refresh.removeClass("spinning");
						},
						function() {
							self.$.refresh.removeClass("spinning");
						}
					);
					break;
				case 'mentions':
					// this method would consistently 502 if we tried to get 200. limit to 100
					self.$.refresh.addClass("spinning");
					self.twit.getReplies(since_id, 100, null, null,
						function(data) {
							self.processData(data);
							self.$.refresh.removeClass("spinning");
						},
						function() {
							self.$.refresh.removeClass("spinning");
						}
					);
					break;
				case 'dms':
					self.$.refresh.addClass("spinning");
					self.twit.getDirectMessages(since_id, 200, null, null,
						function(data) {
							self.processData(data);
							self.$.refresh.removeClass("spinning");
						},
						function() {
							self.$.refresh.removeClass("spinning");
						}
					);
					break;
				case 'search':
					self.$.refresh.addClass("spinning");
					self.twit.search(self.info.query, since_id, 200, null, null, null,
						function(data) {
							self.processData(data);
							self.$.refresh.removeClass("spinning");
						},
						function() {
							self.$.refresh.removeClass("spinning");
						}
					);
					break;
			}


		} catch(e) {
			console.error(e);
			alert('you probably need to make an account')
		}
	},
	processData: function(data) {
		var self = this;
		if (data) {
			switch (this.info.type) {
				default:
					
					/* check for duplicates based on the .id property */
					data = _.reject(data, function(item) {
						for (var i = 0; i < self.entries.length; i++) {
							if (item.id === self.entries[i].id) {
								return true;
							}
						};
					});

					this.entries = [].concat(data.reverse(), this.entries);
					this.entries.sort(function(a,b){
						return b.id - a.id; // newest first
					});

					this.$.list.refresh();
					this.resizeHandler();
					break;
			}			
		}
	},
	setupRow: function(inSender, inIndex) {
		if (this.entries[inIndex]) {
			var entry = this.entries[inIndex];
			this.$.entry.setContent("<span class='username author'>" + entry.user.screen_name + "</span><br>" + AppUtils.makeItemsClickable(enyo.string.runTextIndexer(entry.text)));
			this.$.timeFrom.setContent(sch.getRelativeTime(entry.created_at) + " from <span class='link'>" + entry.source + "</span>");
			this.$.image.setSrc(entry.user.profile_image_url);
			
			//this.$.item.applyStyle("background-color", inSender.isSelected(inIndex) ? "rgba(218,235,251,0.4)" : null);

			return true;
		}
	},
	entryClick: function(inSender, inEvent, inRowIndex) {
		switch(inEvent.target.className){
			case "username":

				break;
			case "hashtag":

				break;
			case "avatar": //we may want to move toward a default situation.
			case "text":
			case "enyo-vflexbox":
			case "enyo-item entry enyo-hflexbox":
			case "small":
				this.$.entryClickPopup.showAtEvent(this.entries[inRowIndex], inEvent);
				break;

		}
		//this.doEntryClick(this.entries[inRowIndex]);
		//this.$.list.select(inRowIndex);
	},
	resizeHandler: function(inHeight) {
		this.$.list.applyStyle("height", window.innerHeight - 117 + "px");
		this.$.list.resizeHandler();
	}
});
