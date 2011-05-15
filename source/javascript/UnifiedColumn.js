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

		// try {
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
				case 'unified':
					loadStarted();
					self.twit.getCombinedTimeline({
							home_count:200,
							replies_count:80,
							dm_count:100,
							dmsent_count:100
						},
						function(data) {
							self.processData(data);
							loadFinished();
						},
						function() {
							loadFinished();
						}
					);
					break;
			}


		// } catch(e) {
		// 	console.error(e);
		// 	AppUtils.showBanner('you probably need to make an account');
		// }
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
});
