enyo.kind({
	name: "Spaz.Column",
	kind: enyo.VFlexBox,
	width: "322px",
	style: "margin: 5px 5px;", 
	events: {
		onShowEntryView: ""
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
				{kind: "Spacer", flex: 1},
				{name: "header", flex: 1, content: ""},
				{kind: "Spacer", flex: 1},
				{kind: "ToolButton", icon: "source/images/icon-close.png"},
			]},
			{name: "list", kind: "VirtualList", flex: 1, style: "background-color: #D8D8D8; margin: 0px 0px; min-height: 400px;", className: "timeline list", onSetupRow: "setupRow", components: [
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
				{kind: "ToolButton", icon: "source/images/icon-refresh.png", onclick:"loadNewer"}
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
		this.$.header.setContent(this.info.display);
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
			var account = App.Users.get(this.info.accounts[0]);
			var auth = new SpazAuth(account.type);
			auth.load(account.auth);

			// embedding for now for the sake of testing
			this.twit = new SpazTwit();
			this.twit.setBaseURLByService(account.type);
			this.twit.setSource(App.Prefs.get('twitter-source'));
			this.twit.setCredentials(auth);

			if (this.entries.length > 0) {
				if (opts.mode === 'newer') {
					since_id = _.first(this.entries).id;
				}

				if (opts.mode === 'older') {
					if (this.info.type === 'search') {
						throw {
							message:'Search columns do not yet support loading older messages',
							name:'UserException'
						};
					}
					since_id = (_.last(this.entries).id)*-1;
				}
			} else {
				since_id = 1;
			}


			switch (this.info.type) {
				case 'home':
					this.twit.getHomeTimeline(since_id, 200, null, null,
						function(data) {
							self.processData(data);
						}
					);
					break;
				case 'mentions':
					// this method would consistently 502 if we tried to get 200. limit to 100
					this.twit.getReplies(since_id, 100, null, null,
						function(data) {
							self.processData(data);
						}
					);
					break;
				case 'dms':
					this.twit.getDirectMessages(since_id, 200, null, null,
						function(data) {
							self.processData(data);
						}
					);
					break;
				case 'search':
					this.twit.search(this.info.query, since_id, 200, null, null, null,
						function(data) {
							self.processData(data);
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
		if (data) {
			switch (this.info.type) {
				default:
					this.entries = [].concat(data.reverse(), this.entries);
					this.entries.sort(function(a,b){
						return b.id - a.id; // newest first
					});

					this.$.list.refresh();
					break;
			}			
		}
	},
	setupRow: function(inSender, inIndex) {
		if (this.entries[inIndex]) {
			var entry = this.entries[inIndex];
			this.$.entry.setContent("<span class='username'>" + entry.user.screen_name + "</span><br>" + AppUtils.makeItemsClickable(enyo.string.runTextIndexer(entry.text)));
			this.$.timeFrom.setContent(sch.getRelativeTime(entry.created_at) + " from <span class='link'>" + entry.source + "</span>");
			this.$.image.setSrc(entry.user.profile_image_url);
			
			//this.$.item.applyStyle("background-color", inSender.isSelected(inIndex) ? "rgba(218,235,251,0.4)" : null);

			return true;
		}
	},
	entryClick: function(inSender, inEvent, inRowIndex) {
		this.$.entryClickPopup.showAtEvent(this.entries[inRowIndex], inEvent);
		//this.doEntryClick(this.entries[inRowIndex]);
		//this.$.list.select(inRowIndex);
	},
	resizeHandler: function(inHeight) {
		this.$.list.applyStyle("height", window.innerHeight - 117 + "px");
		this.$.list.resizeHandler();
	}
});
