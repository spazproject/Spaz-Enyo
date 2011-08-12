enyo.kind({
	name: "Spaz.Column",
	kind: enyo.VFlexBox,
	width: "322px",
	style: "margin: 3px;",
	className: "Column",
	events: {
		onDeleteClicked: "",
		onLoadStarted: "",
		onLoadFinished: "",
		onMoveColumnRight: "",
		onMoveColumnLeft: "",


		onToolbarmousehold: "",
		onToolbarmouserelease: "",
		onToolbardragstart: "",
		onToolbardrag: "",
		onToolbardragfinish: ""
	},
	published: {
		info: {
			//type: home/direct/search/replies
			//display: what is in the header
			//accounts: object array of accounts
			//		{"type": "twitter", "username": "@Tibfib" etc
			//

		},
		entries: []
	},

	components: [
		{kind: "Toolbar", height: "42px", defaultKind: "Control", onclick: "scrollToTop", style: "min-height: 42px; color: white; color: white; padding-left: 5px;",
			onmousehold: "doToolbarmousehold",
			onmouserelease: "doToolbarmouserelease",
			ondragstart: "doToolbardragstart",
			ondrag: "doToolbardrag",
			ondragfinish: "doToolbardragfinish",
			components: [
				//gotta do this to get the header title to center and not be a button. "defaultKind" in Toolbar is key.
				{name: "topLeftButton", kind: "ToolButton", style: "display: none"},
				{name: "header", style: "padding: 0px 0px 5px 5px;", className: "truncating-text", content: ""},
				{name: "refresh", kind: "ToolButton", icon: "source/images/icon-refresh.png", onclick:"loadNewer", showing: false},
				{name: "unreadCount", /*style: "font-size: 12px; margin: 2px 0px 0px 4px; padding: 3px 4px 3px 6px;background-color: rgba(75, 153, 215, .7); -webkit-border-radius: 5px;",*/ align: "left", className: "unreadCountBadge", showing: false, onclick: "unreadClicked", content: "" },
				{kind: "Spacer", flex: 1},
				{name: "accountName", style: "color: grey; font-size: 12px; padding-left: 2px;"},
				{name: "topRightButton", kind: "ToolButton", icon: "source/images/icon-close.png", onclick: "deleteClicked"}
		]},
		{kind: enyo.VFlexBox, flex: 1, className: "timeline", components: [
				{name: "pulltoRefreshTextTeaser", className: "ptrOuter", style: "opacity: 0", components: [
					{content: "Release to refresh &uarr;", className: "ptrInside"}
				]},
				{name: "list", kind: "Spaz.VirtualList", flex: 1, horizontal: false, className: "list", onAcquirePage:'acquirePage', onSetupRow: "setupRow", onPullToRefresh: "pullToRefresh", components: [
					{
						name: "item",
						kind: "Spaz.Entry",
						onEntryClick: "entryClick",
						onEntryHold: "entryHold"
					}
				]},
				{kind: enyo.Control, name: "scrollFade", className: "scrollFade", width: "100%", height: "50px"}
				// {kind: enyo.Image, name: "spazLogo", src: "spaz-icon-flat-512.png", width: "300px", showing: false, className: "spazLogo"},
			]
		},
		{name: "entryClickPopup", kind: "Spaz.EntryClickPopup"}
	],
	pullToRefresh: function() {
		// this is a sanity check to ensure we're really
		// dragging from the top of the list. After we scrollToUnread,
		// the list scroller thinks that the top of the list is
		// the newest unread item, not the actual top of the list
		if (this.$.list.$.scroller.pageTop >= 0) {
			console.log("pullToRefresh executing");
			this.loadNewer();
		}
	},
	create: function(){
		this.inherited(arguments);
     	this.infoChanged();
		this.checkArrows();
		this.scrollOffset = 0;

		// if this column does not already have entries, gotta fetch from the network
		if(this.entries.length === 0) {
			enyo.asyncMethod(this, this.loadNewer, {forceCountUnread: true});
		}
		else {
			enyo.asyncMethod(this, this.countUnread);
		}

	},
	checkArrows: function(){
		if(this.name === "Column0"){
     		//this.$.moveColumnLeftButton.setDisabled(true);
     	}
		if(this.name === "Column" + (this.owner.columnData.length-1)){
     		//this.$.moveColumnRightButton.setDisabled(true);
		}
	},
	infoChanged: function(){
		// don't set header contents here - wait until the column is
		// rendered and then manually resize header to fit.

		//@TODO: If we ever allow custom combining of accounts, we need to change this.
		this.$.accountName.setContent(this.info.service || App.Users.getLabel(this.info.accounts[0]));
	},

	loadNewer:function(opts) {
		this.loadData(enyo.mixin(opts, {'mode':'newer'}));
		sch.debug('Loading newer entries');
	},

	loadOlder:function() {
		this.loadData({'mode':'older'});
		sch.debug('Loading older entries');
	},

	acquirePage:function(inSender, inPage) {
		var index = inPage * inSender.pageSize;
		if (index > -1 && !this.entries[index] && this.entries.length > 0) {
			this.loadOlder();
		}
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

			if (this.entries.length > 0) {
				if (opts.mode === 'newer') {
					since_id = _.first(this.entries).service_id;
					// mark all existing as read
					this.markAllAsRead();
				}

				if (opts.mode === 'older') {
					since_id = '-'+(_.last(self.entries).service_id);
				}
			} else {
				since_id = 1;
			}
			var dataLength, accountsLoaded = 0, totalData = [];

			_.each(self.info.accounts, function(account_id){
				loadData(account_id);
			});

			function loadStarted() {
				if(accountsLoaded === 0){
					self.doLoadStarted();
					self.$.refresh.addClass("spinning");
					self.$.refresh.setShowing(true);
					self.$.header.applyStyle("max-width",
						self.$.toolbar.getBounds().width
						 - self.$.unreadCount.getBounds().width
					 	 - self.$.accountName.getBounds().width
						 - self.$.topRightButton.getBounds().width
						 - self.$.topLeftButton.getBounds().width
						 - self.$.refresh.getBounds().width
						 - 30
						 + "px");

					dataLength = self.entries.length;
				}
				accountsLoaded++;


			}
			function loadFinished(data, opts, account_id) {
				accountsLoaded--;
				if(data !== undefined){
					_.each(data, function(d){
						d.account_id = account_id;
					});
					totalData.push(data);// = [].concat(totalData, data);
				}
				if(accountsLoaded === 0){
					self.doLoadFinished();

					self.processData(totalData, opts);

					self.$.refresh.setShowing(false);
					self.$.refresh.removeClass("spinning");
					self.$.header.applyStyle("max-width",
						self.$.toolbar.getBounds().width
						 - self.$.unreadCount.getBounds().width
					 	 - self.$.accountName.getBounds().width
						 - self.$.topRightButton.getBounds().width
						 - self.$.topLeftButton.getBounds().width
						 - self.$.refresh.getBounds().width
						 - 30
						 + "px");


					if(dataLength !== self.entries.length && opts.mode !== 'older'){
						//go to top.
						if(App.Prefs.get("timeline-scrollonupdate")){

							//go to first unread
							self.setScrollPosition();
							self.$.list.punt();

							//self.$.list.refresh();
						}
					}
				}
			}
			function loadFailed(){
				accountsLoaded--;
				console.error("Load failed for an account");
				if(accountsLoaded === 0){
					self.doLoadFinished();

					self.$.refresh.setShowing(false);
					self.$.refresh.removeClass("spinning");
					self.$.header.applyStyle("max-width",
						self.$.toolbar.getBounds().width
						 - self.$.unreadCount.getBounds().width
					 	 - self.$.accountName.getBounds().width
						 - self.$.topRightButton.getBounds().width
						 - self.$.topLeftButton.getBounds().width
						 - self.$.refresh.getBounds().width
						 - 30
						 + "px");
				}
			}

			function loadData(account_id){
				var account = App.Users.get(account_id);
				var auth = new SpazAuth(account.type);
				auth.load(account.auth);

				self.twit = new SpazTwit();
				self.twit.setBaseURLByService(account.type);
				self.twit.setSource(App.Prefs.get('twitter-source'));
				self.twit.setCredentials(auth);

				switch (self.info.type) {
					case SPAZ_COLUMN_HOME:
						loadStarted();
						self.twit.getHomeTimeline(since_id, 50, null, null,
							function(data) {
								//self.processData(data, opts);
								loadFinished(data, opts, account_id);
							},
							loadFailed
						);
						break;
					case SPAZ_COLUMN_MENTIONS:
						// this method would consistently 502 if we tried to get 200. limit to 100
						loadStarted();
						self.twit.getReplies(since_id, 50, null, null,
							function(data) {
								//self.processData(data, opts);
								loadFinished(data, opts, account_id);
							},
							loadFailed
						);
						break;
					case SPAZ_COLUMN_MESSAGES:
						loadStarted();
						self.twit.getDirectMessages(since_id, 50, null, null,
							function(data) {
								//self.processData(data, opts);
								loadFinished(data, opts, account_id);
							},
							loadFailed
						);
						break;
					case SPAZ_COLUMN_SEARCH:
						loadStarted();
						self.twit.search(self.info.query, since_id, 50, null, null, null,
							function(data) {
								//self.processData(data, opts);
								loadFinished(data, opts, account_id);
							},
							loadFailed
						);
						break;

					case SPAZ_COLUMN_FAVORITES:
						loadStarted();
						self.twit.getFavorites(since_id, null, null,
							function(data) {
								//self.processData(data, opts);
								loadFinished(data, opts, account_id);
							},
							loadFailed
						);
						break;
					 case SPAZ_COLUMN_SENT:
					 	loadStarted();
					 	window.AppCache.getUser(account.username, account.type, account.id,
					 		function(user){
					 			self.twit.getUserTimeline(user.service_id, 50, null,
							 		function(data) {
							 			//self.processData(data, opts);
							 			loadFinished(data, opts, account_id);
							 		},
						 			loadFailed
					 			);
					 		},
					 		loadFailed
					 	);
					 	break;
					case SPAZ_COLUMN_LIST:
						loadStarted();
						window.AppCache.getUser(account.username, account.type, account.id,
							function(user) {
								self.twit.getListTimeline(self.info.list,user.service_id,
									function(data) {
										//self.processData(data.statuses, opts);
										loadFinished(data, opts, account_id);
									},
									loadFailed
								);
							},
							loadFailed
						);
						break;
				}
			}

		} catch(e) {
			console.error(e);
			// AppUtils.showBanner('you probably need to make an account');
		}

	},
	processData: function(arrayOfData, opts, account_id) {
		var self = this;

		opts = sch.defaults({
			'mode':'newer',
			'since_id':null,
			'max_id':null
		}, opts);

		if (arrayOfData) {
			enyo.log('adding new data');
			switch (this.info.type) {
				default:
					var data = [], earliestPublishDate = 0;
					_.each(arrayOfData, function(array){

						if (!array) {
							return;
						}

						/* convert to our internal format */
						array = AppUtils.convertToEntries(array);

						//if the EARLIEST item is more recent, set it to our earliestPublishDate
						if(_.first(array).publish_date > earliestPublishDate){
							earliestPublishDate = _.first(array).publish_date;
						}
						data = data.concat(array);
					});

					/* check for duplicates based on the .id property */
					/* we do this before conversion to save converting stuff
					   that won't be needed */
					data = _.reject(data, function(item) {
						for (var i = 0; i < self.entries.length; i++) {
							if (item.service_id === self.entries[i].service_id) {
								return true;
							} else {
								if (opts.mode === 'older') {
									item.read = true;
								} else {
									item.read = false;
								}
							}
						}
					});

					if (data.length > 0) {
						/* convert to our internal format */
						//data = AppUtils.convertToEntries(data);

						/* add more entry properties */
						data = AppUtils.setAdditionalEntryProperties(data);

						// mark new as read or not read, depending on mode
						for (var i = data.length - 1; i >= 0; i--){
							if (opts.mode === 'older') {
								data[i].read = true;
							} else {
								data[i].read = false;
							}
						}

						var filteredData = _.reject(data, function(item) {
							if ((item.publish_date < earliestPublishDate)) {
								return true;
							}
						});
						if(filteredData.length < 10 && data.length > 5){
							//console.log("filteredData length is less than 10, so just getting the 10 most recent entries");

							data = _.sortBy(data, function(item){
								return earliestPublishDate - item.publish_date;
							}).slice(0, 10);
						} else {
							data = filteredData;
						}

						/* concat to existing entries */
						this.entries = [].concat(data.reverse(), this.entries);

						/* sort our good stuff */
						this.sortEntries();

						this.scrollOffset = 0;
						if(data.length > 0){
							this.$.list.refresh();
						}

					}
					break;
			}
		} else {
			enyo.log('No new data');
		}

		this.markOlderAsRead();

		if(opts.forceCountUnread) {
			this.countUnread();
		}

		this.setLastRead();

		this.notifyOfNewEntries();

	},


	notifyOfNewEntries: function() {
		var new_entries = _.reject(this.entries, function(item) { return !!item.read; } );

		for (var i=0; i < new_entries.length; i++) {
			AppUI.addEntryToNotifications(new_entries[i]);
		}
	},

	markAllAsRead: function() {
		enyo.log('Marking all as read');
		var changed = 0;
		for (var i = this.entries.length - 1; i >= 0; i--){
			if (this.entries[i].read !== true) {
				// enyo.log('marking '+ this.entries[i].text_raw+ ' as read');
				this.entries[i].read = true;
				changed++;
			}
		}
		if (changed > 0) {
			this.$.list.refresh();
			this.countUnread();
		}
	},

	markOlderAsRead: function() {
		var last_read_date = this.getLastRead();
		var changed = 0;
		for (var i = 0; i < this.entries.length; i++){
			if (this.entries[i].publish_date <= last_read_date) {
				//if(!this.entries[i].read){
					changed++;
				//}
				this.entries[i].read = true;
			}
		}
		if (changed > 0) {
			this.countUnread();
		}
	},
	countUnread: function() {
		var count = 0;
		_.each(this.entries, function(entry){
			if(entry.read === false){
				count++;
			}
		});
		if(count > 0){
			this.$.unreadCount.show();
			this.$.unreadCount.setContent(count);
		} else {
			this.$.unreadCount.hide();
		}
		this.$.header.applyStyle("max-width",
			this.$.toolbar.getBounds().width
				 - this.$.unreadCount.getBounds().width
				 - this.$.accountName.getBounds().width
				 - this.$.topRightButton.getBounds().width
				 - this.$.topLeftButton.getBounds().width
				 - this.$.refresh.getBounds().width
				 - 30
				 + "px");


	},
	scrollToFirstUnread: function(){
		this.setScrollPosition();
		this.$.list.punt();

	},
	setScrollPosition: function() {
		if(App.Prefs.get("timeline-scrollonupdate") === true){
			for(var i = 0; i < this.entries.length; i++){
				if(this.entries[i].read === true){ //this is the first read entry
					this.scrollOffset = (i > 0) ? (i-1): 0;
					//set scrollOffset to be first unread item
					break;
				} else {
					//@TODO: for all unread items we should do something here.
					this.scrollOffset = 0;//((this.entries.length - 10) > 0) ?  this.entries.length - 10 : 0;
				}
			};
		} else {
			this.scrollOffset = 0;//this.loadOffset; @TODO
		}

	},

	sortEntries: function() {
		this.entries.sort(function(a,b){
			return b.service_id - a.service_id; // newest first
		});
	},

	setupRow: function(inSender, inIndex) {
		var entry;
		if ( (entry = this.entries[inIndex + this.scrollOffset]) ) {
			//this.loadOffset = inIndex + this.scrollOffset; @TODO: this will be the last item rendered, so it doesn't quite work for us to use it for the scroll offset.
			this.$.item.setEntry(entry);
			return true;
		}
	},
	entryClick: function(inSender, inEvent, inRowIndex) {
		inSender.entry.columnIndex = parseInt(this.name.replace('Column', ''), 10);
		if(App.Prefs.get("entry-tap") === "panel"){
			AppUI.viewEntry(inSender.entry);
		} else {
			this.$.entryClickPopup.showAtEvent(inSender.entry, inEvent);
		}

	},
	entryHold: function(inSender, inEvent, inRowIndex) {
		inSender.entry.columnIndex = parseInt(this.name.replace('Column', ''), 10);
		if(App.Prefs.get("entry-hold") === "popup"){
			this.$.entryClickPopup.showAtEvent(inSender.entry, inEvent);
		} else if(App.Prefs.get("entry-hold") === "panel"){
			AppUI.viewEntry(inSender.entry);
		}
	},
	scrollToTop: function(inSender, inEvent){
		this.scrollOffset = 0;
		this.$.list.punt();
	},
	scrollToBottom: function(){
		//this.$.list.$.scroller.scrollToBottom();
	},
	rendered: function() {
		this.inherited(arguments);
		if (this.hasNode()) {
			this.$.header.setContent("");

			// this.$.header.applyStyle("max-width", this.$.accountName.getBounds().left - this.$.header.getBounds().left + "px");
			// this.$.header.setContent(_.capitalize(this.info.type));

			var headerBounds = this.$.header.getBounds();
			var accountNameBounds = this.$.accountName.getBounds();
			this.$.header.applyStyle("max-width", accountNameBounds.left - headerBounds.left + "px");
			if(this.info.type === "list") {
				this.$.header.setContent(this.info.list);
			} else {
				this.$.header.setContent(_.capitalize(this.info.type));
			}
		}

		this.$.pulltoRefreshTextTeaser.width = this.width;
	},
	refreshList: function(forceReload){
		this.$.list.refresh();

		if(this.info.type === SPAZ_COLUMN_FAVORITES || forceReload === true){
			this.entries = [];
			this.loadData();
		}
	},

	getHash: function() {
		return sch.MD5(this.info.type + "_" + this.info.id);
	},

	getLastRead: function() {
		return LastRead.get(this.getHash());
	},

	setLastRead: function() {
		var last_read_date = 1;

		if (this.entries.length > 0) {
			// find newest publish_date
			// we assume we're newest first
			var newest_item = _.max(this.entries, function(item) { return item.publish_date; });
			last_read_date = newest_item.publish_date;
		}

		LastRead.set(this.getHash(), last_read_date);

	},

	removeEntryById: function(inEntryId) {
		for (var i = this.entries.length - 1; i >= 0; i--) {
			if (this.entries[i].service_id === inEntryId) {
				this.entries.splice(i, 1);
			}
		}
		this.$.list.refresh();
	},

	deleteClicked: function(inSender, inEvent) {
		this.doDeleteClicked();

		// we've handled this event, stop it from propagating up
		return true;
	},

	unreadClicked: function(inSender, inEvent) {
		// @TODO Maybe some fancy animation to hide the unread count?
		this.markAllAsRead();

		// we've handled this event, stop it from propagating up
		return true;
	},

	showHideEntries: function(inShowHide){
		this.$.list.setShowing(inShowHide);
		// this.$.spazLogo.setShowing(!inShowHide);
	}

});
