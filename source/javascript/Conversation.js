enyo.kind({
	name: "Spaz.Conversation",
	kind: "VFlexBox",
	events: {
		onStart: "",
		onEntryLoaded: "",
		onSuccess: "",
		onDone: "",
		onError: ""
	},
	published: {
		entry: {}
	},
	components: [
		/*{name: "list", kind: "Spaz.VirtualList", flex: 1, style: "background-color: #D8D8D8;min-height: 150px;", horizontal: false, className: "conversation list", onSetupRow: "setupRow", components: [
			{name: "item", kind: "Spaz.Entry", onclick: "entryClick"}
		]}*/
		{name: "list", kind: "VirtualRepeater", onSetupRow: "setupRow", components: [
			{name: "item", kind: "Spaz.Entry", ignoreUnread: true, onEntryClick: "entryClick", onEntryHold: "entryHold"}
		]},
		//{name: "list", className: "conversation list", components: []},
		
		{name: "entryClickPopup", kind: "Spaz.EntryClickPopup"}

	],
	
	entries: [],
	
	create: function() {
		this.inherited(arguments);
	},
	
	entryChanged: function() {
		this.clearConversationMessages();
	},
	
	loadConversation: function() {
		var self = this;
		
		if(!self.entry.in_reply_to_id) {
			this.clearConversationMessages();
			return false;
		}
		
		if(self.entries.length > 0) {
			return true; //Conversation already loaded
		}
		
		self.doStart();
		
		self.twit = AppUtils.makeTwitObj(self.entry.account_id);
		
		self.twit.getOne(self.entry.in_reply_to_id, onRetrieved, function() {
			self.doError();
			self.doDone();
		});
		
		function onRetrieved(status_obj) {
			var child = AppUtils.convertToEntry(status_obj);
			child = AppUtils.setAdditionalEntryProperties([child], self.entry.account_id)[0];
			
			self._addEntry(child);
			
			self.doEntryLoaded(child);
			
			if(child.in_reply_to_id) {
				self.twit.getOne(child.in_reply_to_id, onRetrieved, function() {
					self.doError();
					self.doDone();
				});
			} else {
				self.doSuccess();
				self.doDone();
			}
		};
	},
	
	_addEntry: function(entry) {
		// Make sure the entry gets the account id, needed for reposting. Dunno if
		// this is the right place to add this - seems kinda hackish.
		this.entries.push(enyo.mixin(entry, {account_id: this.entry.account_id}));
		
		//this.$.list.renderRow(this.entries.length-1);
		this.$.list.render();

	},
	setupRow: function(inSender, inIndex){
		if(this.entries[inIndex]){
			this.$.item.setEntry(this.entries[inIndex]);
			return true;
		}
	},
	entryClick: function(inSender, inEvent, inRowIndex) {
		if(App.Prefs.get("entry-tap") === "panel"){
			AppUI.viewEntry(inSender.entry);
		} else {
			this.$.entryClickPopup.showAtEvent(inSender.entry, inEvent);	
		}

	},
	entryHold: function(inSender, inEvent, inRowIndex) {
		if(App.Prefs.get("entry-hold") === "popup"){
			this.$.entryClickPopup.showAtEvent(inSender.entry, inEvent);	
		} else if(App.Prefs.get("entry-hold") === "panel"){
			AppUI.viewEntry(inSender.entry);
		}
	},
	clearConversationMessages: function() {
		this.entries = [];
		this.$.list.render();
	}
});
