enyo.kind({
	name: "Spaz.SearchPopup",
	kind: "Popup",
	scrim: true,
	modal: true,
	width: "400px",
	events: {
		onClose: ""
	},
	components: [
		{layoutKind: "HFlexLayout", components: [
			{content: "Search"},
			{kind: "Spacer"},
			{kind: "ToolButton", icon: "source/images/icon-close.png", style: "position: relative; bottom: 7px;", onclick: "doClose"}
		]},	
		{kind: "HFlexBox", components: [
			{name:"postTextBox", kind: "RichText", alwaysLooksFocused: true, richContent: false, multiline: false, flex: 1, onkeydown: "searchBoxKeydown"},
		]},
		{name: "searchResultsList", kind: "VirtualRepeater", onGetItem: "getItem", components: [
	        {kind: "Item", layoutKind: "HFlexLayout", components: [
	            {name: "caption", flex: 1},
	        ]}
	    ]}	
	],
	create: function(){
		this.inherited(arguments);
	},
	"showAtCenter": function(){
		 this.openAtCenter();
	},
	searchBoxKeydown: function(inSender, inEvent) {
		if (inEvent.keyCode === 13) {
			// Enter to send - this should be a pref evenutally.
			this.search();
			inEvent.preventDefault();	
			
		}
	},
	search: function(inValue){
		var searchTerm = inValue || this.$.postTextBox.getValue();

	},
});