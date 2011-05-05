enyo.kind({
	name: "Spaz",
	kind: enyo.HFlexBox,
	height: "100%",
	components: [
		{name: "sidebar", kind: "Spaz.Sidebar"},
		{name: "container", kind: "Spaz.Container", onShowEntryView: "showEntryView"},
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


		App.username = null;
		App.prefs = null;
		
		App.accounts = null;


		/*
			load our prefs
			default_preferences is from default_preferences.js, loaded in index.html
		*/
		App.prefs = new SpazPrefs(SPAZ_DEFAULT_PREFS, null, {
			'timeline-maxentries': {
				'onGet': function(key, value){
					if (App.prefs.get('timeline-friends-getcount') > value) {
						value = App.prefs.get('timeline-friends-getcount');
					}
					sch.debug(key + ':' + value);
					return value;
				},
				'onSet': function(key, value){
					if (App.prefs.get('timeline-friends-getcount') > value) {
						value = App.prefs.get('timeline-friends-getcount');
					}
					sch.debug(key + ':' + value);
					return value;					
				}
			},
			'timeline-maxentries-dm': {
				'onGet': function(key, value){
					if (App.prefs.get('timeline-dm-getcount') > value) {
						value = App.prefs.get('timeline-dm-getcount');
					}
					sch.debug(key + ':' + value);
					return value;
				},
				'onSet': function(key, value){
					if (App.prefs.get('timeline-dm-getcount') > value) {
						value = App.prefs.get('timeline-dm-getcount');
					}
					sch.debug(key + ':' + value);
					return value;					
				}
			},
			'timeline-maxentries-reply': {
				'onGet': function(key, value){
					if (App.prefs.get('timeline-replies-getcount') > value) {
						value = App.prefs.get('timeline-replies-getcount');
					}
					sch.debug(key + ':' + value);
					return value;
				},
				'onSet': function(key, value){
					if (App.prefs.get('timeline-replies-getcount') > value) {
						value = App.prefs.get('timeline-replies-getcount');
					}
					sch.debug(key + ':' + value);
					return value;					
				}
			}
		});
		App.prefs.load(function() {
			App.Users = new SpazAccounts(App.prefs);
			prefsLoadedCallback();
		});
		
		// /*
		// 	model for saving Tweets to Depot. We replace on every start to make sure we don't go over-budget
		// */
		// App.Tweets = new Tweets({
		// 	'replace':false,
		// 	'prefs_obj':this.App.prefs
		// });
		
		// App.master_timeline_model = {
		//     items : []
		// };
		
		// if (!App.cache) {
		// 	App.cache = new TempCache({
		// 		'appObj':this.App
		// 	});
		// }
		
		
		// App.versionCookie = new VersionCookie(this.App.prefs);
		// App.versionCookie.init();

	},

	create: function(){
		var self = this
		  , inheritedArgs = arguments;

		// init window.App
		self.initAppObject(function() {
		    self.inherited(inheritedArgs);
		});

		//self.inherited(arguments);
	},
	showEntryView: function(inSender, inEntry){
		if(!this.$.entryview){
			
			this.createComponent({name: "entryview", kind: "Spaz.EntryView", onDestroy: "destroyEntryView"}, {owner: this});
			this.render();
			
			//this.$.container.refreshList();

		} 
		this.$.entryview.setEntry(inEntry);
		
	},
	"destroyEntryView": function(inSender, inEvent){
		this.$.entryview.destroy();

		//this.render();
		//this.$.container.refreshList();
	},
	resizeHandler: function() {
		this.$.container.resizeHandler();
	}
});