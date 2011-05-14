enyo.kind({
	name: "Spaz.Conversation",
	kind: "VFlexBox",
	published: {
		entry: {}
	},
	components: [
		/*{name: "list", kind: "Spaz.VirtualList", flex: 1, style: "background-color: #D8D8D8;min-height: 150px;", horizontal: false, className: "conversation list", onSetupRow: "setupRow", components: [
			{name: "item", kind: "Spaz.Entry", onclick: "entryClick"}
		]}*/
		{name: "list", className: "conversation list", components: []}
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
		
		self.twit = AppUtils.makeTwitObj(self.entry.account_id);
        
        self.twit.getOne(self.entry.in_reply_to_id, onRetrieved, function() {
            //On Error
        });
        
        function onRetrieved(status_obj) {
            var child = AppUtils.convertToEntry(status_obj);
            
            self._addEntry(child);
            
            if(child.in_reply_to_id)
                self.twit.getOne(child.in_reply_to_id, onRetrieved, function() {
                    //On Error
                });
        };
	},
	
	_addEntry: function(entry) {
        this.entries.push(entry);
        
        var item = this.$.list.createComponent({kind: "Spaz.Entry"}, {owner: this.$.list});
        item.setEntry(entry);

	    this.$.list.render();
	},
	
	clearConversationMessages: function() {
	    this.entries = [];
	    this.$.list.destroyComponents();
	},
	
	entryClick: function(inSender, inEvent, inRowIndex) {}
})