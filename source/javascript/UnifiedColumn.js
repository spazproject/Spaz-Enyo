enyo.kind({
	name: "Spaz.UnifiedColumn",
	kind: "Spaz.Column",
	create: function(){
		this.inherited(arguments);	
	},
	model : {
		'home_entries':[],
		'mentions':[],
		'to_dms':[],
		'from_dms':[]
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
			var home_since_id, replies_since_id, dm_since_id, dmsent_since_id;
			home_since_id = replies_since_id = dm_since_id = dmsent_since_id = 1;
			var account = App.Users.get(self.info.accounts[0]);
			var auth = new SpazAuth(account.type);
			auth.load(account.auth);

			self.twit = new SpazTwit();
			self.twit.setBaseURLByService(account.type);
			self.twit.setSource(App.Prefs.get('twitter-source'));
			self.twit.setCredentials(auth);

			if (this.entries.length > 0) {
				if (opts.mode === 'newer') {
					home_since_id = this.getMaxIdOfType(SPAZCORE_SECTION_HOME);
					replies_since_id = this.getMaxIdOfType(SPAZCORE_SECTION_REPLIES);
					dm_since_id = this.getMaxIdOfType(SPAZCORE_SECTION_DMS);
					dmsent_since_id = this.getMaxIdOfType(SPAZCORE_SECTION_DMSENT);
					// mark all existing as read
					this.markAllAsRead();
				}

				if (opts.mode === 'older') {
					home_since_id = '-' + this.getMinIdOfType(SPAZCORE_SECTION_HOME);
					replies_since_id = '-' + this.getMinIdOfType(SPAZCORE_SECTION_REPLIES);
					dm_since_id = '-' + this.getMinIdOfType(SPAZCORE_SECTION_DMS);
					dmsent_since_id = '-' + this.getMinIdOfType(SPAZCORE_SECTION_DMSENT);
				}
			}

			var dataLength;
			function loadStarted() {
				self.$.refresh.addClass("spinning");
				self.doLoadStarted();

				dataLength = self.entries.length;

			}
			function loadFinished() {
				self.$.refresh.removeClass("spinning");
				self.doLoadFinished();

				if(dataLength !== self.entries.length){
					if(App.Prefs.get("timeline-scrollonupdate")){
						
						self.$.list.punt();

						//go to first unread
						self.setScrollPosition();
						self.$.list.refresh();	
					}
				}
			}
			switch (self.info.type) {
				case 'unified':
				case 'home':
					loadStarted();
					self.twit.getCombinedTimeline({
							'home_count':200,
							'replies_count':80,
							'dm_count':100,
							'dmsent_count':100,
							'home_since':home_since_id,
							'replies_since':replies_since_id,
							'dm_since':dm_since_id,
							'dmsent_since':dmsent_since_id
						},
						function(data) {
							self.processData(data, opts);
							loadFinished();
						},
						function() {
							loadFinished();
						}
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
			switch (this.info.type) {
				default:
					console.time('unify_process');
					/* check for duplicates based on the .id property */
					/* we do this before conversion to save converting stuff
					   that won't be needed */
					console.time('unify_process_reject');
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
						return false;
					});
					console.timeEnd('unify_process_reject');


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
				

					this.entries = [].concat(data.reverse(), this.entries);
					this.entries.sort(function(a,b){
						return b.publish_date - a.publish_date; // newest first by date
					});
					enyo.log("Sorted by publish date. length now "+this.entries.length);
				
				
					var last_home_entry = this.getLastHomeTimelineEntry();
					enyo.log("last_home_entry.publish_date", last_home_entry.publish_date);
				
					console.time('unify_process_reject2');
					this.entries = _.reject(this.entries, function(item) {
						if ((item.publish_date < last_home_entry.publish_date)
								&& (item._orig.SC_timeline_from !== SPAZCORE_SECTION_HOME)) {
							return true;
						}
					});
					console.timeEnd('unify_process_reject2');
				
					enyo.log("rejected non-home items with older pub date. length now "+this.entries.length);
				
					enyo.log('current HOME entries:'+this.getHomeEntries().length);
					enyo.log('current MENTION entries:'+this.getMentionEntries().length);
					enyo.log('current DMS entries:'+this.getDMEntries().length);
					enyo.log('current DMSENT entries:'+this.getDMSentEntries().length);
				
					/* add more entry properties */
					this.entries = AppUtils.setAdditionalEntryProperties(this.entries, this.info.accounts[0]);
				
					this.$.list.refresh();
					this.resizeHandler();
					console.timeEnd('unify_process');
					break;
			}
		}

		this.markOlderAsRead();
		
		this.setLastRead();
		
		this.notifyOfNewEntries();

	},
	
	
	getLastHomeTimelineEntry : function() {
		
		var entries = this.getHomeEntries();
		var last_home_entry = "999999999999999999999999999999999";
		
		if (entries.length > 0) {
			last_home_entry = _.min(entries, function(item) {
				return item.service_id;
			});			
		}
		
		return last_home_entry;
	},
	
	
	
	getMaxIdOfType : function(type) {
		
		var entries = this.getEntriesOfType(type);
		
		var rs = _.max(entries, function(entry) {
			if (entry._orig.SC_timeline_from === type) {
				return entry.service_id;
			} else {
				return '1'; // this will always be more than a numeric string
			}
		});
		if (rs) {
			return rs.service_id;
		} else {
			return '1';
		}
	},
	
	
	
	getMinIdOfType : function(type) {
		
		var entries = this.getEntriesOfType(type);
		
		var rs = _.min(entries, function(entry) {
			if (entry._orig.SC_timeline_from === type) {
				return entry.service_id;
			} else {
				return 'AAAAAA'; // this will always be more than a numeric string
			}
		});
		if (rs) {
			return rs.service_id;
		} else {
			return '999999999999999999999999999999';
		}
	},
	
	
	getEntriesOfType : function(type) {
		var entries = [];
		
		switch(type) {
			case SPAZCORE_SECTION_HOME:
				entries = this.getHomeEntries();
				break;
			case SPAZCORE_SECTION_REPLIES:
				entries = this.getMentionEntries();
				break;
			case SPAZCORE_SECTION_DMS:
				entries = this.getDMEntries();
				break;
			case SPAZCORE_SECTION_DMSENT:
				entries = this.getDMSentEntries();
				break;
		}
		return entries;
	},
	
	getHomeEntries : function() {
		return _.select(this.entries, function(entry) {
			return entry._orig.SC_timeline_from === SPAZCORE_SECTION_HOME;
		});
	},
	getMentionEntries : function() {
		return _.select(this.entries, function(entry) {
			return entry._orig.SC_timeline_from === SPAZCORE_SECTION_REPLIES;
		});
	},
	getDMEntries : function() {
		return _.select(this.entries, function(entry) {
			return entry._orig.SC_timeline_from === SPAZCORE_SECTION_DMS;
		});
	},
	getDMSentEntries : function() {
		return _.select(this.entries, function(entry) {
			return entry._orig.SC_timeline_from === SPAZCORE_SECTION_DMSENT;
		});
	}
	
});
