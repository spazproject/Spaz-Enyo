enyo.kind({
	name: "Spaz.EntryClickPopup",
	kind: "Popup",
	scrim: true,
	events: {
		onClose: "",
		onShare: ""
	},
	components: [
		{name: "popup", kind: "PopupList", onSelect: "itemSelect", items: [
			"Details",
			"Reply",
			"Repost",
			"Edit & Repost",
			"Share"
		]}
	],
	create: function(){
		this.inherited(arguments);
		this.entry = null;
	},
	itemSelect: function(inSender, inIndex){

		switch(this.$.popup.getItems()[inIndex]){
			case "Details":
				AppUI.viewEntry(this.entry);
				this.$.popup.close();
				break;
			case "Reply":
				AppUI.reply(this.entry);
				this.$.popup.close();
				break;
			case "Repost":
				AppUI.repost(this.entry);
				this.$.popup.close();
				break;
			case "Edit & Repost":
				AppUI.repostManual(this.entry);
				this.$.popup.close();
				break;
			case "Share":
				AppUtils.showBanner($L('Not yet implemented'));
				break;
			case "Favorite":
			case "Unfavorite":
				var that = this;
				var account = App.Users.get(this.entry.account_id);
				var auth = new SpazAuth(account.type);
				auth.load(account.auth);
					
				var twit =new SpazTwit();
				twit.setBaseURLByService(account.type);
				twit.setSource(App.Prefs.get('twitter-source'));
				twit.setCredentials(auth);
					
				if (that.entry.is_favorite) {
					console.log('UNFAVORITING %j', that.entry);
					twit.unfavorite(
						that.entry.service_id,
						function(data) {
							that.entry.is_favorite = false;
							AppUtils.showBanner($L('Removed favorite'));
							AppUI.rerenderTimelines();
						},
						function(xhr, msg, exc) {
							AppUtils.showBanner($L('Error removing favorite'));
						}
					);
				} else {
					console.log('FAVORITING %j', that.entry);
					twit.favorite(
						that.entry.service_id,
						function(data) {
							that.entry.is_favorite = true;
							AppUtils.showBanner($L('Added favorite'));
							AppUI.rerenderTimelines();
							
						},
						function(xhr, msg, exc) {
							AppUtils.showBanner($L('Error adding favorite'));
						}
					);
				}
				break;
			default: 
				console.error(this.$.popup.getItems()[inIndex] + " has no handler");
				break;
		}	
		this.clearEntry();
	},
	showAtEvent: function(inEntry, inEvent){
		if(this.lazy) {
			this.validateComponents();
		}
		this.entry = inEntry;
		var popupItems = [
			"Details",
			"Reply",
			"Repost",
			"Edit & Repost",
			"Share"
		];
		if(this.entry.is_favorite){
			popupItems.push("Unfavorite");
		} else if(!this.entry.is_private_message){
			popupItems.push("Favorite");
		}
		this.$.popup.setItems(popupItems);
		
		this.$.popup.openAtEvent(inEvent);
	},
	getEntry: function() {
		return this.entry;
	},
	clearEntry: function() {
		this.entry = null;
	}
});
