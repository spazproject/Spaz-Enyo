enyo.kind({
	name: "Spaz.Column",
	kind: enyo.VFlexBox,
	width: "322px",
	style: "margin: 3px;", 
	events: {
		onShowUserView: "",
		onShowEntryView: "",
		onDeleteClicked: "",
		onLoadStarted: "",
		onLoadFinished: "",
		onReply: "",
		onDirectMessage: "",

		onMoveColumnRight: "",
		onMoveColumnLeft: ""
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
				{name: "header", style: "padding: 0px 0px 5px 10px;", className: "truncating-text", content: ""},
				{kind: "Spacer", flex: 1},
				{name: "accountName", style: "color: grey; font-size: 12px"},
				{name: "topRightButton", kind: "ToolButton", icon: "source/images/icon-close.png", onclick: "doDeleteClicked"},
			]},
			{name: "list", kind: "Spaz.VirtualList", flex: 1, style: "background-color: #D8D8D8; margin: 0px 3px; min-height: 200px;", horizontal: false, className: "timeline list", onSetupRow: "setupRow", components: [
				{name: "item", kind: "Spaz.Entry", onclick: "entryClick"}
			]},
			{kind: "Toolbar", style: "color: white;", components: [
				{name: "moveColumnLeftButton", onclick: "doMoveColumnLeft", kind: "ToolButton", icon: "source/images/icon-back.png"},
				{kind: "Spacer"},
				{name: "refresh", kind: "ToolButton", icon: "source/images/icon-refresh.png", onclick:"loadNewer"},
				{kind: "Spacer"},
				{name: "moveColumnRightButton", onclick: "doMoveColumnRight", kind: "ToolButton", icon: "source/images/icon-forward.png"}

				//{kind: "ToolButton", icon: "source/images/icon-clear.png"}, @TODO. make this clear the current tweets, or remove it completely
			]}
		]},

		{name: "entryClickPopup", kind: "Spaz.EntryClickPopup", onShowEntryView: "doShowEntryView", onReply: "doReply", onDirectMessage: "doDirectMessage"}
	],
	entries: [],
	create: function(){
		this.inherited(arguments);
     	this.infoChanged();
     	setTimeout(enyo.bind(this, this.resizeHandler), 1);

     	if(this.name === "Column0"){
     		this.$.moveColumnLeftButton.setDisabled(true);
     	}
		if(this.name === "Column" + (this.owner.columnData.length-1)){
     		this.$.moveColumnRightButton.setDisabled(true);			
		}
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

			self.twit = new SpazTwit();
			self.twit.setBaseURLByService(account.type);
			self.twit.setSource(App.Prefs.get('twitter-source'));
			self.twit.setCredentials(auth);

			if (this.entries.length > 0) {
				if (opts.mode === 'newer') {
					since_id = _.first(this.entries).service_id;
				}

				if (opts.mode === 'older') {
					if (self.info.type === 'search') {
						throw {
							message:'Search columns do not yet support loading older messages',
							name:'UserException'
						};
					}
					since_id = (_.last(self.entries).service_id)*-1;
				}
			} else {
				since_id = 1;
			}

			function loadStarted() {
				self.$.refresh.addClass("spinning");
				self.doLoadStarted();
			}
			function loadFinished() {
				self.$.refresh.removeClass("spinning");
				self.doLoadFinished();
			}
			switch (self.info.type) {
				case 'home':
					loadStarted();
					self.twit.getHomeTimeline(since_id, 200, null, null,
						function(data) {
							self.processData(data);
							loadFinished();
						},
						loadFinished
					);
					break;
				case 'mentions':
					// this method would consistently 502 if we tried to get 200. limit to 100
					loadStarted();
					self.twit.getReplies(since_id, 100, null, null,
						function(data) {
							self.processData(data);
							loadFinished();
						},
						loadFinished
					);
					break;
				case 'messages':
					loadStarted();
					self.twit.getDirectMessages(since_id, 200, null, null,
						function(data) {
							self.processData(data);
							loadFinished();
						},
						loadFinished
					);
					break;
				case 'search':
					loadStarted();
					self.twit.search(self.info.query, since_id, 200, null, null, null,
						function(data) {
							self.processData(data);
							loadFinished();
						},
						loadFinished
					);
					break;
			}


		} catch(e) {
			console.error(e);
			AppUtils.showBanner('you probably need to make an account');
		}
	},
	processData: function(data) {
		var self = this;
		if (data) {
			switch (this.info.type) {
				default:
					
					/* check for duplicates based on the .id property */
					/* we do this before conversion to save converting stuff
					   that won't be needed */
					data = _.reject(data, function(item) {
						for (var i = 0; i < self.entries.length; i++) {
							if (item.id === self.entries[i].service_id) {
								return true;
							}
						};
					});

					/* convert to our internal format */
					data = AppUtils.convertToEntries(data);
					

					this.entries = [].concat(data.reverse(), this.entries);
					this.entries.sort(function(a,b){
						return b.service_id - a.service_id; // newest first
					});
					
					// add in the account used to get this entry. this seems sloppy here.
					for (var j = this.entries.length - 1; j >= 0; j--){
						this.entries[j].account_id = this.info.accounts[0];
					}
					
					this.$.list.refresh();
					this.resizeHandler();
					break;
			}			
		}
	},
	setupRow: function(inSender, inIndex) {
		if (this.entries[inIndex]) {
			var entry = this.entries[inIndex];
			this.$.item.setEntry(entry);
			
			//this.$.item.applyStyle("background-color", inSender.isSelected(inIndex) ? "rgba(218,235,251,0.4)" : null);

			return true;
		}
	},
	entryClick: function(inSender, inEvent, inRowIndex) {
		switch(inEvent.target.className){
			case "username":
			case "username author":
			case "username clickable":
				this.doShowUserView(inEvent.target.getAttribute('data-user-screen_name'), App.Users.get(this.info.accounts[0]).type, this.info.accounts[0]);
				break;
			case "hashtag":

				break;
			case "small":
				this.doShowEntryView(this.entries[inRowIndex]);
				break;
			case "avatar": //we may want to move toward a default situation.
			case "text":
			case "enyo-vflexbox":
			case "enyo-item entry enyo-hflexbox":
				this.$.entryClickPopup.showAtEvent(this.entries[inRowIndex], inEvent);
				break;

		}
	},
	resizeHandler: function(inHeight) {
		this.$.list.applyStyle("height", window.innerHeight - 117 + "px");
		this.$.list.resizeHandler();
	}
});
