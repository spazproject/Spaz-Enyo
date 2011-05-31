enyo.kind({
	name: "Spaz",
	kind: enyo.HFlexBox,
	components: [
		{
			name: "sidebar", 
			kind: "Spaz.Sidebar", 
			onRefreshAll: "refreshAll", 
			onCreateColumn: "createColumn",
			onAccountAdded: "accountAdded",
			onAccountRemoved: "accountRemoved"
		},
		{
			name: "container", 
			kind: "Spaz.Container", 
			onRefreshAllFinished: "refreshAllFinished",
			onShowAccountsPopup: "showAccountsPopup"
		},
		{
			name: "imageViewPopup",
			kind: "Spaz.ImageViewPopup",
			onClose: "closeImageView"
		},
		{name: "dashboard", kind:"Dashboard", onIconTap: "", onMessageTap: "messageTap", onIconTap: "iconTap", 
					onUserClose: "dashboardClose", onLayerSwipe: "layerSwiped"}
	],
	
	twit: new SpazTwit(),
	
	initAppObject: function(prefsLoadedCallback) {
		/**
		 * initialize the App object
		 */
		window.App = {};

		var self = this;
		
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
		
	},

	create: function(){
		var self = this
		  , inheritedArgs = arguments;

		// init window.App
		self.initAppObject(function() {
		    self.inherited(inheritedArgs);
		});

		self.bindGlobalListeners();

		AppUI.addFunction("viewUser", function(inUsername, inService, inAccountId){
			this.showUserView(this, inUsername, inService, inAccountId);
		}, this);
		AppUI.addFunction("viewEntry", function(inEntry){
			this.showEntryView(this, inEntry);
		}, this);
		AppUI.addFunction("compose", function(inText, inAccountId){
			this.compose(this, inText, inAccountId);
		}, this);
		AppUI.addFunction("reply", function(inEntry){
			this.reply(this, inEntry);
		}, this);
		AppUI.addFunction("repost", function(inEntry){
			this.repost(this, inEntry);
		}, this);
		AppUI.addFunction("repostManual", function(inEntry){
			this.repostManual(this, inEntry);
		}, this);
		AppUI.addFunction("directMessage", function(inUsername, inAccountId){
			this.directMessage(this, inUsername, inAccountId);
		}, this);
		//self.inherited(arguments);
	},

	showEntryView: function(inSender, inEntry){
		console.log("showing entryView");
		if(!this.$.entryview){
			
			this.createComponent({
				name: "entryview", 
				kind: "Spaz.EntryView", 
				onDestroy: "destroyEntryView" ,
				onAddViewEvent: "addViewEvent",
				onGoPreviousViewEvent: "goPreviousViewEvent",
				onShowImageView: "showImageView"
			}, {owner: this});
			this.$.entryview.render();
			
			//this.$.container.refreshList();

		} 
		if(this.$.userview){
			this.destroyUserView(true);
		}
		this.$.entryview.setEntry(inEntry);
		
	},

	"destroyEntryView": function(inSender, inEvent){
		this.$.entryview.destroy();
		if(inSender !== true){
			this.viewEvents = [];
		}

		//this.render();
		//this.$.container.refreshList();
	},
	
	showUserView: function(inSender, inUsername, inService, inAccountId) {
		console.log("showing entryView");
		if(!this.$.userview){
			this.createComponent(
				{
					name: "userview", 
					kind: "Spaz.UserView", 
					onDestroy: "destroyUserView",
					onAddViewEvent: "addViewEvent",
					onGoPreviousViewEvent: "goPreviousViewEvent"
				}, 
				{owner: this}
			);
			this.$.userview.render();			
			//this.$.container.refreshList();

		} 
		if(this.$.entryview){
			this.destroyEntryView(true);
		}
		this.$.userview.showUser(inUsername, inService, inAccountId);
			
	},
	"destroyUserView": function(inSender, inEvent){
		this.$.userview.destroy();
		if(inSender !== true){
			this.viewEvents = [];
		}
		//this.render();
		//this.$.container.refreshList();
	},
	viewEvents: [],
	addViewEvent: function(inSender, inEvent){
		this.viewEvents.push(inEvent);
		return this.viewEvents;
		console.log("pushed event");
		console.log(inEvent);		
	},
	goPreviousViewEvent: function(inSender){
		this.viewEvents.pop(); //get rid of current level
		var event = this.viewEvents.pop(); // get rid of the level you are going to. it will be re-added automatically 
		switch(event.type){
			case "user":
				AppUI.viewUser(event.user.username, event.user.type, event.user.account_id);
				break;
			case "entry":
			case "message":
				AppUI.viewEntry(event.entry);
				break;
		}
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
	
	// To keep the reply/dm logic in one place, components only pass up
	// onReply events, and we'll figure out here whether that should be
	// handled as a reply or as a dm.
	compose: function (inSender, inText, inAccountId) {
		this.$.sidebar.compose({
			'text':inText,
			'account_id':inAccountId
		});
	},
	reply: function(inSender, inEntry) {
		if (inEntry.is_private_message) {
			this.$.sidebar.directMessage({
				'to':inEntry.author_username,
				'text':null,
				'entry':inEntry,
				'account_id':inEntry.account_id
			});
		} else {
			this.$.sidebar.replyTo({
				'entry':inEntry,
				'account_id':inEntry.account_id
			});
		}
	},
	repost: function(inSender, inEntry) {
		if (inEntry.is_private_message) {
			AppUtils.showBanner("Private messages cannot be reposted");
		} else {
			this.$.sidebar.repost({
				'entry':inEntry,
				'account_id':inEntry.account_id
			});			
		}
	},
	repostManual: function(inSender, inEntry) {
		if (inEntry.is_private_message) {
			AppUtils.showBanner("Private messages cannot be reposted");
		} else {
			this.$.sidebar.repostManual({
				'entry':inEntry,
				'account_id':inEntry.account_id
			});			
		}
	},
	mention: function(inSender, inEntry) {
		
	},
	directMessage: function(inSender, inUsername, inAccountId) {
		this.$.sidebar.directMessage({
			'to':inUsername,
			'text':null,
			'account_id':inAccountId
		});
	},
	showImageView: function(inSender, inUrls, inIndex) {
		this.$.imageViewPopup.openAtCenter();
		this.$.imageViewPopup.setImages(inUrls, inIndex);
	},
	closeImageView: function(inSender) {
		this.$.imageViewPopup.close();
	},
	accountAdded: function(inSender) {
		this.$.container.accountAdded();
	},
	accountRemoved: function(inSender, inAccountId) {
		this.$.container.removeColummnsForAccount(inAccountId);
	},
	showAccountsPopup: function(inSender) {
		this.$.sidebar.showAccountsPopup();
	},
	
	
	pushDashboard: function(inIcon, inTitle, inText) {
		this.$.dashboard.push({icon:inIcon, title:inTitle, text:inText});
	},
	popDashboard: function() {
		this.$.dashboard.pop();
	},
	messageTap: function(inSender, layer) {
		console.log("Tapped on message: "+layer.text);
	},
	iconTap: function(inSender, layer) {
		console.log("Tapped on icon for message: "+layer.text);
	},
	dashboardClose: function(inSender) {
		console.log("Closed dashboard.");
	},
	layerSwiped: function(inSender, layer) {
		console.log("Swiped layer: "+layer.text);
	}
});
