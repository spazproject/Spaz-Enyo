enyo.kind({
	name: "Spaz.Conversation",
	kind: "VFlexBox",
	published: {
		entry: {}
	},
	components: [
		{name: "list", kind: "Spaz.VirtualList", flex: 1, style: "background-color: #D8D8D8; margin: 0px 3px; min-height: 50px;", horizontal: false, className: "conversation list", onSetupRow: "setupRow", components: [
			{name: "item", kind: "Spaz.Entry", onclick: "entryClick"}
		]}
	],
	
	entries: [],
	conversationLoaded: false,
	
	create: function() {
		this.inherited(arguments);
	},
	
	entryChanged: function() {
	    if(conversationLoaded)
	        this.loadConversation();
	},
	
	loadConversation: function(opts) {

		opts = sch.defaults({
		}, opts);

		var self = this;
		
		
	},
	
	entryClick: function(inSender, inEvent, inRowIndex) {}
})