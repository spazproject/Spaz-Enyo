enyo.kind({
	name: "Spaz.Column",
	kind: enyo.VFlexBox,
	width: "322px",
	style: "margin: 3px;", 
	events: {
		onDeleteClicked: "",
		onLoadStarted: "",
		onLoadFinished: "",
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
			{kind: "Toolbar", height: "42px", defaultKind: "Control", onclick: "scrollToTop", content: "Home", style: "min-height: 42px; color: white; color: white; padding-left: 5px;", components: [
				//gotta do this to get the header title to center and not be a button. "defaultKind" in Toolbar is key.
				{name: "topLeftButton", kind: "ToolButton", style: "display: none"},
				{name: "header", style: "padding: 0px 0px 5px 5px;", className: "truncating-text", content: ""},
				{kind: "Spacer", flex: 1},
				{name: "accountName", style: "color: grey; font-size: 12px; padding-left: 2px;"},
				{name: "topRightButton", kind: "ToolButton", icon: "source/images/icon-close.png", onclick: "deleteClicked"}
			]},
			{name: "list", kind: "Spaz.VirtualList", flex: 1, style: "background-color: #D8D8D8; margin: 0px 3px; min-height: 200px;", horizontal: false, className: "timeline list", onAcquirePage:'acquirePage', onSetupRow: "setupRow", components: [
				{
					name: "item", 
					kind: "Spaz.Entry",
					onEntryClick: "entryClick"
				}
			]},
			{kind: "Toolbar", height: "42px", onclick: "scrollToBottom", style: "min-height: 42px; color: white;", components: [
				{name: "moveColumnLeftButton", onclick: "doMoveColumnLeft", kind: "ToolButton", icon: "source/images/icon-back.png"},
				{kind: "Spacer"},
				{name: "refresh", kind: "ToolButton", icon: "source/images/icon-refresh.png", onclick:"loadNewer"},
				{kind: "Spacer"},
				{name: "moveColumnRightButton", onclick: "doMoveColumnRight", kind: "ToolButton", icon: "source/images/icon-forward.png"}

				//{kind: "ToolButton", icon: "source/images/icon-clear.png"}, @TODO. make this clear the current tweets, or remove it completely
			]}
		]},

		{name: "entryClickPopup", kind: "Spaz.EntryClickPopup"}
	],
	entries: [],
	create: function(){
		this.inherited(arguments);
     	this.infoChanged();
     	setTimeout(enyo.bind(this, this.resizeHandler), 1);

		this.checkArrows();     
	},
	checkArrows: function(){
		if(this.name === "Column0"){
     		this.$.moveColumnLeftButton.setDisabled(true);
     	}
		if(this.name === "Column" + (this.owner.columnData.length-1)){
     		this.$.moveColumnRightButton.setDisabled(true);			
		}
	},
	infoChanged: function(){
		// don't set header contents here - wait until the column is
		// rendered and then manually resize header to fit.
		this.$.accountName.setContent(App.Users.getLabel(this.info.accounts[0]));
	},

	loadNewer:function() {
		this.loadData({'mode':'newer'});
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
					// mark all existing as read
					this.markAllAsRead();
				}

				if (opts.mode === 'older') {
					since_id = '-'+(_.last(self.entries).service_id);
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
				case SPAZ_COLUMN_HOME:
					loadStarted();
					self.twit.getHomeTimeline(since_id, 50, null, null,
						function(data) {
							self.processData(data);
							loadFinished();
						},
						loadFinished
					);
					break;
				case SPAZ_COLUMN_MENTIONS:
					// this method would consistently 502 if we tried to get 200. limit to 100
					loadStarted();
					self.twit.getReplies(since_id, 50, null, null,
						function(data) {
							self.processData(data, opts);
							loadFinished();
						},
						loadFinished
					);
					break;
				case SPAZ_COLUMN_MESSAGES:
					loadStarted();
					self.twit.getDirectMessages(since_id, 50, null, null,
						function(data) {
							self.processData(data, opts);
							loadFinished();
						},
						loadFinished
					);
					break;
				case SPAZ_COLUMN_SEARCH:
					loadStarted();
					self.twit.search(self.info.query, since_id, 50, null, null, null,
						function(data) {
							self.processData(data, opts);
							loadFinished();
						},
						loadFinished
					);
					break;
					
				case SPAZ_COLUMN_FAVORITES:
					loadStarted();
					self.twit.getFavorites(since_id, null, null,
						function(data) {
							self.processData(data, opts);
							loadFinished();
						},
						loadFinished
					);					
					break;
			}


		} catch(e) {
			console.error(e);
			// AppUtils.showBanner('you probably need to make an account');
		}
		
	},
	processData: function(data, opts) {
		var self = this;
		
		opts = sch.defaults({
			'mode':'newer',
			'since_id':null,
			'max_id':null
		}, opts);
		
		if (data) {
			console.log('adding new data');
			switch (this.info.type) {
				default:					
					
					/* check for duplicates based on the .id property */
					/* we do this before conversion to save converting stuff
					   that won't be needed */
					data = _.reject(data, function(item) {
						for (var i = 0; i < self.entries.length; i++) {
							if (item.id === self.entries[i].service_id) {
								return true;
							} else {
								if (opts.mode === 'older') {
									item.read = true;
								} else {
									item.read = false;
								}
							}
						};
					});
					
					if (data.length > 0) {
						/* convert to our internal format */
						data = AppUtils.convertToEntries(data);
						
						// mark new as read or not read, depending on mode
						for (var i = data.length - 1; i >= 0; i--){
							if (opts.mode === 'older') {
								data[i].read = true;
							} else {
								data[i].read = false;
							}
						}


						/* concat to existing entries */
						this.entries = [].concat(data.reverse(), this.entries);

						/* sort our good stuff */
						this.sortEntries();

						/* add more entry properties */
						this.entries = AppUtils.setAdditionalEntryProperties(this.entries, this.info.accounts[0]);

						this.$.list.refresh();
						this.resizeHandler();
					}
					break;
			}
		} else {
			console.log('No new data');
		}
		
		this.markOlderAsRead();
		
		this.setLastRead();
	},
	
	markAllAsRead: function() {
		console.log('Marking all as read');
		var changed = 0;
		for (var i = this.entries.length - 1; i >= 0; i--){
			if (this.entries[i].read !== true) {
				// console.log('marking '+ this.entries[i].text_raw+ ' as read');
				this.entries[i].read = true;
				changed++;
			}
		}
		if (changed > 0) {
			this.$.list.refresh();
		}
	},
	
	markOlderAsRead: function() {
		var last_read_date = this.getLastRead();
		var changed = 0;
		for (var i = 0; i < this.entries.length; i++){
			if (this.entries[i].publish_date <= last_read_date) {
				this.entries[i].read = true;
				changed++;
			} else {
			}
			
		}
		if (changed > 0) {
			this.$.list.refresh();
		}		
	},
	
	sortEntries: function() {
		this.entries.sort(function(a,b){
			return b.service_id - a.service_id; // newest first
		});
	},
	
	setupRow: function(inSender, inIndex) {
		if (this.entries[inIndex]) {
			var entry = this.entries[inIndex];
			this.$.item.setEntry(entry);
			return true;
		}
	},
	entryClick: function(inSender, inEvent, inRowIndex) {
		this.$.entryClickPopup.showAtEvent(this.entries[inRowIndex], inEvent);
	},
	scrollToTop: function(inSender, inEvent){
		this.$.list.punt();
	},
	scrollToBottom: function(){
		//this.$.list.$.scroller.scrollToBottom();
	},
	resizeHandler: function(inHeight) {
		this.$.list.applyStyle("height", window.innerHeight - 93 + "px"); // - 117 for fatter toolbars.
        enyo.forEach (this.getComponents(), function(component) {
			component.resizeHandler && component.resizeHandler();
		});
	},
	rendered: function() {
		this.inherited(arguments);
		if (this.hasNode()) {
			this.$.header.setContent("");
			var headerBounds = this.$.header.getBounds();
			var accountNameBounds = this.$.accountName.getBounds();
			this.$.header.applyStyle("width", accountNameBounds.left - headerBounds.left + "px");
			this.$.header.setContent(_.capitalize(this.info.type));
		}
	},
	refreshList: function(){
		this.$.list.refresh();
		
		if(this.info.type === SPAZ_COLUMN_FAVORITES){
			this.entries = [];
			this.loadData();
		}
	},
	
	getColAttr: function() {
		return {type: this.info.type, accounts: this.info.accounts, query: this.info.query };
	},
	
	getHash: function() {
		return sch.MD5(JSON.stringify(this.getColAttr()));
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
	}
});
