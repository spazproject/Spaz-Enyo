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
		{name: "list", kind: "VirtualRepeater", onGetItem: "setupRow", components: [
			{name: "item", kind: "Spaz.Entry", onEntryClick: "entryClick"}
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
        this.entries.push(entry);
        
        //this.$.list.renderRow(this.entries.length-1);
       	this.$.list.render();

	},
	setupRow: function(inSender, inIndex){
		if(this.entries[inIndex]){
			this.$.item.setEntry(this.entries[inIndex]);
			return true;
		}
	},
	entryClick: function(inSender, inEvent){
		this.$.entryClickPopup.showAtEvent(inSender.entry, inEvent);
	},
	
	clearConversationMessages: function() {
	    this.entries = [];
	    this.$.list.render();
	}
})