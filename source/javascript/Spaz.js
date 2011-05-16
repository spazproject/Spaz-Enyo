enyo.kind({
	name: "Spaz",
	kind: enyo.HFlexBox,
	components: [
		{name: "sidebar", kind: "Spaz.Sidebar", onRefreshAll: "refreshAll", onCreateColumn: "createColumn"},
		{name: "container", kind: "Spaz.Container", onShowUserView: "showUserView", onShowEntryView: "showEntryView", onReply: "reply", onDirectMessage: "directMessage", onRefreshAllFinished: "refreshAllFinished"},
	],
	
	twit: new SpazTwit(),
	
	initAppObject: function(prefsLoadedCallback) {
		/**
		 * initialize the App object
		 */
		window.App = {};

		var self = this;
	
		console.log('INITIALIZING EVERYTHING');
		
		/*
			Remap JSON parser because JSON2.js one was causing probs with unicode
		*/
		sc.helpers.deJSON = function(str) {
			try {
				var obj = JSON.parse(str);
				return obj;
			} catch(e) {
				console.error('There was a problem decoding the JSON string');
				console.error('Here is the JSON string: '+str);
				return null;
			}

		};
		sc.helpers.enJSON = function(obj) {
			var json = JSON.stringify(obj);
			return json;
		};


		// App.search_cards = [];
		// App.new_search_card = 0;
		// App.search_card_prefix = "searchcard_";

		if (SPAZCORE_CONSUMERKEY_TWITTER) {
			SpazAuth.addService(SPAZCORE_ACCOUNT_TWITTER, {
				authType: SPAZCORE_AUTHTYPE_OAUTH,
				consumerKey: SPAZCORE_CONSUMERKEY_TWITTER,
				consumerSecret: SPAZCORE_CONSUMERSECRET_TWITTER,
				accessURL: 'https://twitter.com/oauth/access_token'
		    });
		} else {
			console.error('SPAZCORE_CONSUMERKEY_TWITTER not set, will not be able to authenticate against Twitter');
		}

		App.Prefs = null;
		
		/*
			load our prefs
			default_preferences is from default_preferences.js, loaded in index.html
		*/
		App.Prefs = new SpazPrefs(SPAZ_DEFAULT_PREFS, null, {
			'timeline-maxentries': {
				'onGet': function(key, value){
					if (App.Prefs.get('timeline-friends-getcount') > value) {
						value = App.Prefs.get('timeline-friends-getcount');
					}
					sch.debug(key + ':' + value);
					return value;
				},
				'onSet': function(key, value){
					if (App.Prefs.get('timeline-friends-getcount') > value) {
						value = App.Prefs.get('timeline-friends-getcount');
					}
					sch.debug(key + ':' + value);
					return value;					
				}
			},
			'timeline-maxentries-dm': {
				'onGet': function(key, value){
					if (App.Prefs.get('timeline-dm-getcount') > value) {
						value = App.Prefs.get('timeline-dm-getcount');
					}
					sch.debug(key + ':' + value);
					return value;
				},
				'onSet': function(key, value){
					if (App.Prefs.get('timeline-dm-getcount') > value) {
						value = App.Prefs.get('timeline-dm-getcount');
					}
					sch.debug(key + ':' + value);
					return value;					
				}
			},
			'timeline-maxentries-reply': {
				'onGet': function(key, value){
					if (App.Prefs.get('timeline-replies-getcount') > value) {
						value = App.Prefs.get('timeline-replies-getcount');
					}
					sch.debug(key + ':' + value);
					return value;
				},
				'onSet': function(key, value){
					if (App.Prefs.get('timeline-replies-getcount') > value) {
						value = App.Prefs.get('timeline-replies-getcount');
					}
					sch.debug(key + ':' + value);
					return value;					
				}
			}
		});
		App.Prefs.load(function() {
			App.Users = new SpazAccounts(App.Prefs);
			prefsLoadedCallback();
		});
		
		// /*
		// 	model for saving Tweets to Depot. We replace on every start to make sure we don't go over-budget
		// */
		// App.Tweets = new Tweets({
		// 	'replace':false,
		// 	'prefs_obj':this.App.Prefs
		// });
		
		// App.master_timeline_model = {
		//     items : []
		// };
		
		// if (!App.cache) {
		// 	App.cache = new TempCache({
		// 		'appObj':this.App
		// 	});
		// }
		
		
		// App.versionCookie = new VersionCookie(this.App.Prefs);
		// App.versionCookie.init();

	},
	
	/**
	 * this binds DOM event listeners
	 * used throughout the app 
	 */
	bindGlobalListeners: function() {
		
		
		$('a[href]').live('click', function(e) {
			sc.helpers.openInBrowser(this.getAttribute('href'));
			event.preventDefault();
			return false;
		});
		
		$('span.username.clickable').live('click', function(e) {
			
		});
		
		AppUtils.showBanner('Bound global listeners');
		
	},

	create: function(){
		var self = this
		  , inheritedArgs = arguments;

		// init window.App
		self.initAppObject(function() {
		    self.inherited(inheritedArgs);
		});

		self.bindGlobalListeners();


		//self.inherited(arguments);
	},
	showEntryView: function(inSender, inEntry){
		console.log("showing entryView");
		if(!this.$.entryview){
			
			this.createComponent({name: "entryview", kind: "Spaz.EntryView", onDestroy: "destroyEntryView"}, {owner: this});
			this.$.entryview.render();
			
			//this.$.container.refreshList();

		} 
		this.$.entryview.setEntry(inEntry);
		
	},

	"destroyEntryView": function(inSender, inEvent){
		this.$.entryview.destroy();

		//this.render();
		//this.$.container.refreshList();
	},
	showUserView: function(inSender, inUsername, inService, inAccountId) {
		console.log("showing entryView");
		if(!this.$.userview){
			var noUserView = true;
			this.createComponent({name: "userview", kind: "Spaz.UserView", onDestroy: "destroyUserView"}, {owner: this});
			
			//this.$.container.refreshList();

		} 
		this.$.userview.showUser(inUsername, inService, inAccountId, enyo.bind(this, function(){
			if(noUserView){
				this.$.userview.render();			
			}
		}));
		
	},
	
	"destroyUserView": function(inSender, inEvent){
		this.$.userview.destroy();

		//this.render();
		//this.$.container.refreshList();
	},
	createColumn: function(inSender, inAccountId, inColumn, inQuery){
		this.$.container.createColumn(inAccountId, inColumn, inQuery);	
	},
	resizeHandler: function() {
		this.$.container.resizeHandler();
	},
	
	refreshAll: function() {
		this.$.container.refreshAll();
	},
	
	refreshAllFinished: function() {
		this.$.sidebar.refreshAllFinished();
	},
	
	reply: function(inSender, inOpts) {
		this.$.sidebar.$.composePopup.replyTo(inOpts);
	},

	directMessage: function(inSender, inOpts) {
		this.$.sidebar.$.composePopup.directMessage(inOpts);
	}
});
