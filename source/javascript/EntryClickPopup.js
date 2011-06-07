enyo.kind({
	name: "Spaz.EntryClickPopup",
	kind: "Popup",
	scrim: true,
	events: {
		onClose: "",
		onShare: ""
	},
	components: [
		{name: "menu", kind: "enyo.Menu"}
	],
	create: function(){
		this.inherited(arguments);
		this.entry = null;
	},
	detailsClicked: function(inSender) {
		AppUI.viewEntry(this.entry);
	},
	replyClicked: function(inSender) {
		AppUI.reply(this.entry);
	},
	favoriteClicked: function(inSender) {
		var account = App.Users.get(this.entry.account_id);
		var auth = new SpazAuth(account.type);
		auth.load(account.auth);
			
		var twit =new SpazTwit();
		twit.setBaseURLByService(account.type);
		twit.setSource(App.Prefs.get('twitter-source'));
		twit.setCredentials(auth);
			
		if (this.entry.is_favorite) {
			console.log('UNFAVORITING %j', this.entry);
			twit.unfavorite(
				this.entry.service_id,
				enyo.bind(this, function(data) {
					this.entry.is_favorite = false;
					AppUtils.showBanner($L('Removed favorite'));
					AppUI.rerenderTimelines();
				}),
				function(xhr, msg, exc) {
					AppUtils.showBanner($L('Error removing favorite'));
				}
			);
		} else {
			console.log('FAVORITING %j', this.entry);
			twit.favorite(
				this.entry.service_id,
				enyo.bind(this, function(data) {
					this.entry.is_favorite = true;
					AppUtils.showBanner($L('Added favorite'));
					AppUI.rerenderTimelines();
					
				}),
				function(xhr, msg, exc) {
					AppUtils.showBanner($L('Error adding favorite'));
				}
			);
		}
	},
	repostClicked: function(inSender) {
		AppUI.repost(this.entry);
	},
	editRepostClicked: function(inSender) {
		AppUI.repostManual(this.entry);
	},
	showAtEvent: function(inEntry, inEvent){
		if(this.lazy) {
			this.validateComponents();
		}
		this.entry = inEntry;
		
		enyo.forEach (this.$.menu.getControls(), function (control) {
			 control.destroy();
		});
		this.$.menu.openAtEvent(inEvent);
				
		var components = [
			{name: "details", owner: this, caption: "Details", onclick: "detailsClicked"},
			{name: "reply", owner: this, caption: "Reply", onclick: "replyClicked"}
		];
		
		if(this.entry.is_favorite){
			components.push({name: "unfavorite", owner: this, caption: "Unfavorite", onclick: "favoriteClicked"});
		} else if(!this.entry.is_private_message){
			components.push({name: "favorite", owner: this, caption: "Favorite", onclick: "favoriteClicked"});
		}
		
		components.push({name: "shareMenu", owner: this, caption: "Share", components: [
			{name: "repost", owner: this, caption: "Repost", onclick: "repostClicked"},
			{name: "editRepost", owner: this, caption: "Edit & Repost", onclick: "editRepostClicked"}
		]});
		
		this.$.menu.createComponents(components);
		this.$.menu.render();
	}
});
